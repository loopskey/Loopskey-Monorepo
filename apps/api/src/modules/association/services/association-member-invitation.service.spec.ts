import { AssociationMemberStatus, AuditAction } from "@prisma/client";
import { AuthMessageCode } from "@loopskey/api-contracts/error-codes";
import type { PrismaService } from "@prisma/prisma.service";

import { AssociationMemberInvitationService } from "./association-member-invitation.service";

const input = {
  token: "a-member-invitation-token-value",
  password: "Password123",
  confirmPassword: "Password123",
};

const setup = () => {
  const tx = {
    associationMember: {
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    auditLog: { create: jest.fn().mockResolvedValue({ id: "audit-9" }) },
  };
  const prisma = {
    $transaction: jest.fn((argument: unknown) =>
      (argument as (client: typeof tx) => unknown)(tx),
    ),
  };
  const activation = {
    describeMemberInvitation: jest.fn().mockResolvedValue({
      status: "VALID",
      associationName: "Example Association",
      requiresPassword: true,
    }),
    acceptMemberInvitationToken: jest.fn().mockResolvedValue({
      associationMemberId: "member-9",
      userId: "user-9",
    }),
  };
  return {
    tx,
    prisma,
    activation,
    service: new AssociationMemberInvitationService(
      prisma as unknown as PrismaService,
      activation as never,
    ),
  };
};

describe("AssociationMemberInvitationService", () => {
  it("delegates status straight through to the auth port", async () => {
    const { service, activation } = setup();

    await expect(service.describeInvitation(input.token)).resolves.toEqual({
      status: "VALID",
      associationName: "Example Association",
      requiresPassword: true,
    });
    expect(activation.describeMemberInvitation).toHaveBeenCalledWith(
      input.token,
    );
  });

  it("activates the membership and records who accepted it, in the same transaction as the token consume", async () => {
    const { service, tx, activation } = setup();

    const result = await service.acceptInvitation(input);

    expect(result).toEqual(
      expect.objectContaining({
        success: true,
        code: AuthMessageCode.MEMBER_INVITATION_ACCEPTED,
      }),
    );
    expect(activation.acceptMemberInvitationToken).toHaveBeenCalledWith(
      expect.objectContaining({
        token: input.token,
        password: input.password,
        confirmPassword: input.confirmPassword,
        atomicContext: tx,
      }),
    );
    expect(tx.associationMember.updateMany).toHaveBeenCalledWith({
      where: {
        id: "member-9",
        status: AssociationMemberStatus.PENDING_ACTIVATION,
      },
      data: expect.objectContaining({
        status: AssociationMemberStatus.ACTIVE,
      }),
    });
    expect(tx.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: "user-9",
        action: AuditAction.ASSOCIATION_MEMBER_INVITATION_ACCEPTED,
        entityType: "AssociationMember",
        entityId: "member-9",
      }),
    });
  });

  /**
   * The token consume already happened (inside `acceptMemberInvitationToken`,
   * which ran first) by the time this membership-activation guard can fail —
   * a concurrent accept, or the association deactivating the member in the
   * same window. Both writes share one transaction, so this failure rolls
   * the token consume back with it rather than leaving it spent for nothing.
   */
  it("reports a used-token conflict, not a crash, when the membership already moved on", async () => {
    const { service, tx } = setup();
    tx.associationMember.updateMany.mockResolvedValue({ count: 0 });

    await expect(service.acceptInvitation(input)).rejects.toMatchObject({
      response: { code: AuthMessageCode.ACTIVATION_TOKEN_USED },
    });
    expect(tx.auditLog.create).not.toHaveBeenCalled();
  });

  it("propagates a rejection from the auth port (invalid/expired/used/password) unchanged", async () => {
    const { service, activation, tx } = setup();
    activation.acceptMemberInvitationToken.mockRejectedValue(
      new Error("token rejected upstream"),
    );

    await expect(service.acceptInvitation(input)).rejects.toThrow(
      "token rejected upstream",
    );
    expect(tx.associationMember.updateMany).not.toHaveBeenCalled();
  });
});
