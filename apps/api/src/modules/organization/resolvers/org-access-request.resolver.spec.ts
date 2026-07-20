import { ForbiddenException, type ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role, UserStatus } from "@prisma/client";

import { IS_PUBLIC_KEY } from "@auth/decorators/public.decorator";
import { ROLES_KEY } from "@auth/decorators/roles.decorator";
import { RolesGuard } from "@auth/guards/roles.guard";

import { OrgAccessRequestResolver } from "./org-access-request.resolver";

describe("OrgAccessRequestResolver authorization", () => {
  it("allows anonymous application submission", () => {
    const isPublic = Reflect.getMetadata(
      IS_PUBLIC_KEY,
      OrgAccessRequestResolver.prototype.submitOrganizationAccessRequest,
    );

    expect(isPublic).toBe(true);
  });

  it.each([
    "organizationAccessRequests",
    "organizationAccessRequestById",
  ] as const)("restricts %s to administrators", (methodName) => {
    const roles = Reflect.getMetadata(
      ROLES_KEY,
      OrgAccessRequestResolver.prototype[methodName],
    );

    expect(roles).toEqual([Role.ADMIN]);
  });

  it("rejects a non-Admin attempting to read organization requests", () => {
    const guard = new RolesGuard(new Reflector());
    const context = {
      getType: () => "http",
      getHandler: () =>
        OrgAccessRequestResolver.prototype.organizationAccessRequests,
      getClass: () => OrgAccessRequestResolver,
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            sub: "professional-1",
            email: "professional@example.org",
            role: Role.PROFESSIONAL,
            status: UserStatus.ACTIVE,
          },
        }),
      }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
