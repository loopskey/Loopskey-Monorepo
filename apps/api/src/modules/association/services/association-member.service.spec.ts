import { AssociationMemberStatus, Prisma, Role } from "@prisma/client";
import type { ConfigService } from "@nestjs/config";
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
  joinedVia: "INVITED",
  invitedAt: new Date(),
  activatedAt: null,
  deactivatedAt: null,
  group: null,
  user: {
    fullName: "Ada Member",
    email: "ada@example.org",
    avatarUrl: null,
    lastLoginAt: null,
  },
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
    $queryRaw: jest.fn().mockResolvedValue([{ id: "member-1" }]),
  };
  const prisma = {
    associationMember: {
      findFirst: jest.fn().mockResolvedValue(memberRow()),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      update: jest.fn().mockResolvedValue(memberRow()),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    associationRequirementAssignment: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    associationRequirement: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    $transaction: jest.fn((argument: unknown) =>
      (argument as (client: typeof tx) => unknown)(tx),
    ),
  };
  const notifications = {
    recordInvitation: jest.fn().mockResolvedValue("delivery-1"),
  };
  const lifecycle = {
    announceActivation: jest.fn().mockResolvedValue(undefined),
    moveToGroup: jest.fn().mockResolvedValue(true),
  };
  const learningRecipients = {
    syncMember: jest.fn().mockResolvedValue(0),
  };
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
        issued: true,
        invitation: {
          activationUrl:
            "https://app.example.com/auth/association/join?token=x",
          expiresInMinutes: 60,
          tokenId: "otp-1",
        },
      }),
  };
  const assignments = {
    materialiseForMember: jest.fn().mockResolvedValue(undefined),
    materialiseForAssociation: jest.fn().mockResolvedValue(undefined),
  };
  const complianceRead = {
    memberComplianceList: jest.fn().mockResolvedValue([]),
  };
  const memberRequirements = {
    setRequirements: jest
      .fn()
      .mockResolvedValue({ memberId: "member-1", added: 0, removed: 0 }),
  };
  const requirements = {
    updateAudience: jest.fn().mockResolvedValue(undefined),
  };
  return {
    tx,
    prisma,
    assignments,
    notifications,
    lifecycle,
    learningRecipients,
    groups,
    identity,
    activation,
    professional,
    complianceRead,
    memberRequirements,
    requirements,
    service: new AssociationMemberService(
      prisma as unknown as PrismaService,
      config as unknown as ConfigService,
      notifications as never,
      lifecycle as never,
      learningRecipients as never,
      access as unknown as AssociationAccessService,
      groups as unknown as AssociationGroupService,
      identity as never,
      professional as never,
      activation as never,
      assignments as never,
      complianceRead as never,
      memberRequirements as never,
      requirements as never,
    ),
  };
};

const invite = {
  email: " Ada@Example.org ",
  fullName: "Ada Member",
};

