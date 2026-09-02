import { AssociationMemberStatus, Prisma, Role } from "@prisma/client";
import type { ConfigService } from "@nestjs/config";
import type { OutboxService } from "@infrastructure/outbox/outbox.service";
import type { PrismaService } from "@prisma/prisma.service";

import { AssociationInviteOutcome } from "@association/enums/association-register.enum";
import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import type { AssociationAccessService } from "@association/services/association-access.service";
import type { AssociationGroupService } from "@association/services/association-group.service";
import { AssociationMemberService } from "./association-member.service";

const owner = { id: "owner-1", role: Role.ASSOCIATION };
const association = { id: "assoc-1", name: "Example Association" };

const memberRow = (over: Partial<Record<string, unknown>> = {}) => ({
  id: "member-1",
  userId: "user-1",
  memberNumber: null,
  notes: null,
  status: AssociationMemberStatus.PENDING_ACTIVATION,
  invitedAt: new Date(),
  activatedAt: null,
  deactivatedAt: null,
  group: null,
  user: { fullName: "Ada Member", email: "ada@example.org", avatarUrl: null },
  ...over,
});

const uniqueViolation = (target: string[]) =>
  new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
    code: "P2002",
    clientVersion: "6.11.1",
    meta: { target },
  });

const setup = (
  over: {
    resolveUser?: jest.Mock;
    memberCreate?: jest.Mock;
    memberFindUnique?: jest.Mock;
    invitation?: jest.Mock;
  } = {},
) => {
  const tx = {
    associationMember: {
      findUnique: over.memberFindUnique ?? jest.fn().mockResolvedValue(null),
      create: over.memberCreate ?? jest.fn().mockResolvedValue(memberRow()),
      update: jest.fn().mockResolvedValue(memberRow()),
    },
  };
  const prisma = {
    associationMember: {
      findFirst: jest.fn().mockResolvedValue(memberRow()),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      update: jest.fn().mockResolvedValue(memberRow()),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    $transaction: jest.fn((argument: unknown) =>
      (argument as (client: typeof tx) => unknown)(tx),
    ),
  };
  const outbox = { append: jest.fn().mockResolvedValue({ id: "event-1" }) };
  const config = {
    get: jest.fn((_name: string, fallback?: string) => fallback ?? "x"),
  };
  const access = {
    requireOwned: jest.fn().mockResolvedValue(association),
    requireReadable: jest.fn().mockResolvedValue(association),
  };
  const groups = {
    requireGroup: jest
      .fn()
      .mockResolvedValue({ id: "group-1", isActive: true }),
    ensureByTitle: jest.fn().mockResolvedValue("group-1"),
  };
  const identity = {
    resolveAssociationMemberUser:
      over.resolveUser ??
      jest.fn().mockResolvedValue({ id: "user-1", linkedExisting: false }),
  };
  const professional = {
    ensureProfile: jest.fn().mockResolvedValue(undefined),
  };
  const activation = {
    issueMemberInvitation:
      over.invitation ??
      jest.fn().mockResolvedValue({
        activationUrl: "https://app.example.com/auth/association/join?token=x",
        expiresInMinutes: 60,
        tokenId: "otp-1",
      }),
  };
  const assignments = {
    materialiseForMember: jest.fn().mockResolvedValue(undefined),
    materialiseForAssociation: jest.fn().mockResolvedValue(undefined),
  };
  return {
    tx,
    prisma,
    assignments,
    outbox,
    groups,
    identity,
    activation,
    professional,
    service: new AssociationMemberService(
      prisma as unknown as PrismaService,
      config as unknown as ConfigService,
      outbox as unknown as OutboxService,
      access as unknown as AssociationAccessService,
      groups as unknown as AssociationGroupService,
      identity as never,
      professional as never,
      activation as never,
      assignments as never,
    ),
  };
};

const invite = {
  email: " Ada@Example.org ",
  fullName: "Ada Member",
};

describe("AssociationMemberService invitations", () => {
  it("links an email that already belongs to someone, active and unmailed", async () => {
    const { service, tx, outbox, activation } = setup({
      resolveUser: jest
        .fn()
        .mockResolvedValue({ id: "user-1", linkedExisting: true }),
      memberCreate: jest.fn().mockResolvedValue(
        memberRow({
          status: AssociationMemberStatus.ACTIVE,
          activatedAt: new Date(),
        }),
      ),
    });

    const result = await service.invite(owner, invite);

    expect(result.outcome).toBe(AssociationInviteOutcome.LINKED_EXISTING_USER);
    expect(tx.associationMember.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: AssociationMemberStatus.ACTIVE,
        }),
      }),
    );
    expect(activation.issueMemberInvitation).not.toHaveBeenCalled();
    expect(outbox.append).not.toHaveBeenCalled();
  });

  it("provisions an unknown email as pending and queues exactly one invitation", async () => {
    const { service, tx, outbox, activation } = setup();

    const result = await service.invite(owner, invite);

    expect(result.outcome).toBe(AssociationInviteOutcome.INVITATION_SENT);
    expect(tx.associationMember.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: AssociationMemberStatus.PENDING_ACTIVATION,
          activatedAt: null,
        }),
      }),
    );
    expect(activation.issueMemberInvitation).toHaveBeenCalledTimes(1);
    expect(outbox.append).toHaveBeenCalledTimes(1);
    expect(outbox.append).toHaveBeenCalledWith(
      expect.objectContaining({ eventName: "mail.delivery.requested" }),
      tx,
    );
  });

  it("normalises the email before it is looked up or written", async () => {
    const { service, identity } = setup();
    await service.invite(owner, invite);
    expect(identity.resolveAssociationMemberUser).toHaveBeenCalledWith(
      expect.objectContaining({ email: "ada@example.org" }),
    );
  });

  it("ties the invitation mail to the token, so a retry is the same email", async () => {
    const { service, outbox } = setup();
    await service.invite(owner, invite);
    const payload = outbox.append.mock.calls[0][0].payload as {
      idempotencyKey: string;
    };
    expect(payload.idempotencyKey).toBe("association-invite:member-1:otp-1");
  });

  it("answers a lost race with the winning row rather than a Prisma error", async () => {
    // The unique index on (association, user) is the arbiter. Nothing read the
    // membership first, so the loser learns it lost from the constraint.
    const winner = memberRow({
      id: "member-winner",
      status: AssociationMemberStatus.PENDING_ACTIVATION,
    });
    const { service, prisma, outbox } = setup({
      memberCreate: jest
        .fn()
        .mockRejectedValue(uniqueViolation(["associationId", "userId"])),
    });
    prisma.associationMember.findFirst.mockResolvedValue(winner);

    const result = await service.invite(owner, invite);

    expect(result.member.id).toBe("member-winner");
    expect(outbox.append).not.toHaveBeenCalled();
  });

  it("refuses a member number another member already holds", async () => {
    const { service } = setup({
      memberCreate: jest
        .fn()
        .mockRejectedValue(
          uniqueViolation(["AssociationMember_member_number_key"]),
        ),
    });

    await expect(
      service.invite(owner, { ...invite, memberNumber: "M-1" }),
    ).rejects.toMatchObject({
      response: { code: AssociationMessageCode.MEMBER_NUMBER_TAKEN },
    });
  });

  it("converges on one row when the same person is invited twice", async () => {
    const { service, tx, activation } = setup({
      memberFindUnique: jest.fn().mockResolvedValue({ id: "member-1" }),
    });

    await service.invite(owner, { ...invite, memberNumber: "M-9" });

    expect(tx.associationMember.create).not.toHaveBeenCalled();
    expect(tx.associationMember.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "member-1" },
        data: expect.objectContaining({ memberNumber: "M-9" }),
      }),
    );
    expect(activation.issueMemberInvitation).not.toHaveBeenCalled();
  });
});

