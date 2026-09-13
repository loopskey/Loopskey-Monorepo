import { AssociationMessageHandler } from "@association/application/association-message.handler";
import { AssociationMessageService } from "@association/services/association-message.service";
import { ASSOCIATION_MESSAGE_EVENT } from "@association/services/association-message.service";
import { AssociationAttentionService } from "@association/services/association-attention.service";
import { AssociationAttentionSection } from "@association/enums/association-attention.enum";
import { AssociationMessageSkipReason } from "@association/enums/association-attention.enum";
import { AssociationComplianceService } from "@association/services/association-compliance.service";
import { AssociationMessageDeliveryState } from "@prisma/client";
import { AssociationMessageType, AppLanguage } from "@prisma/client";
import { AssociationEvidencePolicy } from "@prisma/client";
import { AssociationRequirementStatus } from "@prisma/client";
import { AssociationAudienceKind } from "@prisma/client";
import { AssociationMemberStatus } from "@prisma/client";
import { CreditType, PDUCategory, PDUSource, Role } from "@prisma/client";
import { INestApplication } from "@nestjs/common";
import { MailService } from "@mail/mail.service";
import { PrismaService } from "@prisma/prisma.service";
import { bootApp, fulfilled, runTogether, suiteScope } from "../setup/concurrency";

const scope = suiteScope("association-message");

const REQUIRED_CREDITS = 20;

const day = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

const inDays = (days: number) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000);

