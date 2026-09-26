import {
  AssociationMemberStatus,
  OtpPurpose,
  Role,
  UserStatus,
} from "@prisma/client";
import { AssociationMemberInvitationService } from "@association/services/association-member-invitation.service";
import { AuthAccountActivationService } from "@auth/services/auth-account-activation.service";
import { AuthMessageCode } from "@auth/enums/message-code.enum";
import { HttpException } from "@nestjs/common";
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
const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");
const codeOf = (reason: unknown) => {
  const body =
    reason instanceof HttpException ? reason.getResponse() : undefined;
  return typeof body === "object" && body !== null && "code" in body
    ? (body as { code: string }).code
    : undefined;
};

/**
 * Member invitation acceptance: the conditional-consume race, and the
 * membership-scoped isolation that stops one association's invitation
 * activity from touching another's.
 *
 * This suite talks to the service directly against the app's own PrismaService
 * rather than through GraphQL — the concurrency property under test lives in
 * `AuthAccountActivationService.acceptMemberInvitationToken` (token consume)
 * and `AssociationMemberInvitationService.acceptInvitation` (the membership
 * activation that wraps it in one transaction), and a booted app is only
 * needed to get a real, correctly-wired PrismaService.
 */
describe("Member invitation acceptance (concurrency e2e)", () => {
  let ctx: ConcurrencyApp;
  let activation: AuthAccountActivationService;
  let invitations: AssociationMemberInvitationService;

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
    return association;
  };

  const seedMember = async (
    associationId: string,
    label: string,
    overrides: { userId?: string; email?: string } = {},
  ) => {
    const userId =
      overrides.userId ??
      (
        await ctx.prisma.user.create({
          data: {
            email: overrides.email ?? scope.email(label),
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

  beforeAll(async () => {
    ctx = await bootApp();
    activation = ctx.app.get(AuthAccountActivationService);
    invitations = ctx.app.get(AssociationMemberInvitationService);
    await scope.cleanup(ctx.prisma);
  }, 120_000);

  afterAll(async () => {
    if (ctx?.prisma) await scope.cleanup(ctx.prisma);
    await ctx?.app?.close();
  }, 60_000);

  it("accepts exactly once when the same invitation is accepted at once", async () => {
    const association = await seedAssociation("race");
    const { member, userId } = await seedMember(association.id, "race-member");
    const token = await seedToken(userId, member.id);

    const results = await runTogether(8, () =>
      invitations.acceptInvitation({
        token,
        password: "Concurrency-Test-1",
        confirmPassword: "Concurrency-Test-1",
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
  }, 60_000);

  it("cannot accept a token issued for a different membership", async () => {
    const associationA = await seedAssociation("cross-a");
    const associationB = await seedAssociation("cross-b");
    const { member: memberA, userId } = await seedMember(
      associationA.id,
      "cross-member",
    );
    // Same underlying (still-pending) person, invited separately by a second
    // association — this is exactly the scenario the associationMemberId
    // scope exists for.
    const { member: memberB } = await seedMember(
      associationB.id,
      "cross-member-b",
      {
        userId,
      },
    );
    const tokenA = await seedToken(userId, memberA.id);
    await seedToken(userId, memberB.id);

    await invitations.acceptInvitation({
      token: tokenA,
      password: "Concurrency-Test-1",
      confirmPassword: "Concurrency-Test-1",
    });

    const a = await ctx.prisma.associationMember.findUniqueOrThrow({
      where: { id: memberA.id },
    });
    const b = await ctx.prisma.associationMember.findUniqueOrThrow({
      where: { id: memberB.id },
    });
    expect(a.status).toBe(AssociationMemberStatus.ACTIVE);
    // Accepting A's invitation must not also activate B's membership: they
    // are two independent invitations to two independent memberships that
    // merely happen to share a person.
    expect(b.status).toBe(AssociationMemberStatus.PENDING_ACTIVATION);
  }, 60_000);

  it("issuing a second membership's invitation does not invalidate the first's still-pending one", async () => {
    const associationA = await seedAssociation("scope-a");
    const associationB = await seedAssociation("scope-b");
    const { member: memberA, userId } = await seedMember(
      associationA.id,
      "scope-member",
    );
    const { member: memberB } = await seedMember(
      associationB.id,
      "scope-member-b",
      {
        userId,
      },
    );
    const tokenA = await seedToken(userId, memberA.id);

    // Association B issuing its own invitation to the same (still-pending)
    // person must not touch association A's already-issued, still-unused
    // token — the bug this feature fixes.
    await activation.issueMemberInvitation({
      userId,
      destination: "invitee@example.test",
      associationMemberId: memberB.id,
      atomicContext: ctx.prisma,
    });

    const status = await activation.describeMemberInvitation(tokenA);
    expect(status.status).toBe("VALID");
  }, 60_000);
});
