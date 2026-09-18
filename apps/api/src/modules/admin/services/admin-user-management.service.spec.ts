import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { Role } from "@prisma/client";

import type { PrismaService } from "@prisma/prisma.service";
import type { IdentityAdministrationApi } from "@user/public/identity-administration-api";

import { AdminDashboardService } from "./admin.service";
import { OrganizationReviewNotificationService } from "./organization-review-notification.service";
import { AssociationReviewNotificationService } from "./association-review-notification.service";

const admin = { id: "admin-1", role: Role.ADMIN };
const nonAdmin = { id: "user-1", role: Role.PROFESSIONAL };

const createService = ({
  identityAdmin,
  auditLogCreate = jest.fn(),
}: {
  identityAdmin: Partial<IdentityAdministrationApi>;
  auditLogCreate?: jest.Mock;
}) => {
  const prisma = { auditLog: { create: auditLogCreate } };
  return new AdminDashboardService(
    prisma as unknown as PrismaService,
    {} as unknown as OrganizationReviewNotificationService,
    {} as unknown as AssociationReviewNotificationService,
    identityAdmin as IdentityAdministrationApi,
    {} as never,
    {} as never,
  );
};

describe("AdminDashboardService.deleteUser", () => {
  it("rejects a non-admin actor", async () => {
    const deleteUser = jest.fn();
    const service = createService({ identityAdmin: { deleteUser } });

    await expect(
      service.deleteUser(nonAdmin, "target-1"),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it("throws not-found when the target user does not exist", async () => {
    const deleteUser = jest.fn().mockResolvedValue(null);
    const service = createService({ identityAdmin: { deleteUser } });

    await expect(
      service.deleteUser(admin, "missing-user"),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("hard-deletes the user and records an audit entry", async () => {
    const deleteUser = jest.fn().mockResolvedValue({
      id: "target-1",
      role: Role.PROFESSIONAL,
      email: "pro@example.com",
    });
    const auditLogCreate = jest.fn();
    const service = createService({
      identityAdmin: { deleteUser },
      auditLogCreate,
    });

    const result = await service.deleteUser(admin, "target-1");

    expect(result).toBe(true);
    expect(deleteUser).toHaveBeenCalledWith("target-1");
    expect(auditLogCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: admin.id,
        action: "USER_DELETED",
        entityType: "User",
        entityId: "target-1",
        metadata: { role: Role.PROFESSIONAL, email: "pro@example.com" },
      }),
    });
  });

  it("propagates the cannot-delete-admin guard from the identity API", async () => {
    const deleteUser = jest
      .fn()
      .mockRejectedValue(new ForbiddenException({ code: "CannotDeleteAdmin" }));
    const service = createService({ identityAdmin: { deleteUser } });

    await expect(
      service.deleteUser(admin, "other-admin"),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
