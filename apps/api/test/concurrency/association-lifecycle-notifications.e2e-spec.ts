import { AssociationLearningContentRecipientService } from "@association/services/association-learning-content-recipient.service";
import { AssociationRequirementAssignmentService } from "@association/services/association-requirement-assignment.service";
import { AssociationRequirementService } from "@association/services/association-requirement.service";
import { AssociationLifecycleMessageHandler } from "@association/application/association-lifecycle-message.handler";
import { AssociationMemberInvitationService } from "@association/services/association-member-invitation.service";
import { AssociationLearningContentService } from "@association/services/association-learning-content.service";
import { AssociationAttentionService } from "@association/services/association-attention.service";
import { AssociationMessageService } from "@association/services/association-message.service";
import { AssociationMemberService } from "@association/services/association-member.service";
import { LIFECYCLE_EVENT_BY_TYPE } from "@association/enums/association-notification.enum";
import { AssociationAttentionSection } from "@association/enums/association-attention.enum";
import { AssociationMessageSkipReason } from "@association/enums/association-attention.enum";
import { AssociationInviteOutcome } from "@association/enums/association-register.enum";
import { AssociationMessageDeliveryState } from "@prisma/client";
import { AssociationRequirementStatus } from "@prisma/client";
import { AssociationEvidencePolicy } from "@prisma/client";
import { AssociationMessageType } from "@prisma/client";
import { AssociationAudienceKind } from "@prisma/client";
import { AssociationMemberStatus } from "@prisma/client";
import { OtpPurpose, UserStatus } from "@prisma/client";
import { CreditType, Role } from "@prisma/client";
import { MailService } from "@mail/mail.service";
import { PrismaService } from "@prisma/prisma.service";
import { INestApplication } from "@nestjs/common";
import {
  bootApp,
  fulfilled,
  runTogether,
  suiteScope,
} from "../setup/concurrency";

import { createHash, randomBytes } from "crypto";

const scope = suiteScope("association-lifecycle");

jest.setTimeout(60_000);

const DRAIN_TIMEOUT_MS = 30_000;

const day = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type Delivered = { to: string; subject: string; key?: string };

