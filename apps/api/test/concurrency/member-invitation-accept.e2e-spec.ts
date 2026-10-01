import {
  AssociationMemberStatus,
  AssociationMessageDeliveryState,
  AssociationMessageType,
  OtpPurpose,
  Role,
  UserStatus,
} from "@prisma/client";
import { AssociationMemberInvitationService } from "@association/services/association-member-invitation.service";
import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { AssociationInviteOutcome } from "@association/enums/association-register.enum";
import { AssociationMemberService } from "@association/services/association-member.service";
import { AuthAccountActivationService } from "@auth/services/auth-account-activation.service";
import { AuthMessageCode } from "@auth/enums/message-code.enum";
import { HttpException } from "@nestjs/common";
import { MailService } from "@mail/mail.service";
import {
  bootApp,
  fulfilled,
  rejected,
  runTogether,
  suiteScope,
  type ConcurrencyApp,
} from "../setup/concurrency";

import { createHash, randomBytes } from "crypto";

const scope = suiteScope("member-invite");
const PASSWORD = "Concurrency-Test-1";
const WAIT_TIMEOUT_MS = 30_000;
const WAIT_STEP_MS = 100;

type SentMail = { to: string; text: string; key?: string };

const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

const codeOf = (reason: unknown) => {
  const body =
    reason instanceof HttpException ? reason.getResponse() : undefined;
  return typeof body === "object" && body !== null && "code" in body
    ? (body as { code: string }).code
    : undefined;
};

const tokenFrom = (text: string) => {
  const match = /token=([A-Za-z0-9_%-]+)/.exec(text);
  if (!match) throw new Error("No invitation link in the email body.");
  return decodeURIComponent(match[1]);
};

const waitFor = async <T>(probe: () => Promise<T | null>) => {
  const deadline = Date.now() + WAIT_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const value = await probe();
    if (value !== null) return value;
    await new Promise((resolve) => setTimeout(resolve, WAIT_STEP_MS));
  }
  throw new Error("Timed out waiting for the outbox.");
};