describe("AssociationMemberService invitations", () => {
  it("links an email that already belongs to someone and welcomes them once", async () => {
    const { service, tx, notifications, lifecycle, activation } = setup({
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
    expect(notifications.recordInvitation).not.toHaveBeenCalled();
    expect(lifecycle.announceActivation).toHaveBeenCalledTimes(1);
    expect(lifecycle.announceActivation).toHaveBeenCalledWith(tx, {
      id: "member-1",
      associationId: "assoc-1",
      userId: "user-1",
      groupId: null,
    });
  });

  it("provisions an unknown email as pending and queues exactly one invitation", async () => {
    const { service, tx, notifications, lifecycle, activation } = setup();

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
    expect(notifications.recordInvitation).toHaveBeenCalledTimes(1);
    expect(notifications.recordInvitation).toHaveBeenCalledWith(
      tx,
      expect.objectContaining({
        associationId: "assoc-1",
        memberId: "member-1",
        recipientUserId: "user-1",
        mail: expect.objectContaining({ to: "ada@example.org" }),
      }),
    );
    expect(lifecycle.announceActivation).not.toHaveBeenCalled();
  });

  it("normalises the email before it is looked up or written", async () => {
    const { service, identity } = setup();
    await service.invite(owner, invite);
    expect(identity.resolveAssociationMemberUser).toHaveBeenCalledWith(
      expect.objectContaining({ email: "ada@example.org" }),
    );
  });

  it("ties the invitation delivery to the token, so a retry is the same email", async () => {
    const { service, notifications } = setup();
    await service.invite(owner, invite);
    expect(notifications.recordInvitation).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ tokenId: "otp-1" }),
    );
  });

  it("keeps the raw activation link out of everything but the mail body", async () => {
    const { service, notifications } = setup();
    await service.invite(owner, invite);
    const [, recorded] = notifications.recordInvitation.mock.calls[0] as [
      unknown,
      Record<string, unknown> & { mail: { text: string } },
    ];
    const { mail, ...rest } = recorded;
    expect(mail.text).toContain("token=x");
    expect(JSON.stringify(rest)).not.toContain("token=x");
  });

  it("answers a lost race with the winning row rather than a Prisma error", async () => {
    const winner = memberRow({
      id: "member-winner",
      status: AssociationMemberStatus.PENDING_ACTIVATION,
    });
    const { service, prisma, notifications } = setup({
      memberCreate: jest
        .fn()
        .mockRejectedValue(uniqueViolation(["associationId", "userId"])),
    });
    prisma.associationMember.findFirst.mockResolvedValue(winner);

    const result = await service.invite(owner, invite);

    expect(result.member.id).toBe("member-winner");
    expect(notifications.recordInvitation).not.toHaveBeenCalled();
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
    const { service, tx } = setup({
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
  });

  it("re-adding an already-pending member queues a fresh invitation, truthfully", async () => {
    const { service, activation, notifications } = setup({
      memberFindUnique: jest.fn().mockResolvedValue({ id: "member-1" }),
    });

    const result = await service.invite(owner, invite);

    expect(result.outcome).toBe(AssociationInviteOutcome.INVITATION_SENT);
    expect(activation.issueMemberInvitation).toHaveBeenCalledWith(
      expect.objectContaining({ associationMemberId: "member-1" }),
    );
    expect(notifications.recordInvitation).toHaveBeenCalledTimes(1);
  });

  it("never claims INVITATION_SENT when the invitation was actually cooldown-blocked", async () => {
    const { service, notifications } = setup({
      memberFindUnique: jest.fn().mockResolvedValue({ id: "member-1" }),
      invitation: jest
        .fn()
        .mockResolvedValue({ issued: false, refusal: "COOLDOWN" }),
    });

    const result = await service.invite(owner, invite);

    expect(result.outcome).toBe(AssociationInviteOutcome.INVITATION_COOLDOWN);
    expect(notifications.recordInvitation).not.toHaveBeenCalled();
  });

  it("never claims INVITATION_SENT for a brand-new member when issuance is cooldown-blocked", async () => {
    const { service, notifications } = setup({
      invitation: jest
        .fn()
        .mockResolvedValue({ issued: false, refusal: "COOLDOWN" }),
    });

    const result = await service.invite(owner, invite);

    expect(result.outcome).toBe(AssociationInviteOutcome.INVITATION_COOLDOWN);
    expect(notifications.recordInvitation).not.toHaveBeenCalled();
  });

  it("reports the daily limit distinctly from the cooldown", async () => {
    const { service, notifications } = setup({
      memberFindUnique: jest.fn().mockResolvedValue({ id: "member-1" }),
      invitation: jest
        .fn()
        .mockResolvedValue({ issued: false, refusal: "DAILY_LIMIT" }),
    });

    const result = await service.invite(owner, invite);

    expect(result.outcome).toBe(
      AssociationInviteOutcome.INVITATION_LIMIT_REACHED,
    );
    expect(notifications.recordInvitation).not.toHaveBeenCalled();
  });

  it("locks the pending membership row before issuing its token", async () => {
    const { service, tx, activation } = setup();

    await service.invite(owner, invite);

    expect(tx.$queryRaw).toHaveBeenCalledTimes(1);
    expect(tx.$queryRaw.mock.invocationCallOrder[0]).toBeLessThan(
      activation.issueMemberInvitation.mock.invocationCallOrder[0],
    );
  });

  it("refuses to issue when the membership stopped being pending under the lock", async () => {
    const { service, tx, activation, notifications } = setup({
      memberFindUnique: jest.fn().mockResolvedValue({ id: "member-1" }),
    });
    tx.$queryRaw.mockResolvedValue([]);

    await expect(service.invite(owner, invite)).rejects.toMatchObject({
      response: { code: AssociationMessageCode.MEMBER_STATUS_CONFLICT },
    });
    expect(activation.issueMemberInvitation).not.toHaveBeenCalled();
    expect(notifications.recordInvitation).not.toHaveBeenCalled();
  });

  it("does not email a deactivated member who is added again", async () => {
    const { service, tx, activation } = setup({
      memberFindUnique: jest.fn().mockResolvedValue({ id: "member-1" }),
    });
    tx.associationMember.update.mockResolvedValue(
      memberRow({ status: AssociationMemberStatus.INACTIVE }),
    );

    await expect(service.invite(owner, invite)).rejects.toMatchObject({
      response: { code: AssociationMessageCode.MEMBER_DEACTIVATED },
    });
    expect(activation.issueMemberInvitation).not.toHaveBeenCalled();
  });

  it("fails the whole transaction when the invitation email could not be recorded", async () => {
    const { service, notifications, assignments } = setup();
    notifications.recordInvitation.mockResolvedValue(null);

    await expect(service.invite(owner, invite)).rejects.toThrow(
      "could not be recorded",
    );
    expect(assignments.materialiseForMember).not.toHaveBeenCalled();
  });

  it("rolls the member and token back when appending the email fails", async () => {
    const { service, notifications, assignments } = setup();
    notifications.recordInvitation.mockRejectedValue(new Error("outbox down"));

    await expect(service.invite(owner, invite)).rejects.toThrow("outbox down");
    expect(assignments.materialiseForMember).not.toHaveBeenCalled();
  });

  it("answers a lost race for a still-pending winner as recently invited, not linked", async () => {
    const { service, prisma } = setup({
      memberCreate: jest
        .fn()
        .mockRejectedValue(uniqueViolation(["associationId", "userId"])),
    });
    prisma.associationMember.findFirst.mockResolvedValue(
      memberRow({ id: "member-winner" }),
    );

    const result = await service.invite(owner, invite);

    expect(result.outcome).toBe(AssociationInviteOutcome.INVITATION_COOLDOWN);
  });

  it("answers a lost race for an active winner as linked", async () => {
    const { service, prisma } = setup({
      memberCreate: jest
        .fn()
        .mockRejectedValue(uniqueViolation(["associationId", "userId"])),
    });
    prisma.associationMember.findFirst.mockResolvedValue(
      memberRow({ status: AssociationMemberStatus.ACTIVE }),
    );

    const result = await service.invite(owner, invite);

    expect(result.outcome).toBe(AssociationInviteOutcome.LINKED_EXISTING_USER);
  });

  it("does not re-invite an existing member who is already active", async () => {
    const { service, tx, activation } = setup({
      memberFindUnique: jest.fn().mockResolvedValue({ id: "member-1" }),
    });
    tx.associationMember.update.mockResolvedValue(
      memberRow({ status: AssociationMemberStatus.ACTIVE }),
    );

    const result = await service.invite(owner, invite);

    expect(result.outcome).toBe(AssociationInviteOutcome.LINKED_EXISTING_USER);
    expect(activation.issueMemberInvitation).not.toHaveBeenCalled();
  });

  it("moves a re-invited member into the named group through the transition guard", async () => {
    const { service, tx, lifecycle } = setup({
      memberFindUnique: jest.fn().mockResolvedValue({ id: "member-1" }),
    });

    await service.invite(owner, { ...invite, groupId: "group-1" });

    expect(lifecycle.moveToGroup).toHaveBeenCalledWith(
      tx,
      { id: "member-1", associationId: "assoc-1" },
      "group-1",
    );
    expect(tx.associationMember.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: {} }),
    );
  });

  it("refreshes requirement and learning targeting for the invited member", async () => {
    const { service, assignments, learningRecipients } = setup();

    await service.invite(owner, invite);

    expect(assignments.materialiseForMember).toHaveBeenCalledWith("member-1");
    expect(learningRecipients.syncMember).toHaveBeenCalledWith("member-1");
  });
});

