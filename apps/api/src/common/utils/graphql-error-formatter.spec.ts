import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import { GraphQLError } from "graphql";
import type { GraphQLFormattedError } from "graphql";

import { formatGraphQLError } from "./graphql-error-formatter";

// Apollo hands the formatter the already-formatted error alongside the raw one,
// which for a resolver failure is a GraphQLError wrapping the thrown exception.
// The path matters: `unwrapResolverError` only unwraps an error raised while
// resolving a field.
const asApolloPair = (thrown: unknown) => {
  const wrapped = new GraphQLError("boom", {
    originalError: thrown as Error,
    path: ["someOperation"],
  });
  const formatted: GraphQLFormattedError = {
    message: thrown instanceof Error ? thrown.message : "boom",
    path: ["someOperation"],
    extensions: { code: "INTERNAL_SERVER_ERROR", stacktrace: ["at somewhere"] },
  };
  return [formatted, wrapped] as const;
};

describe("formatGraphQLError", () => {
  it("publishes the domain code carried by an object payload", () => {
    const [formatted, raw] = asApolloPair(
      new ConflictException({
        code: "REQUEST_ALREADY_EXISTS",
        message:
          "A pending organization request already exists for this email.",
      }),
    );

    const result = formatGraphQLError(formatted, raw);

    expect(result.extensions?.code).toBe("REQUEST_ALREADY_EXISTS");
    expect(result.extensions?.originalError).toEqual({
      statusCode: 409,
      code: "REQUEST_ALREADY_EXISTS",
      message: "A pending organization request already exists for this email.",
    });
    expect(result.message).toBe(
      "A pending organization request already exists for this email.",
    );
  });

  it("keeps the activation token codes the browser branches on", () => {
    for (const code of [
      "ACTIVATION_TOKEN_USED",
      "ACTIVATION_TOKEN_EXPIRED",
      "ACTIVATION_TOKEN_INVALID",
      "PASSWORD_TOO_OBVIOUS",
    ]) {
      const [formatted, raw] = asApolloPair(
        new BadRequestException({ code, message: "nope" }),
      );
      expect(formatGraphQLError(formatted, raw).extensions?.code).toBe(code);
    }
  });

  it("maps a status to an Apollo code when the payload carries none", () => {
    const [formatted, raw] = asApolloPair(new UnauthorizedException());
    const result = formatGraphQLError(formatted, raw);

    expect(result.extensions?.code).toBe("UNAUTHENTICATED");
    expect(result.extensions?.originalError).toEqual({
      statusCode: 401,
      message: "Unauthorized",
    });
  });

  it("exposes the password-change requirement as a forbidden domain code", () => {
    const [formatted, raw] = asApolloPair(
      new ForbiddenException({
        code: "CHANGE_PASSWORD_REQUIRED",
        message: "Set a new password before using this account.",
      }),
    );
    const result = formatGraphQLError(formatted, raw);

    expect(result.extensions?.code).toBe("CHANGE_PASSWORD_REQUIRED");
    expect(
      (result.extensions?.originalError as { statusCode: number }).statusCode,
    ).toBe(403);
  });

  it("keeps a string payload readable as its own message", () => {
    // Several services throw the message code as a bare string, and callers
    // such as useCpdPduProgress match on the message text.
    const [formatted, raw] = asApolloPair(
      new BadRequestException("CPD_PLAN_DUPLICATE"),
    );
    const result = formatGraphQLError(formatted, raw);

    expect(result.message).toBe("CPD_PLAN_DUPLICATE");
    expect(result.extensions?.code).toBe("BAD_REQUEST");
  });

  it("preserves the validation-pipe message list", () => {
    const [formatted, raw] = asApolloPair(
      new BadRequestException({
        message: ["password is too short"],
        error: "Bad Request",
        statusCode: 400,
      }),
    );
    const result = formatGraphQLError(formatted, raw);

    expect(result.extensions?.code).toBe("BAD_REQUEST");
    expect(
      (result.extensions?.originalError as { message: string[] }).message,
    ).toEqual(["password is too short"]);
  });

  it("never returns a stack trace for a handled exception", () => {
    const [formatted, raw] = asApolloPair(
      new ConflictException({ code: "X", message: "y" }),
    );
    expect(
      formatGraphQLError(formatted, raw).extensions?.stacktrace,
    ).toBeUndefined();
  });

  it("replaces an unmapped failure instead of leaking its detail", () => {
    const leaky = new Error(
      "Invalid `prisma.user.findUnique()` invocation in C:\\repo\\src\\service.ts:54\nCan't reach database server at `db.internal.example.com:5432`",
    );
    const [formatted, raw] = asApolloPair(leaky);

    const result = formatGraphQLError(formatted, raw);

    expect(result.message).toBe("Internal server error.");
    expect(result.extensions).toEqual({ code: "INTERNAL_SERVER_ERROR" });
    expect(JSON.stringify(result)).not.toContain("db.internal.example.com");
    expect(JSON.stringify(result)).not.toContain("service.ts");
  });

  it("passes through a request-shaped Apollo error untouched apart from the stack", () => {
    const formatted: GraphQLFormattedError = {
      message: 'Cannot query field "nope" on type "Query".',
      extensions: { code: "GRAPHQL_VALIDATION_FAILED", stacktrace: ["at x"] },
    };

    const result = formatGraphQLError(formatted, new GraphQLError("x"));

    expect(result.extensions?.code).toBe("GRAPHQL_VALIDATION_FAILED");
    expect(result.message).toBe('Cannot query field "nope" on type "Query".');
    expect(result.extensions?.stacktrace).toBeUndefined();
  });
});