describe("Member invitation delivery and acceptance (concurrency e2e)", () => {
  let ctx: ConcurrencyApp;
  let activation: AuthAccountActivationService;
  let invitations: AssociationMemberInvitationService;
  let members: AssociationMemberService;
  const sent: SentMail[] = [];
  const failOnceFor = new Set<string>();

  const seedAssociation = async (label: string) => {
    const owner = await ctx.prisma.user.create({
      data: {
        email: scope.email(`${label}-owner`),
        role: Role.ASSOCIATION,
        status: UserStatus.ACTIVE,
        fullName: `${label} Owner`,
      },
    });
    const association = await ctx.prisma.association.create({
      data: { ownerId: owner.id, name: `${label} Association` },
    });
    return { association, owner: { id: owner.id, role: Role.ASSOCIATION } };
  };

  const seedMember = async (
    associationId: string,
    label: string,
    overrides: { userId?: string } = {},
  ) => {
    const userId =
      overrides.userId ??
      (
        await ctx.prisma.user.create({
          data: {
            email: scope.email(label),
            role: Role.PROFESSIONAL,
            status: UserStatus.PENDING,
            fullName: `Member ${label}`,
          },
        })
      ).id;
    const member = await ctx.prisma.associationMember.create({
      data: {
        associationId,
        userId,
        status: AssociationMemberStatus.PENDING_ACTIVATION,
      },
    });
    return { member, userId };
  };

  const seedToken = async (userId: string, associationMemberId: string) => {
    const rawToken = randomBytes(16).toString("hex");
    await ctx.prisma.otpCode.create({
      data: {
        userId,
        associationMemberId,
        destination: "invitee@example.test",
        codeHash: hashToken(rawToken),
        purpose: OtpPurpose.ASSOCIATION_MEMBER_INVITE,
        expiresAt: new Date(Date.now() + 60 * 60_000),
        maxAttempts: 1,
      },
    });
    return rawToken;
  };

  const liveTokens = (associationMemberId: string) =>
    ctx.prisma.otpCode.count({
      where: {
        associationMemberId,
        purpose: OtpPurpose.ASSOCIATION_MEMBER_INVITE,
        consumedAt: null,
      },
    });

  const invitationDeliveries = (memberId: string) =>
    ctx.prisma.associationMessageDelivery.findMany({
      where: { memberId, messageType: AssociationMessageType.INVITATION },
      select: { id: true, state: true, failureReason: true },
    });

  const outboxEventsFor = (deliveryIds: string[]) =>
    ctx.prisma.outboxEvent.count({
      where: { aggregateId: { in: deliveryIds } },
    });

  const endCooldown = (associationMemberId: string) =>
    ctx.prisma.otpCode.updateMany({
      where: { associationMemberId },
      data: { resendAfter: new Date(Date.now() - 1000) },
    });

  const mailTo = (email: string) => sent.filter((mail) => mail.to === email);

  beforeAll(async () => {
    process.env.OUTBOX_POLL_INTERVAL_MS = "100";
    ctx = await bootApp((builder) =>
      builder.overrideProvider(MailService).useValue({
        sendEmail: async () => ({ id: "outbox" }),
        deliver: async (
          input: { to: string | string[]; text: string },
          key?: string,
        ) => {
          const to = Array.isArray(input.to) ? input.to.join(",") : input.to;
          if (failOnceFor.delete(to)) throw new Error("provider unavailable");
          sent.push({ to, text: input.text, key });
          return { id: "resend" };
        },
      }),
    );
    activation = ctx.app.get(AuthAccountActivationService);
    invitations = ctx.app.get(AssociationMemberInvitationService);
    members = ctx.app.get(AssociationMemberService);
    await scope.cleanup(ctx.prisma);
  }, 120_000);

  afterAll(async () => {
    if (ctx?.prisma) await scope.cleanup(ctx.prisma);
    await ctx?.app?.close();
  }, 60_000);

  it("sends a never-seen email exactly one invitation whose link activates the membership", async () => {
    const { association, owner } = await seedAssociation("journey");
    const email = scope.email("journey-invitee");

    const result = await members.invite(owner, {
      email,
      fullName: "Journey Invitee",
    });
    expect(result.outcome).toBe(AssociationInviteOutcome.INVITATION_SENT);
    expect(result.member.status).toBe(
      AssociationMemberStatus.PENDING_ACTIVATION,
    );

    const [mail] = await waitFor(async () =>
      mailTo(email).length ? mailTo(email) : null,
    );
    expect(mailTo(email)).toHaveLength(1);
    const token = tokenFrom(mail.text);

    const stillPending = await ctx.prisma.associationMember.findFirstOrThrow({
      where: { associationId: association.id, user: { email } },
    });
    expect(stillPending.status).toBe(
      AssociationMemberStatus.PENDING_ACTIVATION,
    );

    await expect(activation.describeMemberInvitation(token)).resolves.toEqual({
      status: "VALID",
      associationName: "journey Association",
      requiresPassword: true,
    });
    await invitations.acceptInvitation({
      token,
      password: PASSWORD,
      confirmPassword: PASSWORD,
    });

    const member = await ctx.prisma.associationMember.findUniqueOrThrow({
      where: { id: stillPending.id },
      include: { user: true },
    });
    expect(member.status).toBe(AssociationMemberStatus.ACTIVE);
    expect(member.activatedAt).not.toBeNull();
    expect(member.user.status).toBe(UserStatus.ACTIVE);
    await expect(activation.describeMemberInvitation(token)).resolves.toEqual(
      expect.objectContaining({ status: "USED" }),
    );
  }, 60_000);

  it("retries a provider failure as the same email and records the retry", async () => {
    const { association, owner } = await seedAssociation("retry");
    const email = scope.email("retry-invitee");
    failOnceFor.add(email);

    await members.invite(owner, { email, fullName: "Retry Invitee" });
    const member = await ctx.prisma.associationMember.findFirstOrThrow({
      where: { associationId: association.id, user: { email } },
    });

    await waitFor(async () => {
      const [delivery] = await invitationDeliveries(member.id);
      return delivery?.failureReason ===
        AssociationMessageCode.MESSAGE_DELIVERY_RETRYING
        ? delivery
        : null;
    });
    await waitFor(async () => (mailTo(email).length ? true : null));

    expect(mailTo(email)).toHaveLength(1);
    const deliveries = await invitationDeliveries(member.id);
    expect(deliveries).toHaveLength(1);
    expect(deliveries[0]).toEqual(
      expect.objectContaining({
        state: AssociationMessageDeliveryState.SENT,
        failureReason: null,
      }),
    );
    const event = await ctx.prisma.outboxEvent.findFirstOrThrow({
      where: { aggregateId: deliveries[0].id },
    });
    expect(event.attemptCount).toBe(2);
    expect(mailTo(email)[0].key).toBe(`outbox-${event.id}`);
  }, 60_000);

  it("lets exactly one of many simultaneous resends issue a token and queue an email", async () => {
    const { owner } = await seedAssociation("resend");
    const email = scope.email("resend-invitee");
    const invited = await members.invite(owner, {
      email,
      fullName: "Resend Invitee",
    });
    await endCooldown(invited.member.id);

    const results = await runTogether(6, () =>
      members.resendInvitation(owner, { memberId: invited.member.id }),
    );

    expect(fulfilled(results)).toHaveLength(1);
    for (const failure of rejected(results))
      expect(codeOf(failure.reason)).toBe(
        AssociationMessageCode.MEMBER_INVITATION_COOLDOWN,
      );
    expect(await liveTokens(invited.member.id)).toBe(1);
    const deliveries = await invitationDeliveries(invited.member.id);
    expect(deliveries).toHaveLength(2);
    expect(await outboxEventsFor(deliveries.map(({ id }) => id))).toBe(2);
  }, 60_000);

  it("never answers a repeat Add member for a pending member as sent while the cooldown holds", async () => {
    const { owner } = await seedAssociation("repeat");
    const email = scope.email("repeat-invitee");
    await members.invite(owner, { email, fullName: "Repeat Invitee" });

    const again = await members.invite(owner, {
      email,
      fullName: "Repeat Invitee",
    });

    expect(again.outcome).toBe(AssociationInviteOutcome.INVITATION_COOLDOWN);
    expect(await liveTokens(again.member.id)).toBe(1);
    expect(await invitationDeliveries(again.member.id)).toHaveLength(1);
  }, 60_000);

  it("settles a resend racing an acceptance into one consistent state", async () => {
    const { owner, association } = await seedAssociation("resend-accept");
    const { member, userId } = await seedMember(association.id, "ra-member");
    const token = await seedToken(userId, member.id);

    const results = await runTogether<unknown>(2, (index) =>
      index === 0
        ? invitations.acceptInvitation({
            token,
            password: PASSWORD,
            confirmPassword: PASSWORD,
          })
        : members.resendInvitation(owner, { memberId: member.id }),
    );

    const allowed = [
      AuthMessageCode.ACTIVATION_TOKEN_USED,
      AssociationMessageCode.MEMBER_ALREADY_ACTIVE,
      AssociationMessageCode.MEMBER_STATUS_CONFLICT,
    ] as string[];
    for (const failure of rejected(results))
      expect(allowed).toContain(codeOf(failure.reason));

    const final = await ctx.prisma.associationMember.findUniqueOrThrow({
      where: { id: member.id },
    });
    const live = await liveTokens(member.id);
    if (results[0].status === "fulfilled") {
      expect(final.status).toBe(AssociationMemberStatus.ACTIVE);
    } else {
      expect(final.status).toBe(AssociationMemberStatus.PENDING_ACTIVATION);
      expect(live).toBe(1);
    }
    expect(live).toBeLessThanOrEqual(1);
  }, 60_000);

  it("accepts exactly once when the same invitation is accepted at once", async () => {
    const { association } = await seedAssociation("race");
    const { member, userId } = await seedMember(association.id, "race-member");
    const token = await seedToken(userId, member.id);

    const results = await runTogether(8, () =>
      invitations.acceptInvitation({
        token,
        password: PASSWORD,
        confirmPassword: PASSWORD,
      }),
    );

    expect(fulfilled(results)).toHaveLength(1);
    for (const failure of rejected(results))
      expect(codeOf(failure.reason)).toBe(
        AuthMessageCode.ACTIVATION_TOKEN_USED,
      );

    const activated = await ctx.prisma.associationMember.findUniqueOrThrow({
      where: { id: member.id },
    });
    expect(activated.status).toBe(AssociationMemberStatus.ACTIVE);
    const user = await ctx.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    expect(user.status).toBe(UserStatus.ACTIVE);
    expect(user.passwordHash).not.toBeNull();
    expect(await liveTokens(member.id)).toBe(0);
    expect(
      await ctx.prisma.auditLog.count({
        where: { entityType: "AssociationMember", entityId: member.id },
      }),
    ).toBe(1);
  }, 60_000);

  it("cannot accept a token issued for a different membership", async () => {
    const a = await seedAssociation("cross-a");
    const b = await seedAssociation("cross-b");
    const { member: memberA, userId } = await seedMember(
      a.association.id,
      "cross-member",
    );
    const { member: memberB } = await seedMember(
      b.association.id,
      "cross-member-b",
      { userId },
    );
    const tokenA = await seedToken(userId, memberA.id);
    const tokenB = await seedToken(userId, memberB.id);

    await invitations.acceptInvitation({
      token: tokenA,
      password: PASSWORD,
      confirmPassword: PASSWORD,
    });

    const readStatus = async (id: string) =>
      (
        await ctx.prisma.associationMember.findUniqueOrThrow({
          where: { id },
        })
      ).status;
    expect(await readStatus(memberA.id)).toBe(AssociationMemberStatus.ACTIVE);
    expect(await readStatus(memberB.id)).toBe(
      AssociationMemberStatus.PENDING_ACTIVATION,
    );
    await expect(
      invitations.acceptInvitation({ token: tokenA }),
    ).rejects.toMatchObject({
      response: { code: AuthMessageCode.ACTIVATION_TOKEN_USED },
    });
    await expect(activation.describeMemberInvitation(tokenB)).resolves.toEqual(
      expect.objectContaining({ status: "VALID", requiresPassword: false }),
    );
  }, 60_000);

  it("issuing a second membership's invitation does not invalidate the first's still-pending one", async () => {
    const a = await seedAssociation("scope-a");
    const b = await seedAssociation("scope-b");
    const { member: memberA, userId } = await seedMember(
      a.association.id,
      "scope-member",
    );
    const { member: memberB } = await seedMember(
      b.association.id,
      "scope-member-b",
      { userId },
    );
    const tokenA = await seedToken(userId, memberA.id);

    const issue = await activation.issueMemberInvitation({
      userId,
      destination: "invitee@example.test",
      associationMemberId: memberB.id,
      atomicContext: ctx.prisma,
    });

    expect(issue.issued).toBe(true);
    await expect(activation.describeMemberInvitation(tokenA)).resolves.toEqual(
      expect.objectContaining({ status: "VALID" }),
    );
  }, 60_000);

  it("refuses a second live token for one membership at the database", async () => {
    const { association } = await seedAssociation("index");
    const { member, userId } = await seedMember(association.id, "idx-member");
    await seedToken(userId, member.id);

    await expect(seedToken(userId, member.id)).rejects.toMatchObject({
      code: "P2002",
    });
    expect(await liveTokens(member.id)).toBe(1);
  }, 60_000);

  it("rejects malformed and expired tokens without activating anything", async () => {
    const { association } = await seedAssociation("reject");
    const { member, userId } = await seedMember(association.id, "rej-member");
    const token = await seedToken(userId, member.id);
    await ctx.prisma.otpCode.updateMany({
      where: { associationMemberId: member.id },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });

    await expect(
      invitations.acceptInvitation({
        token: "not-a-real-invitation-token-value",
        password: PASSWORD,
        confirmPassword: PASSWORD,
      }),
    ).rejects.toMatchObject({
      response: { code: AuthMessageCode.ACTIVATION_TOKEN_INVALID },
    });
    await expect(
      invitations.acceptInvitation({
        token,
        password: PASSWORD,
        confirmPassword: PASSWORD,
      }),
    ).rejects.toMatchObject({
      response: { code: AuthMessageCode.ACTIVATION_TOKEN_EXPIRED },
    });
    const unchanged = await ctx.prisma.associationMember.findUniqueOrThrow({
      where: { id: member.id },
    });
    expect(unchanged.status).toBe(AssociationMemberStatus.PENDING_ACTIVATION);
  }, 60_000);
});
