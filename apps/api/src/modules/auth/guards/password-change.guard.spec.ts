import type { ExecutionContext } from "@nestjs/common";
import { ForbiddenException } from "@nestjs/common";
import type { Reflector } from "@nestjs/core";

import { AuthMessageCode } from "@auth/enums/message-code.enum";

import { PasswordChangeGuard } from "./password-change.guard";

const createContext = (user: unknown) =>
  ({
    getHandler: () => undefined,
    getClass: () => undefined,
    getType: () => "http",
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  }) as unknown as ExecutionContext;

const createGuard = (metadata: Record<string, boolean>) =>
  new PasswordChangeGuard({
    getAllAndOverride: (key: string) => metadata[key],
  } as unknown as Reflector);

describe("PasswordChangeGuard", () => {
  it("blocks a protected operation while a password change is owed", () => {
    const guard = createGuard({});
    expect(() =>
      guard.canActivate(createContext({ forcePasswordChange: true })),
    ).toThrow(ForbiddenException);
  });

  it("reports a distinct code the client can route on", () => {
    const guard = createGuard({});
    try {
      guard.canActivate(createContext({ forcePasswordChange: true }));
      fail("expected the guard to reject");
    } catch (error) {
      expect(error).toMatchObject({
        response: { code: AuthMessageCode.CHANGE_PASSWORD_REQUIRED },
      });
    }
  });

  it("allows the operations needed to recover the account", () => {
    const guard = createGuard({ allowPasswordChangeRequired: true });
    expect(
      guard.canActivate(createContext({ forcePasswordChange: true })),
    ).toBe(true);
  });

  it("allows public operations", () => {
    const guard = createGuard({ isPublic: true });
    expect(guard.canActivate(createContext(null))).toBe(true);
  });

  it("allows an account with no outstanding password change", () => {
    const guard = createGuard({});
    expect(
      guard.canActivate(createContext({ forcePasswordChange: false })),
    ).toBe(true);
  });
});
