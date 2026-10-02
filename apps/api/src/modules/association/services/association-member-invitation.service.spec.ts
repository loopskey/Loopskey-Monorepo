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
  const order: string[] = [];
  const tx = {
    associationMember: {
      updateMany: jest.fn(() => {
        order.push("activate-member");
        return Promise.resolve({ count: 1 });
      }),
      findUniqueOrThrow: jest.fn().mockResolvedValue({
        id: "member-9",
        associationId: "assoc-1",
        userId: "user-9",
        groupId: "group-1",
      }),
    },
    auditLog: { create: jest.fn().mockResolvedValue({ id: "audit-9" }) },
  };
  const prisma = {
    $transaction: jest.fn((argument: unknown) => {
      order.push("begin");
      return (argument as (client: typeof tx) => unknown)(tx);
    }),
  };
  const consume = jest.fn(() => {
    order.push("consume-token");
    return Promise.resolve();
  });
  const activation = {
    describeMemberInvitation: jest.fn().mockResolvedValue({
      status: "VALID",
      associationName: "Example Association",
      requiresPassword: true,
    }),
    prepareMemberInvitationAcceptance: jest.fn(() => {
      order.push("prepare");
      return Promise.resolve({
        associationMemberId: "member-9",
        userId: "user-9",
        consume,
      });
    }),
  };
  const lifecycle = {
    announceActivation: jest.fn().mockResolvedValue(undefined),
  };
  return {
    tx,
    order,
    prisma,
    consume,
    activation,
    lifecycle,
    service: new AssociationMemberInvitationService(
      prisma as unknown as PrismaService,
      activation as never,
      lifecycle as never,
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
    const { service, tx, consume, activation } = setup();

    const result = await service.acceptInvitation(input);

    expect(result).toEqual(
      expect.objectContaining({
        success: true,
        code: AuthMessageCode.MEMBER_INVITATION_ACCEPTED,
      }),
    );
    expect(activation.prepareMemberInvitationAcceptance).toHaveBeenCalledWith(
      input,
    );
    expect(consume).toHaveBeenCalledWith(tx);
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

  it("validates and hashes before the transaction, then locks the membership before the token", async () => {
    const { service, order } = setup();

    await service.acceptInvitation(input);

    expect(order).toEqual([
      "prepare",
      "begin",
      "activate-member",
      "consume-token",
    ]);
  });

  it("announces the activation inside the acceptance transaction", async () => {
    const { service, tx, lifecycle } = setup();

    await service.acceptInvitation(input);

    expect(lifecycle.announceActivation).toHaveBeenCalledTimes(1);
    expect(lifecycle.announceActivation).toHaveBeenCalledWith(
      tx,
      {
        id: "member-9",
        associationId: "assoc-1",
        userId: "user-9",
        groupId: "group-1",
      },
      expect.any(Date),
    );
  });

  it("reports a used-token conflict and spends nothing when the membership already moved on", async () => {
    const { service, tx, consume, lifecycle } = setup();
    tx.associationMember.updateMany.mockResolvedValue({ count: 0 });

    await expect(service.acceptInvitation(input)).rejects.toMatchObject({
      response: { code: AuthMessageCode.ACTIVATION_TOKEN_USED },
    });
    expect(consume).not.toHaveBeenCalled();
    expect(tx.auditLog.create).not.toHaveBeenCalled();
    expect(lifecycle.announceActivation).not.toHaveBeenCalled();
  });

  it("writes nothing further when the token consume loses, so the activation rolls back with it", async () => {
    const { service, tx, consume, lifecycle } = setup();
    consume.mockRejectedValue(new Error("token already consumed"));

    await expect(service.acceptInvitation(input)).rejects.toThrow(
      "token already consumed",
    );
    expect(tx.auditLog.create).not.toHaveBeenCalled();
    expect(lifecycle.announceActivation).not.toHaveBeenCalled();
  });

  it("opens no transaction when the auth port rejects the token or password", async () => {
    const { service, activation, prisma } = setup();
    activation.prepareMemberInvitationAcceptance.mockRejectedValue(
      new Error("token rejected upstream"),
    );

    await expect(service.acceptInvitation(input)).rejects.toThrow(
      "token rejected upstream",
    );
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
