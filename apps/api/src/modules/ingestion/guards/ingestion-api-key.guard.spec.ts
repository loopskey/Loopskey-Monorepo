import { ExecutionContext, Logger } from "@nestjs/common";
import { IngestionContentKind } from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";

import * as argon2 from "argon2";

import { IngestionMessageCode } from "@ingestion/enums/message-code.enum";
import { IngestionApiKeyGuard } from "@ingestion/guards/ingestion-api-key.guard";
import { IngestionApiKeyService } from "@ingestion/services/ingestion-api-key.service";
import { formatCredential } from "@ingestion/services/ingestion-credential.util";

jest.setTimeout(60_000);

const PREFIX = "a1b2c3d4e5f6";
const SECRET = "PIz4tS0Nw8gk3fQe1Xr7VmYb2LhDcJuA9pO6sTnKgWc";
const CREDENTIAL = formatCredential(PREFIX, SECRET);

const activeSource = {
  id: "source-1",
  slug: "acme-courses",
  kind: IngestionContentKind.COURSE,
  isActive: true,
  autoPublish: false,
  stalenessWindowDays: 30,
};

const buildContext = (request: Record<string, unknown>) => {
  const response = { setHeader: jest.fn() };
  return {
    context: {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    } as unknown as ExecutionContext,
    request,
    response,
  };
};

const bearer = (credential: string) => ({
  headers: { authorization: `Bearer ${credential}` },
});

describe("IngestionApiKeyGuard", () => {
  let secretHash: string;
  const findUnique = jest.fn();
  const queryRaw = jest.fn();
  const warn = jest.spyOn(Logger.prototype, "warn").mockImplementation();

  const prisma = {
    ingestionApiKey: { findUnique },
    $queryRaw: queryRaw,
  } as unknown as PrismaService;

  const guard = new IngestionApiKeyGuard(new IngestionApiKeyService(prisma));

  const storedKey = (overrides: Record<string, unknown> = {}) => ({
    id: "key-1",
    prefix: PREFIX,
    secretHash,
    expiresAt: null,
    revokedAt: null,
    source: activeSource,
    ...overrides,
  });

  const rejectionOf = async (request: Record<string, unknown>) => {
    const { context, response } = buildContext(request);
    const error = await guard.canActivate(context).catch((thrown) => thrown);
    expect(error).toBeInstanceOf(Error);
    return {
      response,
      status: (error as { getStatus: () => number }).getStatus(),
      body: (
        error as { getResponse: () => Record<string, unknown> }
      ).getResponse(),
    };
  };

  beforeAll(async () => {
    secretHash = await argon2.hash(SECRET, { type: argon2.argon2id });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    queryRaw.mockResolvedValue([{ remaining: 599 }]);
  });

  it("attaches the source the credential resolves to", async () => {
    findUnique.mockResolvedValue(storedKey());
    const { context, request } = buildContext(bearer(CREDENTIAL));

    await expect(guard.canActivate(context)).resolves.toBe(true);

    expect(request.ingestion).toEqual({
      keyId: "key-1",
      keyPrefix: PREFIX,
      sourceId: "source-1",
      sourceSlug: "acme-courses",
      kind: IngestionContentKind.COURSE,
      autoPublish: false,
      stalenessWindowDays: 30,
    });
    expect(findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { prefix: PREFIX } }),
    );
  });

  it("gives one unauthorized answer to an unknown prefix, a wrong secret, an expired key and a revoked key", async () => {
    const answers = [];

    findUnique.mockResolvedValue(null);
    answers.push(await rejectionOf(bearer(CREDENTIAL)));

    findUnique.mockResolvedValue(storedKey());
    answers.push(
      await rejectionOf(bearer(formatCredential(PREFIX, "wrong-secret-value"))),
    );

    findUnique.mockResolvedValue(
      storedKey({ expiresAt: new Date(Date.now() - 1000) }),
    );
    answers.push(await rejectionOf(bearer(CREDENTIAL)));

    findUnique.mockResolvedValue(storedKey({ revokedAt: new Date() }));
    answers.push(await rejectionOf(bearer(CREDENTIAL)));

    for (const answer of answers) {
      expect(answer.status).toBe(401);
      expect(answer.body).toEqual({
        code: IngestionMessageCode.INGESTION_UNAUTHORIZED,
        message: "Invalid ingestion credential.",
      });
    }
    expect(new Set(answers.map((a) => JSON.stringify(a.body))).size).toBe(1);
  });

  it("names the inactive source separately, because the credential itself is good", async () => {
    findUnique.mockResolvedValue(
      storedKey({ source: { ...activeSource, isActive: false } }),
    );

    const answer = await rejectionOf(bearer(CREDENTIAL));

    expect(answer.status).toBe(403);
    expect(answer.body).toMatchObject({
      code: IngestionMessageCode.INGESTION_SOURCE_INACTIVE,
    });
  });

  it("rejects a request carrying no credential at all", async () => {
    const answer = await rejectionOf({ headers: {} });

    expect(answer.status).toBe(401);
    expect(answer.body).toMatchObject({
      code: IngestionMessageCode.INGESTION_UNAUTHORIZED,
    });
    expect(findUnique).not.toHaveBeenCalled();
  });

  it("rejects a session cookie standing in for a key", async () => {
    const answer = await rejectionOf({
      headers: { cookie: "access_token=a.valid.looking.jwt" },
    });

    expect(answer.status).toBe(401);
    expect(findUnique).not.toHaveBeenCalled();
  });

  it("answers an exhausted allowance with Retry-After", async () => {
    findUnique.mockResolvedValue(storedKey());
    queryRaw
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ retryAfterSeconds: 42 }]);

    const answer = await rejectionOf(bearer(CREDENTIAL));

    expect(answer.status).toBe(429);
    expect(answer.body).toMatchObject({
      code: IngestionMessageCode.INGESTION_RATE_LIMITED,
      retryAfterSeconds: 42,
    });
    expect(answer.response.setHeader).toHaveBeenCalledWith("Retry-After", "42");
  });

  it("refuses a caller-supplied source instead of silently overriding it", async () => {
    findUnique.mockResolvedValue(storedKey());

    const fromBody = await rejectionOf({
      ...bearer(CREDENTIAL),
      body: { sourceId: "someone-elses-source" },
    });
    const fromQuery = await rejectionOf({
      ...bearer(CREDENTIAL),
      query: { sourceId: "someone-elses-source" },
    });

    for (const answer of [fromBody, fromQuery]) {
      expect(answer.status).toBe(400);
      expect(answer.body).toMatchObject({
        code: IngestionMessageCode.INGESTION_SOURCE_NOT_CALLER_SUPPLIED,
      });
    }
    expect(findUnique).not.toHaveBeenCalled();
  });

  it("never lets the secret, the hash or the credential reach a log or a response", async () => {
    findUnique.mockResolvedValue(storedKey());
    const answers = [
      await rejectionOf(bearer(formatCredential(PREFIX, "wrong-secret-value"))),
      await rejectionOf({
        ...bearer(CREDENTIAL),
        body: { sourceId: "x" },
      }),
    ];
    findUnique.mockResolvedValue(
      storedKey({ source: { ...activeSource, isActive: false } }),
    );
    answers.push(await rejectionOf(bearer(CREDENTIAL)));

    const written = JSON.stringify({
      logs: warn.mock.calls,
      responses: answers.map((answer) => answer.body),
    });

    for (const forbidden of [SECRET, CREDENTIAL, secretHash])
      expect(written).not.toContain(forbidden);
    expect(written).toContain(PREFIX);
  });
});