describe("Association templated messages (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let messages: AssociationMessageService;
  let attention: AssociationAttentionService;
  let handler: AssociationMessageHandler;

  const delivered: { to: string; subject: string; key?: string }[] = [];

  let ownerId: string;
  let otherOwnerId: string;
  let associationId: string;
  let otherAssociationId: string;
  let behindMemberId: string;
  let sharedUserId: string;

  const owner = () => ({ id: ownerId, role: Role.ASSOCIATION });
  const otherOwner = () => ({ id: otherOwnerId, role: Role.ASSOCIATION });

  const audience = { section: AssociationAttentionSection.BELOW_THRESHOLD };

  const buildAssociation = async (label: string, userId: string) =>
    prisma.association.create({
      data: {
        name: scope.eventTitle(label),
        ownerId: userId,
        settings: {
          create: { onTrackThreshold: 70, atRiskThreshold: 40 },
        },
      },
    });

  const addMember = async ({
    label,
    credits,
    association,
    language,
    verified = true,
    status = AssociationMemberStatus.ACTIVE,
    userId,
  }: {
    label: string;
    credits: number;
    association: string;
    language?: AppLanguage;
    verified?: boolean;
    status?: AssociationMemberStatus;
    userId?: string;
  }) => {
    const user =
      userId ??
      (
        await prisma.user.create({
          data: {
            email: scope.email(label),
            role: Role.PROFESSIONAL,
            status: "ACTIVE",
            fullName: `Message ${label}`,
            emailVerifiedAt: verified ? new Date() : null,
            ...(language
              ? { professionalProfile: { create: { language } } }
              : {}),
          },
        })
      ).id;

    const member = await prisma.associationMember.create({
      data: {
        status,
        userId: user,
        associationId: association,
        activatedAt: new Date(),
        memberNumber: `MSG-${label}`,
      },
    });

    const requirement = await prisma.associationRequirement.findFirstOrThrow({
      where: { associationId: association },
      select: { id: true },
    });

    const assignment = await prisma.associationRequirementAssignment.create({
      data: {
        memberId: member.id,
        requirementId: requirement.id,
        cycleStart: day("2026-01-01"),
        dueDate: inDays(10),
      },
    });

    if (credits > 0)
      await prisma.pDUActivity.create({
        data: {
          userId: user,
          title: scope.eventTitle(`activity-${label}`),
          date: day("2026-06-01"),
          pdus: credits,
          source: PDUSource.OTHER,
          category: PDUCategory.TECHNICAL,
          creditType: CreditType.CPD,
        },
      });

    await app.get(AssociationComplianceService).recomputeAssignment(assignment.id);

    return { memberId: member.id, userId: user };
  };

  const addRequirement = async (association: string, createdBy: string) =>
    prisma.associationRequirement.create({
      data: {
        associationId: association,
        createdById: createdBy,
        name: scope.eventTitle("requirement"),
        creditType: CreditType.CPD,
        totalRequiredCredits: REQUIRED_CREDITS,
        deadline: day("2026-12-31"),
        reportingStart: day("2026-01-01"),
        reportingEnd: day("2026-12-31"),
        evidencePolicy: AssociationEvidencePolicy.NOT_REQUIRED,
        audienceKind: AssociationAudienceKind.ALL_MEMBERS,
        status: AssociationRequirementStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });

  beforeAll(async () => {
    ({ app, prisma } = await bootApp((builder) =>
      builder.overrideProvider(MailService).useValue({
        sendEmail: async () => ({ id: "outbox" }),
        deliver: async (
          input: { to: string; subject: string },
          key?: string,
        ) => {
          delivered.push({ to: input.to, subject: input.subject, key });
          return { id: "resend" };
        },
      }),
    ));

    messages = app.get(AssociationMessageService);
    attention = app.get(AssociationAttentionService);
    handler = app.get(AssociationMessageHandler);

    await scope.cleanup(prisma);

    const ownerUser = await prisma.user.create({
      data: {
        email: scope.email("owner"),
        role: Role.ASSOCIATION,
        status: "ACTIVE",
      },
    });
    ownerId = ownerUser.id;

    const otherOwnerUser = await prisma.user.create({
      data: {
        email: scope.email("other-owner"),
        role: Role.ASSOCIATION,
        status: "ACTIVE",
      },
    });
    otherOwnerId = otherOwnerUser.id;

    associationId = (await buildAssociation("association", ownerId)).id;
    otherAssociationId = (
      await buildAssociation("other-association", otherOwnerId)
    ).id;

    await addRequirement(associationId, ownerId);
    await addRequirement(otherAssociationId, otherOwnerId);

    const behind = await addMember({
      credits: 2,
      label: "behind",
      association: associationId,
    });
    behindMemberId = behind.memberId;
    sharedUserId = behind.userId;

    await addMember({
      credits: 1,
      label: "french",
      language: AppLanguage.FR,
      association: associationId,
    });

    await addMember({
      credits: 1,
      verified: false,
      label: "unverified",
      association: associationId,
    });

    await addMember({
      credits: 1,
      label: "deactivated",
      association: associationId,
      status: AssociationMemberStatus.INACTIVE,
    });

    await addMember({
      credits: 1,
      label: "shared",
      userId: sharedUserId,
      association: otherAssociationId,
    });
  });

  afterAll(async () => {
    await scope.cleanup(prisma);
    await app.close();
  });

  it("lists the members below the threshold and leaves the deactivated one out", async () => {
    const rows = await attention.rowsFor(
      owner(),
      AssociationAttentionSection.BELOW_THRESHOLD,
    );

    const numbers = rows.map((row) => row.memberNumber);

    expect(numbers).toContain("MSG-behind");
    expect(numbers).toContain("MSG-french");
    expect(numbers).not.toContain("MSG-deactivated");
  });

  it("writes one delivery and one event per eligible recipient, and none for a skip", async () => {
    const result = await messages.send(
      owner(),
      AssociationMessageType.BEHIND_THRESHOLD,
      audience,
    );

    expect(result.acceptedCount).toBeGreaterThan(0);
    expect(
      result.skipped.some(
        (skip) => skip.reason === AssociationMessageSkipReason.NO_VERIFIED_EMAIL,
      ),
    ).toBe(true);

    const deliveries = await prisma.associationMessageDelivery.findMany({
      where: { associationId },
      select: { id: true, memberId: true, state: true, language: true },
    });

    expect(deliveries).toHaveLength(result.acceptedCount);
    expect(
      deliveries.every(
        (row) => row.state === AssociationMessageDeliveryState.QUEUED,
      ),
    ).toBe(true);

    const events = await prisma.outboxEvent.count({
      where: {
        eventName: ASSOCIATION_MESSAGE_EVENT,
        aggregateId: { in: deliveries.map((row) => row.id) },
      },
    });

    expect(events).toBe(deliveries.length);
  });

  it("reports the member sent to yesterday as skipped by the cooldown", async () => {
    const result = await messages.send(
      owner(),
      AssociationMessageType.BEHIND_THRESHOLD,
      audience,
    );

    expect(result.acceptedCount).toBe(0);
    expect(
      result.skipped.some(
        (skip) =>
          skip.memberId === behindMemberId &&
          skip.reason === AssociationMessageSkipReason.COOLDOWN,
      ),
    ).toBe(true);
  });

  it("generates one delivery when the same send runs simultaneously", async () => {
    await prisma.associationMessageDelivery.deleteMany({
      where: { associationId },
    });

    const results = await runTogether(4, () =>
      messages.send(owner(), AssociationMessageType.BEHIND_THRESHOLD, audience),
    );

    const answered = fulfilled(results).map((one) => one.value);
    const accepted = answered.reduce(
      (total, one) => total + one.acceptedCount,
      0,
    );

    const perMember = await prisma.associationMessageDelivery.groupBy({
      by: ["memberId"],
      where: { associationId },
      _count: { _all: true },
    });

    expect(answered).toHaveLength(4);
    expect(perMember.every((row) => row._count._all === 1)).toBe(true);
    expect(accepted).toBe(perMember.length);
  });

  it("delivers each copy once, and a redelivery sends nothing more", async () => {
    const queued = await prisma.associationMessageDelivery.findFirstOrThrow({
      where: { associationId, state: AssociationMessageDeliveryState.QUEUED },
    });

    const event = {
      id: "e2e-event",
      attemptCount: 1,
      correlationId: null,
      eventName: ASSOCIATION_MESSAGE_EVENT,
      idempotencyKey: `outbox-${queued.id}`,
      renewLease: async () => undefined,
    };

    delivered.length = 0;

    await handler.handle({ deliveryId: queued.id }, event);
    await handler.handle({ deliveryId: queued.id }, event);

    const settled = await prisma.associationMessageDelivery.findUniqueOrThrow({
      where: { id: queued.id },
    });

    expect(delivered).toHaveLength(1);
    expect(delivered[0].key).toBe(`outbox-${queued.id}`);
    expect(settled.state).toBe(AssociationMessageDeliveryState.SENT);
    expect(settled.sentAt).not.toBeNull();
  });

  it("writes French for the French-speaking member", async () => {
    const french = await prisma.associationMessageDelivery.findFirstOrThrow({
      where: {
        associationId,
        member: { memberNumber: "MSG-french" },
      },
      select: { language: true },
    });

    expect(french.language).toBe(AppLanguage.FR);
  });

  it("lets a second association message the same professional", async () => {
    const result = await messages.send(
      otherOwner(),
      AssociationMessageType.BEHIND_THRESHOLD,
      audience,
    );

    expect(result.acceptedCount).toBe(1);

    const both = await prisma.associationMessageDelivery.findMany({
      where: { recipientUserId: sharedUserId },
      select: { associationId: true },
    });

    expect(new Set(both.map((row) => row.associationId)).size).toBe(2);
  });

  it("shows every copy in the association's own history and nobody else's", async () => {
    const mine = await messages.history(owner());
    const theirs = await messages.history(otherOwner());

    expect(mine.totalCount).toBeGreaterThan(0);
    expect(theirs.totalCount).toBe(1);
    expect(
      mine.items.every((row) => row.messageType === "BEHIND_THRESHOLD"),
    ).toBe(true);
  });
});