describe("AssociationMemberService bulk import", () => {
  const rows = (count: number, bad: number[]) =>
    Array.from({ length: count }, (_, index) => ({
      email: bad.includes(index + 1)
        ? "not-an-email"
        : `member${index + 1}@example.org`,
      firstName: "Member",
      lastName: `${index + 1}`,
    }));

  it("imports every good row and names the rows it could not", async () => {
    const { service } = setup();

    const result = await service.bulkInvite(owner, {
      rows: rows(10, [3, 7]),
    });

    expect(result).toEqual(
      expect.objectContaining({ totalRows: 10, invited: 8, failed: 2 }),
    );
    expect(result.failures.map((failure) => failure.row)).toEqual([3, 7]);
    expect(result.failures[0].email).toBe("not-an-email");
    expect(result.failures[0].code).toBe(
      AssociationMessageCode.INVALID_IMPORT_ROW,
    );
  });

  it("counts a linked member apart from an invited one", async () => {
    const { service, identity } = setup();
    identity.resolveAssociationMemberUser
      .mockResolvedValueOnce({ id: "user-1", linkedExisting: true })
      .mockResolvedValueOnce({ id: "user-2", linkedExisting: false });

    const result = await service.bulkInvite(owner, { rows: rows(2, []) });

    expect(result).toEqual(
      expect.objectContaining({ linked: 1, invited: 1, failed: 0 }),
    );
  });

  it("requires a name on every row", async () => {
    const { service } = setup();
    const result = await service.bulkInvite(owner, {
      rows: [{ email: "nameless@example.org" }],
    });
    expect(result.failed).toBe(1);
    expect(result.failures[0].reason).toContain("name is required");
  });
});