describe("Association lifecycle notifications (concurrency e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let members: AssociationMemberService;
  let invitations: AssociationMemberInvitationService;
  let assignments: AssociationRequirementAssignmentService;
  let requirements: AssociationRequirementService;
  let learning: AssociationLearningContentService;
  let learningRecipients: AssociationLearningContentRecipientService;
  let messages: AssociationMessageService;
  let attention: AssociationAttentionService;
  let handler: AssociationLifecycleMessageHandler;

  const delivered: Delivered[] = [];
  const previousPollInterval = process.env.OUTBOX_POLL_INTERVAL_MS;

  let ownerId: string;
  let otherOwnerId: string;
  let associationId: string;
  let otherAssociationId: string;
  let groupA: string;
  let groupB: string;
  let requirementAll: string;
  let requirementA: string;
  let requirementB: string;

  const owner = () => ({ id: ownerId, role: Role.ASSOCIATION });
  const otherOwner = () => ({ id: otherOwnerId, role: Role.ASSOCIATION });

  const deliveriesOf = (
    memberId: string,
    messageType: AssociationMessageType,
  ) =>
    prisma.associationMessageDelivery.findMany({
      where: { memberId, messageType },
      select: { id: true, state: true, skipReason: true, context: true },
    });

  const mailTo = (email: string) => delivered.filter((one) => one.to === email);

  const drain = async () => {
    const deadline = Date.now() + DRAIN_TIMEOUT_MS;
    while (Date.now() < deadline) {
      const [queued, unprocessed] = await Promise.all([
        prisma.associationMessageDelivery.count({
          where: {
            associationId: { in: [associationId, otherAssociationId] },
            state: AssociationMessageDeliveryState.QUEUED,
          },
        }),
        prisma.outboxEvent.count({
          where: {
            processedAt: null,
            eventName: "association.learning-content.audience-changed.v1",
            aggregateType: "AssociationLearningContent",
            payload: { path: ["associationId"], equals: associationId },
          },
        }),
      ]);
      if (queued === 0 && unprocessed === 0) return;
      await pause(150);
    }
    throw new Error("The outbox did not drain in time.");
  };

  const professional = async (
    label: string,
    status: UserStatus = UserStatus.ACTIVE,
  ) =>
    prisma.user.create({
      data: {
        email: scope.email(label),
        role: Role.PROFESSIONAL,
        status,
        fullName: `Lifecycle ${label}`,
        emailVerifiedAt: status === UserStatus.ACTIVE ? new Date() : null,
      },
    });

  const linkActive = async (label: string, groupId?: string) => {
    const user = await professional(label);
    const result = await members.invite(owner(), {
      email: user.email!,
      fullName: user.fullName!,
      ...(groupId ? { groupId } : {}),
    });
    expect(result.outcome).toBe(AssociationInviteOutcome.LINKED_EXISTING_USER);
    return { memberId: result.member.id, email: user.email!, userId: user.id };
  };

  const seedToken = async (userId: string, associationMemberId: string) => {
    const rawToken = randomBytes(16).toString("hex");
    await prisma.otpCode.create({
      data: {
        userId,
        associationMemberId,
        destination: "invitee@example.test",
        codeHash: createHash("sha256").update(rawToken).digest("hex"),
        purpose: OtpPurpose.ASSOCIATION_MEMBER_INVITE,
        expiresAt: new Date(Date.now() + 60 * 60_000),
        maxAttempts: 1,
      },
    });
    return rawToken;
  };

  const addRequirement = async (
    label: string,
    audienceKind: AssociationAudienceKind,
    groupId?: string,
    status: AssociationRequirementStatus = AssociationRequirementStatus.PUBLISHED,
  ) =>
    (
      await prisma.associationRequirement.create({
        data: {
          associationId,
          createdById: ownerId,
          name: scope.eventTitle(label),
          creditType: CreditType.CPD,
          totalRequiredCredits: 10,
          deadline: day("2026-12-31"),
          reportingStart: day("2026-01-01"),
          reportingEnd: day("2026-12-31"),
          evidencePolicy: AssociationEvidencePolicy.NOT_REQUIRED,
          audienceKind,
          status,
          publishedAt:
            status === AssociationRequirementStatus.PUBLISHED
              ? new Date()
              : null,
          ...(groupId
            ? { targets: { create: [{ kind: audienceKind, groupId }] } }
            : {}),
        },
      })
    ).id;

  beforeAll(async () => {
    process.env.OUTBOX_POLL_INTERVAL_MS = "100";
    ({ app, prisma } = await bootApp((builder) =>
      builder.overrideProvider(MailService).useValue({
        sendEmail: async () => ({ id: "outbox" }),
        deliver: async (
          input: { to: string | string[]; subject: string },
          key?: string,
        ) => {
          delivered.push({
            to: Array.isArray(input.to) ? input.to.join(",") : input.to,
            subject: input.subject,
            key,
          });
          return { id: "resend" };
        },
      }),
    ));

    members = app.get(AssociationMemberService);
    invitations = app.get(AssociationMemberInvitationService);
    assignments = app.get(AssociationRequirementAssignmentService);
    requirements = app.get(AssociationRequirementService);
    learning = app.get(AssociationLearningContentService);
    learningRecipients = app.get(AssociationLearningContentRecipientService);
    messages = app.get(AssociationMessageService);
    attention = app.get(AssociationAttentionService);
    handler = app.get(AssociationLifecycleMessageHandler);

    await scope.cleanup(prisma);

    ownerId = (
      await prisma.user.create({
        data: {
          email: scope.email("owner"),
          role: Role.ASSOCIATION,
          status: UserStatus.ACTIVE,
        },
      })
    ).id;
    otherOwnerId = (
      await prisma.user.create({
        data: {
          email: scope.email("other-owner"),
          role: Role.ASSOCIATION,
          status: UserStatus.ACTIVE,
        },
      })
    ).id;

    associationId = (
      await prisma.association.create({
        data: {
          ownerId,
          name: scope.eventTitle("association"),
          settings: { create: {} },
        },
      })
    ).id;
    otherAssociationId = (
      await prisma.association.create({
        data: {
          ownerId: otherOwnerId,
          name: scope.eventTitle("other-association"),
          settings: { create: {} },
        },
      })
    ).id;

    groupA = (
      await prisma.associationGroup.create({
        data: { associationId, title: scope.eventTitle("group-a") },
      })
    ).id;
    groupB = (
      await prisma.associationGroup.create({
        data: { associationId, title: scope.eventTitle("group-b") },
      })
    ).id;

    requirementAll = await addRequirement(
      "requirement-all",
      AssociationAudienceKind.ALL_MEMBERS,
    );
    requirementA = await addRequirement(
      "requirement-a",
      AssociationAudienceKind.GROUP,
      groupA,
    );
    requirementB = await addRequirement(
      "requirement-b",
      AssociationAudienceKind.GROUP,
      groupB,
    );
  }, 120_000);

  afterAll(async () => {
    if (previousPollInterval === undefined)
      delete process.env.OUTBOX_POLL_INTERVAL_MS;
    else process.env.OUTBOX_POLL_INTERVAL_MS = previousPollInterval;
    if (prisma) await scope.cleanup(prisma);
    await app?.close();
  }, 60_000);

  describe("invitation and acceptance", () => {
    let pendingMemberId: string;
    let pendingUserId: string;
    let pendingEmail: string;

    it("queues one invitation for an unknown email and delivers it once", async () => {
      pendingEmail = scope.email("pending");

      const result = await members.invite(owner(), {
        email: pendingEmail,
        fullName: "Lifecycle pending",
        groupId: groupA,
      });

      expect(result.outcome).toBe(AssociationInviteOutcome.INVITATION_SENT);
      pendingMemberId = result.member.id;
      pendingUserId = result.member.userId;

      await drain();

      const invites = await deliveriesOf(
        pendingMemberId,
        AssociationMessageType.INVITATION,
      );
      expect(invites).toHaveLength(1);
      expect(invites[0].state).toBe(AssociationMessageDeliveryState.SENT);
      expect(JSON.stringify(invites[0].context)).not.toContain("token");
      expect(mailTo(pendingEmail)).toHaveLength(1);
    });

    it("queues no second invitation when the invite is retried at once", async () => {
      const result = await members.invite(owner(), {
        email: pendingEmail,
        fullName: "Lifecycle pending",
      });

      expect(result.outcome).toBe(AssociationInviteOutcome.INVITATION_COOLDOWN);
      await drain();
      expect(
        await deliveriesOf(pendingMemberId, AssociationMessageType.INVITATION),
      ).toHaveLength(1);
      expect(mailTo(pendingEmail)).toHaveLength(1);
    });

    it("sends a pending member no group or assignment mail before activation", async () => {
      const held = await prisma.associationRequirementAssignment.findMany({
        where: { memberId: pendingMemberId, isTargeted: true },
        select: { requirementId: true, announcedAt: true },
      });

      expect(held.map((one) => one.requirementId).sort()).toEqual(
        [requirementAll, requirementA].sort(),
      );
      expect(held.every((one) => one.announcedAt === null)).toBe(true);

      const lifecycle = await prisma.associationMessageDelivery.count({
        where: {
          memberId: pendingMemberId,
          messageType: { not: AssociationMessageType.INVITATION },
        },
      });
      expect(lifecycle).toBe(0);
    });

    it("welcomes, announces the group and every held assignment exactly once under concurrent acceptance", async () => {
      await prisma.user.update({
        where: { id: pendingUserId },
        data: { emailVerifiedAt: new Date() },
      });
      const token = await seedToken(pendingUserId, pendingMemberId);

      const results = await runTogether(4, () =>
        invitations.acceptInvitation({
          token,
          password: "Password123",
          confirmPassword: "Password123",
        }),
      );

      expect(fulfilled(results)).toHaveLength(1);

      const member = await prisma.associationMember.findUniqueOrThrow({
        where: { id: pendingMemberId },
      });
      expect(member.status).toBe(AssociationMemberStatus.ACTIVE);

      await drain();

      expect(
        await deliveriesOf(pendingMemberId, AssociationMessageType.WELCOME),
      ).toHaveLength(1);
      expect(
        await deliveriesOf(pendingMemberId, AssociationMessageType.GROUP_ADDED),
      ).toHaveLength(1);
      const assigned = await deliveriesOf(
        pendingMemberId,
        AssociationMessageType.REQUIREMENT_ASSIGNED,
      );
      expect(assigned).toHaveLength(2);
      expect(
        await deliveriesOf(pendingMemberId, AssociationMessageType.INVITATION),
      ).toHaveLength(1);
      expect(mailTo(pendingEmail)).toHaveLength(1 + 1 + 1 + 2);
    });
  });

  describe("linking an already-active professional", () => {
    let linked: { memberId: string; email: string };

    it("sends one consolidated welcome and no invitation", async () => {
      linked = await linkActive("linked");

      await drain();

      const welcomes = await deliveriesOf(
        linked.memberId,
        AssociationMessageType.WELCOME,
      );
      expect(welcomes).toHaveLength(1);
      expect(welcomes[0].state).toBe(AssociationMessageDeliveryState.SENT);
      expect(
        await deliveriesOf(linked.memberId, AssociationMessageType.INVITATION),
      ).toHaveLength(0);
      expect(
        await deliveriesOf(
          linked.memberId,
          AssociationMessageType.REQUIREMENT_ASSIGNED,
        ),
      ).toHaveLength(1);
    });

    it("does not offer the automatically welcomed member a manual welcome", async () => {
      const newJoiners = await attention.rowsFor(
        owner(),
        AssociationAttentionSection.NEW_JOINERS,
      );
      expect(newJoiners.map((row) => row.memberId)).not.toContain(
        linked.memberId,
      );

      const result = await messages.send(
        owner(),
        AssociationMessageType.WELCOME,
        {
          section: AssociationAttentionSection.NEW_JOINERS,
          memberIds: [linked.memberId],
        },
      );
      expect(result.acceptedCount).toBe(0);
      expect(result.skipped).toEqual([
        expect.objectContaining({
          memberId: linked.memberId,
          reason: AssociationMessageSkipReason.NOT_IN_LIST,
        }),
      ]);
    });
  });

  describe("group changes", () => {
    let mover: { memberId: string; email: string };

    it("sends one group-added email when the same move runs simultaneously", async () => {
      mover = await linkActive("mover");
      await drain();
      const before = mailTo(mover.email).length;

      const results = await runTogether(4, () =>
        members.update(owner(), { memberId: mover.memberId, groupId: groupA }),
      );
      expect(fulfilled(results)).toHaveLength(4);

      await drain();

      expect(
        await deliveriesOf(mover.memberId, AssociationMessageType.GROUP_ADDED),
      ).toHaveLength(1);
      const requirements = await deliveriesOf(
        mover.memberId,
        AssociationMessageType.REQUIREMENT_ASSIGNED,
      );
      expect(requirements).toHaveLength(2);
      expect(mailTo(mover.email)).toHaveLength(before + 1 + 1);
    });

    it("sends nothing for re-saving the same group or for removing it", async () => {
      await drain();
      const before = mailTo(mover.email).length;

      await members.update(owner(), {
        memberId: mover.memberId,
        groupId: groupA,
      });
      await members.update(owner(), { memberId: mover.memberId, groupId: "" });
      await drain();

      expect(mailTo(mover.email)).toHaveLength(before);
      expect(
        await deliveriesOf(mover.memberId, AssociationMessageType.GROUP_ADDED),
      ).toHaveLength(1);
    });

    it("treats a genuine re-add as a new occurrence of the group and its requirement", async () => {
      await drain();
      const before = mailTo(mover.email).length;

      await members.update(owner(), {
        memberId: mover.memberId,
        groupId: groupA,
      });
      await drain();

      expect(
        await deliveriesOf(mover.memberId, AssociationMessageType.GROUP_ADDED),
      ).toHaveLength(2);
      expect(mailTo(mover.email)).toHaveLength(before + 2);
    });

    it("moving to another group announces that group and only the newly gained requirement", async () => {
      await drain();
      const before = await prisma.associationMessageDelivery.count({
        where: {
          memberId: mover.memberId,
          messageType: AssociationMessageType.REQUIREMENT_ASSIGNED,
        },
      });

      await members.update(owner(), {
        memberId: mover.memberId,
        groupId: groupB,
      });
      await drain();

      const gained = await prisma.associationMessageDelivery.findMany({
        where: {
          memberId: mover.memberId,
          messageType: AssociationMessageType.REQUIREMENT_ASSIGNED,
        },
        orderBy: { createdAt: "asc" },
        select: { context: true },
      });
      expect(gained).toHaveLength(before + 1);
      expect(gained.at(-1)?.context).toMatchObject({
        requirementId: requirementB,
      });

      const groups = await prisma.associationMessageDelivery.findMany({
        where: {
          memberId: mover.memberId,
          messageType: AssociationMessageType.GROUP_ADDED,
        },
        orderBy: { createdAt: "asc" },
        select: { context: true },
      });
      expect(groups.at(-1)?.context).toMatchObject({ groupId: groupB });
    });
  });

  describe("requirement targeting", () => {
    it("allows only publish or delete to win for the same draft", async () => {
      const requirementId = await addRequirement(
        "requirement-publish-delete-race",
        AssociationAudienceKind.ALL_MEMBERS,
        undefined,
        AssociationRequirementStatus.DRAFT,
      );

      const results = await runTogether<void>(2, (index) =>
        index === 0
          ? requirements.publish(owner(), requirementId).then(() => undefined)
          : requirements.remove(owner(), requirementId),
      );

      expect(fulfilled(results)).toHaveLength(1);

      const final = await prisma.associationRequirement.findUnique({
        where: { id: requirementId },
        select: { status: true },
      });
      expect(
        final === null ||
          final.status === AssociationRequirementStatus.PUBLISHED,
      ).toBe(true);
    });

    it("announces each member once when the same requirement is materialised simultaneously", async () => {
      const first = await linkActive("materialise-one");
      const second = await linkActive("materialise-two");
      await drain();

      const requirementId = await addRequirement(
        "requirement-late",
        AssociationAudienceKind.ALL_MEMBERS,
      );

      await runTogether(4, () => assignments.materialise(requirementId));
      await assignments.materialise(requirementId);
      await drain();

      for (const member of [first, second]) {
        const announced = await prisma.associationMessageDelivery.findMany({
          where: {
            memberId: member.memberId,
            messageType: AssociationMessageType.REQUIREMENT_ASSIGNED,
            context: { path: ["requirementId"], equals: requirementId },
          },
        });
        expect(announced).toHaveLength(1);
      }
    });

    it("announces a draft only when it is published, and only to active members", async () => {
      const active = await linkActive("draft-active");
      const pending = await members.invite(owner(), {
        email: scope.email("draft-pending"),
        fullName: "Lifecycle draft pending",
      });
      await drain();

      const requirementId = await addRequirement(
        "requirement-draft",
        AssociationAudienceKind.ALL_MEMBERS,
        undefined,
        AssociationRequirementStatus.DRAFT,
      );

      await assignments.materialise(requirementId);
      await drain();

      const beforePublish = await prisma.associationMessageDelivery.count({
        where: {
          messageType: AssociationMessageType.REQUIREMENT_ASSIGNED,
          context: { path: ["requirementId"], equals: requirementId },
        },
      });
      expect(beforePublish).toBe(0);

      await prisma.associationRequirement.update({
        where: { id: requirementId },
        data: {
          status: AssociationRequirementStatus.PUBLISHED,
          publishedAt: new Date(),
        },
      });
      await assignments.materialise(requirementId);
      await drain();

      const afterPublish = await prisma.associationMessageDelivery.findMany({
        where: {
          messageType: AssociationMessageType.REQUIREMENT_ASSIGNED,
          context: { path: ["requirementId"], equals: requirementId },
        },
        select: { memberId: true },
      });
      const notified = afterPublish.map((row) => row.memberId);
      expect(notified).toContain(active.memberId);
      expect(notified).not.toContain(pending.member.id);
    });
  });

  describe("learning content", () => {
    it("announces published content once per active member, however many resyncs race", async () => {
      const reader = await linkActive("reader");
      await drain();

      const content = await prisma.associationLearningContent.create({
        data: {
          associationId,
          createdById: ownerId,
          externalTitle: scope.eventTitle("external-course"),
          externalUrl: "https://vendor.example.test/course",
        },
      });

      await learning.publish(owner(), {
        learningContentId: content.id,
        audienceKind: AssociationAudienceKind.ALL_MEMBERS,
      });
      await runTogether(4, () => learningRecipients.syncContent(content.id));
      await drain();

      const announced = await prisma.associationMessageDelivery.findMany({
        where: {
          memberId: reader.memberId,
          messageType: AssociationMessageType.LEARNING_CONTENT_ASSIGNED,
        },
        select: { state: true },
      });
      expect(announced).toHaveLength(1);
      expect(announced[0].state).toBe(AssociationMessageDeliveryState.SENT);

      const perMember = await prisma.associationMessageDelivery.groupBy({
        by: ["memberId"],
        where: {
          associationId,
          messageType: AssociationMessageType.LEARNING_CONTENT_ASSIGNED,
          context: { path: ["learningContentId"], equals: content.id },
        },
        _count: { _all: true },
      });
      expect(perMember.every((row) => row._count._all === 1)).toBe(true);

      await learning.publish(owner(), {
        learningContentId: content.id,
        audienceKind: AssociationAudienceKind.ALL_MEMBERS,
      });
      await drain();

      expect(
        await deliveriesOf(
          reader.memberId,
          AssociationMessageType.LEARNING_CONTENT_ASSIGNED,
        ),
      ).toHaveLength(1);
    });

    it("announces content to a member who joins its group later", async () => {
      const content = await prisma.associationLearningContent.create({
        data: {
          associationId,
          createdById: ownerId,
          externalTitle: scope.eventTitle("group-course"),
          externalUrl: "https://vendor.example.test/group-course",
        },
      });
      await learning.publish(owner(), {
        learningContentId: content.id,
        audienceKind: AssociationAudienceKind.GROUP,
        groupIds: [groupB],
      });
      await drain();

      const joiner = await linkActive("joiner");
      await drain();
      expect(
        await deliveriesOf(
          joiner.memberId,
          AssociationMessageType.LEARNING_CONTENT_ASSIGNED,
        ),
      ).toHaveLength(1);

      await members.update(owner(), {
        memberId: joiner.memberId,
        groupId: groupB,
      });
      await drain();

      const assigned = await prisma.associationMessageDelivery.findMany({
        where: {
          memberId: joiner.memberId,
          messageType: AssociationMessageType.LEARNING_CONTENT_ASSIGNED,
        },
        select: { context: true },
      });
      expect(assigned).toHaveLength(2);
      expect(
        assigned.some(
          (row) =>
            (row.context as { learningContentId?: string })
              .learningContentId === content.id,
        ),
      ).toBe(true);
    });
  });

  describe("delivery settings and history", () => {
    it("records suppressed lifecycle mail as skipped but still sends the invitation", async () => {
      await prisma.associationSettings.update({
        where: { associationId },
        data: { suppressAllEmail: true },
      });

      try {
        const muted = await linkActive("muted", groupA);
        const invited = await members.invite(owner(), {
          email: scope.email("muted-invite"),
          fullName: "Lifecycle muted invite",
        });
        await drain();

        const skipped = await prisma.associationMessageDelivery.findMany({
          where: { memberId: muted.memberId },
          select: { state: true, skipReason: true },
        });
        expect(skipped.length).toBeGreaterThan(0);
        expect(
          skipped.every(
            (row) =>
              row.state === AssociationMessageDeliveryState.SKIPPED &&
              row.skipReason === AssociationMessageSkipReason.EMAIL_SUPPRESSED,
          ),
        ).toBe(true);
        expect(mailTo(muted.email)).toHaveLength(0);

        const invite = await deliveriesOf(
          invited.member.id,
          AssociationMessageType.INVITATION,
        );
        expect(invite).toHaveLength(1);
        expect(invite[0].state).toBe(AssociationMessageDeliveryState.SENT);
      } finally {
        await prisma.associationSettings.update({
          where: { associationId },
          data: { suppressAllEmail: false },
        });
      }
    });

    it("shows the lifecycle categories in the association's own history only", async () => {
      await drain();

      const types = new Set<AssociationMessageType>();
      let cursor: string | null = null;
      do {
        const page = await messages.history(owner(), { take: 100, cursor });
        page.items.forEach((row) => types.add(row.messageType));
        cursor = page.pageInfo.nextCursor;
      } while (cursor);

      for (const type of [
        AssociationMessageType.INVITATION,
        AssociationMessageType.WELCOME,
        AssociationMessageType.GROUP_ADDED,
        AssociationMessageType.REQUIREMENT_ASSIGNED,
        AssociationMessageType.LEARNING_CONTENT_ASSIGNED,
      ])
        expect(types.has(type)).toBe(true);

      const theirs = await messages.history(otherOwner());
      expect(theirs.totalCount).toBe(0);
    });

    it("sends a redelivered event once, with the same provider key every time", async () => {
      const retry = await linkActive("retry");
      await drain();

      const welcome = await prisma.associationMessageDelivery.findFirstOrThrow({
        where: {
          memberId: retry.memberId,
          messageType: AssociationMessageType.WELCOME,
        },
      });
      const outboxEvent = await prisma.outboxEvent.findFirstOrThrow({
        where: {
          aggregateId: welcome.id,
          eventName: LIFECYCLE_EVENT_BY_TYPE[AssociationMessageType.WELCOME],
        },
      });
      const context = {
        id: outboxEvent.id,
        eventName: outboxEvent.eventName,
        attemptCount: 2,
        correlationId: null,
        idempotencyKey: `outbox-${outboxEvent.id}`,
        renewLease: async () => undefined,
      };
      const firstKey = mailTo(retry.email).find((one) =>
        one.subject.includes("welcome"),
      )?.key;

      await handler.handle({ deliveryId: welcome.id }, context);
      expect(
        mailTo(retry.email).filter((one) => one.subject.includes("welcome")),
      ).toHaveLength(1);

      await prisma.associationMessageDelivery.update({
        where: { id: welcome.id },
        data: { state: AssociationMessageDeliveryState.QUEUED, sentAt: null },
      });
      await handler.handle({ deliveryId: welcome.id }, context);

      const keys = mailTo(retry.email)
        .filter((one) => one.subject.includes("welcome"))
        .map((one) => one.key);
      expect(new Set([firstKey, ...keys])).toEqual(
        new Set([`outbox-${outboxEvent.id}`]),
      );
    });
  });
});