describe("AssociationMemberService group changes", () => {
  it("moves the member through the transition guard inside the update transaction", async () => {
    const { service, tx, lifecycle, assignments, learningRecipients } = setup();

    await service.update(owner, { memberId: "member-1", groupId: "group-2" });

    expect(lifecycle.moveToGroup).toHaveBeenCalledWith(
      tx,
      { id: "member-1", associationId: "assoc-1" },
      "group-2",
    );
    expect(tx.associationMember.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: {} }),
    );
    expect(assignments.materialiseForMember).toHaveBeenCalledWith("member-1");
    expect(learningRecipients.syncMember).toHaveBeenCalledWith("member-1");
  });

  it("clears a group without announcing anything", async () => {
    const { service, tx, lifecycle } = setup();

    await service.update(owner, { memberId: "member-1", groupId: "" });

    expect(lifecycle.moveToGroup).not.toHaveBeenCalled();
    expect(tx.associationMember.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { groupId: null } }),
    );
  });

  it("leaves targeting alone when the group is not part of the edit", async () => {
    const { service, lifecycle, assignments, learningRecipients } = setup();

    await service.update(owner, { memberId: "member-1", notes: "Hello" });

    expect(lifecycle.moveToGroup).not.toHaveBeenCalled();
    expect(assignments.materialiseForMember).not.toHaveBeenCalled();
    expect(learningRecipients.syncMember).not.toHaveBeenCalled();
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

  it("refreshes targeting for every imported member once the rows are in", async () => {
    const { service, assignments, learningRecipients } = setup();

    await service.bulkInvite(owner, { rows: rows(3, [2]) });

    expect(assignments.materialiseForMember).toHaveBeenCalledTimes(2);
    expect(learningRecipients.syncMember).toHaveBeenCalledTimes(2);
  });

  it("does not count a row held back by the cooldown as invited", async () => {
    const { service, activation } = setup();
    activation.issueMemberInvitation
      .mockResolvedValueOnce({ issued: false, refusal: "COOLDOWN" })
      .mockResolvedValueOnce({ issued: false, refusal: "DAILY_LIMIT" });

    const result = await service.bulkInvite(owner, { rows: rows(3, []) });

    expect(result).toEqual(
      expect.objectContaining({ invited: 1, linked: 0, failed: 2 }),
    );
    expect(result.failures.map((failure) => failure.code)).toEqual([
      AssociationMessageCode.MEMBER_INVITATION_COOLDOWN,
      AssociationMessageCode.MEMBER_INVITATION_LIMIT_REACHED,
    ]);
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

describe("AssociationMemberService resend", () => {
  const resend = { memberId: "member-1" };

  it("queues a fresh invitation for a pending member under the membership lock", async () => {
    const { service, tx, activation, notifications } = setup();

    await service.resendInvitation(owner, resend);

    expect(tx.$queryRaw).toHaveBeenCalledTimes(1);
    expect(activation.issueMemberInvitation).toHaveBeenCalledWith(
      expect.objectContaining({ associationMemberId: "member-1" }),
    );
    expect(notifications.recordInvitation).toHaveBeenCalledTimes(1);
  });

  it("refuses a member who already accepted", async () => {
    const { service, prisma, activation } = setup();
    prisma.associationMember.findFirst.mockResolvedValue(
      memberRow({ status: AssociationMemberStatus.ACTIVE }),
    );

    await expect(service.resendInvitation(owner, resend)).rejects.toMatchObject(
      { response: { code: AssociationMessageCode.MEMBER_ALREADY_ACTIVE } },
    );
    expect(activation.issueMemberInvitation).not.toHaveBeenCalled();
  });

  it.each([
    ["COOLDOWN", AssociationMessageCode.MEMBER_INVITATION_COOLDOWN],
    ["DAILY_LIMIT", AssociationMessageCode.MEMBER_INVITATION_LIMIT_REACHED],
  ])("answers a %s refusal with its own code", async (refusal, code) => {
    const { service, activation, notifications } = setup();
    activation.issueMemberInvitation.mockResolvedValue({
      issued: false,
      refusal,
    });

    await expect(service.resendInvitation(owner, resend)).rejects.toMatchObject(
      { response: { code } },
    );
    expect(notifications.recordInvitation).not.toHaveBeenCalled();
  });

  it("answers a concurrent resend that lost on the live-token index as a cooldown", async () => {
    const { service, prisma } = setup();
    prisma.$transaction.mockImplementationOnce(() =>
      Promise.reject(uniqueViolation(["OtpCode_live_member_invite_key"])),
    );

    await expect(service.resendInvitation(owner, resend)).rejects.toMatchObject(
      {
        response: { code: AssociationMessageCode.MEMBER_INVITATION_COOLDOWN },
      },
    );
  });

  it("does not disguise an unrelated unique violation as a cooldown", async () => {
    const { service, prisma } = setup();
    const unrelated = uniqueViolation(["email"]);
    prisma.$transaction.mockImplementationOnce(() => Promise.reject(unrelated));

    await expect(service.resendInvitation(owner, resend)).rejects.toBe(
      unrelated,
    );
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

  it("refreshes learning targeting alongside requirements after a status change", async () => {
    const { service, assignments, learningRecipients } = setup();

    await service.setStatus(owner, {
      memberId: "member-1",
      status: AssociationMemberStatus.INACTIVE,
    });

    expect(assignments.materialiseForMember).toHaveBeenCalledWith("member-1");
    expect(learningRecipients.syncMember).toHaveBeenCalledWith("member-1");
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

  it("filters to members holding an assignment for the chosen requirement", async () => {
    const { service, prisma } = setup();
    await service.list(owner, { requirementId: "req-1" });
    const where = prisma.associationMember.findMany.mock.calls[0][0].where as {
      requirementAssignments?: { some: { requirementId: string } };
    };
    expect(where.requirementAssignments).toEqual({
      some: { requirementId: "req-1" },
    });
  });

  it("combines the requirement filter with group and status", async () => {
    const { service, prisma } = setup();
    await service.list(owner, {
      requirementId: "req-1",
      groupId: "group-1",
      status: "ACTIVE" as never,
    });
    const where = prisma.associationMember.findMany.mock.calls[0][0].where as {
      groupId?: string;
      status?: string;
      requirementAssignments?: { some: { requirementId: string } };
    };
    expect(where.groupId).toBe("group-1");
    expect(where.status).toBe("ACTIVE");
    expect(where.requirementAssignments).toEqual({
      some: { requirementId: "req-1" },
    });
  });

  // Regression: `AssociationAccessService.requireReadable` rejects an
  // explicit `associationId` from an ASSOCIATION-role caller (it must
  // resolve its own association implicitly). `attachComplianceSummaries`
  // used to forward the already-resolved `associationId` straight into
  // `complianceRead.memberComplianceList`, which re-runs that same check
  // and always rejected it for association owners — breaking the roster
  // query in production ("We could not load your roster") the moment a
  // member row existed, since the mocked `access` service here never
  // exercised the real rejection. Asserting the forwarded argument instead
  // of just the mocked return value is what would have caught this.
  it("does not forward an explicit associationId for an association-role caller", async () => {
    const { service, prisma, complianceRead } = setup();
    prisma.associationMember.findMany.mockResolvedValueOnce([memberRow()]);

    await service.list(owner, {});

    expect(complianceRead.memberComplianceList).toHaveBeenCalledWith(
      owner,
      { memberIds: ["member-1"] },
      undefined,
    );
  });

  it("forwards the explicit associationId for an admin caller", async () => {
    const { service, prisma, complianceRead } = setup();
    prisma.associationMember.findMany.mockResolvedValueOnce([memberRow()]);
    const admin = { id: "admin-1", role: Role.ADMIN };

    await service.list(admin, {}, undefined, "assoc-1");

    expect(complianceRead.memberComplianceList).toHaveBeenCalledWith(
      admin,
      { memberIds: ["member-1"] },
      "assoc-1",
    );
  });
});