describe("AssociationMemberService status changes", () => {
  it("deactivates with a conditional write naming the statuses it accepts", async () => {
    const { service, prisma } = setup();

    await service.setStatus(owner, {
      memberId: "member-1",
      status: AssociationMemberStatus.INACTIVE,
    });

    expect(prisma.associationMember.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: "member-1",
          associationId: "assoc-1",
          status: {
            in: [
              AssociationMemberStatus.ACTIVE,
              AssociationMemberStatus.PENDING_ACTIVATION,
            ],
          },
        }),
      }),
    );
  });

  it("reports a lost race rather than repeating the move", async () => {
    const { service, prisma } = setup();
    prisma.associationMember.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      service.setStatus(owner, {
        memberId: "member-1",
        status: AssociationMemberStatus.INACTIVE,
      }),
    ).rejects.toMatchObject({
      response: { code: AssociationMessageCode.MEMBER_STATUS_CONFLICT },
    });
  });

  it("returns a member who never accepted to pending, not to active", async () => {
    const { service, prisma } = setup();
    prisma.associationMember.updateMany
      .mockResolvedValueOnce({ count: 0 })
      .mockResolvedValueOnce({ count: 1 });

    await service.setStatus(owner, {
      memberId: "member-1",
      status: AssociationMemberStatus.ACTIVE,
    });

    expect(prisma.associationMember.updateMany).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: expect.objectContaining({ activatedAt: null }),
        data: expect.objectContaining({
          status: AssociationMemberStatus.PENDING_ACTIVATION,
        }),
      }),
    );
  });
});

describe("AssociationMemberService roster", () => {
  it("scopes every read to the association it resolved", async () => {
    const { service, prisma } = setup();

    await service.list(owner, { search: "ada" });

    expect(prisma.associationMember.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ associationId: "assoc-1" }),
      }),
    );
  });

  it("searches name, email and member number together", async () => {
    const { service, prisma } = setup();
    await service.list(owner, { search: "M-9" });
    const where = prisma.associationMember.findMany.mock.calls[0][0].where as {
      OR: unknown[];
    };
    expect(where.OR).toHaveLength(3);
  });
});
