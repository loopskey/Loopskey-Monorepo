import { AssociationMessageDeliveryState } from "@prisma/client";
import { AssociationMessageType } from "@prisma/client";
import { AssociationMemberStatus } from "@prisma/client";
import { AppLanguage } from "@prisma/client";

import { AssociationMessageSkipReason } from "@association/enums/association-attention.enum";
import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { LIFECYCLE_EVENT_BY_TYPE } from "@association/enums/association-notification.enum";
import { AssociationLifecycleMessageHandler } from "./association-lifecycle-message.handler";

import type { OutboxHandler } from "@infrastructure/outbox/outbox-handler.port";

const event = {
  id: "event-1",
  eventName: "association.member.group-added.v1",
  attemptCount: 1,
  idempotencyKey: "outbox-event-1",
  correlationId: null,
  renewLease: jest.fn(),
};

const delivery = (over: Record<string, unknown> = {}) => ({
  id: "delivery-1",
  state: AssociationMessageDeliveryState.QUEUED,
  context: {},
  messageType: AssociationMessageType.WELCOME,
  recipientUserId: "user-1",
  association: { name: "Institute <of> Practice" },
  member: {
    id: "member-1",
    status: AssociationMemberStatus.ACTIVE,
    groupId: "group-1",
    associationId: "assoc-1",
  },
  ...over,
});

const setup = () => {
  const prisma = {
    associationMessageDelivery: {
      findUnique: jest.fn().mockResolvedValue(delivery()),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    associationGroup: {
      findFirst: jest.fn().mockResolvedValue({ title: "Northern Chapter" }),
    },
    associationRequirementAssignment: {
      findFirst: jest.fn().mockResolvedValue({
        dueDate: new Date("2026-12-31T00:00:00.000Z"),
        requirement: { id: "req-1", name: "Annual CPD" },
      }),
    },
    associationLearningContentRecipient: {
      findFirst: jest.fn().mockResolvedValue({
        learningContent: {
          id: "lc-1",
          contentType: "COURSE",
          contentId: "course-1",
          externalTitle: null,
          requirement: { id: "req-1", name: "Annual CPD", status: "PUBLISHED" },
        },
      }),
    },
  };
  const mail = { deliver: jest.fn().mockResolvedValue({ id: "provider-1" }) };
  const config = {
    get: jest.fn((name: string, fallback?: string) =>
      name === "FRONTEND_URL" ? "https://app.loopskey.test/" : fallback,
    ),
  };
  const registered: OutboxHandler[] = [];
  const registry = {
    register: jest.fn((handler: OutboxHandler) => registered.push(handler)),
  };
  const identity = {
    recipients: jest.fn().mockResolvedValue([
      {
        id: "user-1",
        email: "ada@example.org",
        fullName: "Ada Member",
        emailVerifiedAt: new Date(),
        isActive: true,
      },
    ]),
  };
  const professional = {
    languagesForOwners: jest
      .fn()
      .mockResolvedValue([{ userId: "user-1", language: "EN" }]),
  };
  const catalog = {
    resolveCatalogItems: jest.fn().mockResolvedValue([
      {
        title: "Ethics in Practice",
        contentId: "course-1",
        contentType: "COURSE",
        isAvailable: true,
        slug: "ethics-in-practice",
        provider: null,
        imageUrl: null,
      },
    ]),
  };

  const handler = new AssociationLifecycleMessageHandler(
    prisma as never,
    mail as never,
    config as never,
    registry as never,
    identity as never,
    professional as never,
    catalog as never,
  );

  return {
    handler,
    prisma,
    mail,
    registry,
    registered,
    identity,
    professional,
    catalog,
  };
};

const settledState = (prisma: ReturnType<typeof setup>["prisma"]) =>
  prisma.associationMessageDelivery.updateMany.mock.calls[0]?.[0] as
    | {
        where: { state: AssociationMessageDeliveryState };
        data: {
          state: AssociationMessageDeliveryState;
          skipReason?: string;
          language?: AppLanguage;
        };
      }
    | undefined;

const sentEmail = (mail: ReturnType<typeof setup>["mail"]) =>
  mail.deliver.mock.calls[0][0] as {
    to: string;
    subject: string;
    text: string;
    html: string;
  };

describe("AssociationLifecycleMessageHandler registration", () => {
  it("claims every lifecycle event on the realtime lane", () => {
    const { handler, registered } = setup();

    handler.onModuleInit();

    expect(registered.map((one) => one.eventName).sort()).toEqual(
      Object.values(LIFECYCLE_EVENT_BY_TYPE).sort(),
    );
    expect(new Set(registered.map((one) => one.handlerName)).size).toBe(5);
    expect(registered.every((one) => one.lane === "realtime")).toBe(true);
  });
});

describe("AssociationLifecycleMessageHandler delivery", () => {
  it("sends the consolidated welcome with the outbox idempotency key and settles it", async () => {
    const { handler, mail, prisma } = setup();

    await handler.handle({ deliveryId: "delivery-1" }, event);

    expect(mail.deliver).toHaveBeenCalledWith(
      expect.objectContaining({ to: "ada@example.org" }),
      "outbox-event-1",
    );
    expect(sentEmail(mail).subject).toContain("welcome");
    expect(settledState(prisma)).toMatchObject({
      where: { state: AssociationMessageDeliveryState.QUEUED },
      data: {
        state: AssociationMessageDeliveryState.SENT,
        language: AppLanguage.EN,
      },
    });
  });

  it("does not send a delivery that already settled", async () => {
    const { handler, mail, prisma } = setup();
    prisma.associationMessageDelivery.findUnique.mockResolvedValue(
      delivery({ state: AssociationMessageDeliveryState.SENT }),
    );

    await handler.handle({ deliveryId: "delivery-1" }, event);

    expect(mail.deliver).not.toHaveBeenCalled();
    expect(prisma.associationMessageDelivery.updateMany).not.toHaveBeenCalled();
  });

  it("skips a member who is no longer active", async () => {
    const { handler, mail, prisma } = setup();
    prisma.associationMessageDelivery.findUnique.mockResolvedValue(
      delivery({
        member: {
          id: "member-1",
          status: AssociationMemberStatus.INACTIVE,
          groupId: null,
          associationId: "assoc-1",
        },
      }),
    );

    await handler.handle({ deliveryId: "delivery-1" }, event);

    expect(mail.deliver).not.toHaveBeenCalled();
    expect(settledState(prisma)?.data).toMatchObject({
      state: AssociationMessageDeliveryState.SKIPPED,
      skipReason: AssociationMessageSkipReason.NO_LONGER_APPLICABLE,
    });
  });

  it("skips an address that was never verified", async () => {
    const { handler, mail, prisma, identity } = setup();
    identity.recipients.mockResolvedValue([
      {
        id: "user-1",
        email: "ada@example.org",
        fullName: null,
        emailVerifiedAt: null,
        isActive: true,
      },
    ]);

    await handler.handle({ deliveryId: "delivery-1" }, event);

    expect(mail.deliver).not.toHaveBeenCalled();
    expect(settledState(prisma)?.data.skipReason).toBe(
      AssociationMessageSkipReason.NO_VERIFIED_EMAIL,
    );
  });

  it("writes in the member's language", async () => {
    const { handler, mail, prisma, professional } = setup();
    professional.languagesForOwners.mockResolvedValue([
      { userId: "user-1", language: "FR" },
    ]);

    await handler.handle({ deliveryId: "delivery-1" }, event);

    expect(sentEmail(mail).subject).toContain("bienvenue");
    expect(settledState(prisma)?.data.language).toBe(AppLanguage.FR);
  });

  it("escapes association data in the html and keeps a text alternative", async () => {
    const { handler, mail } = setup();

    await handler.handle({ deliveryId: "delivery-1" }, event);

    const email = sentEmail(mail);
    expect(email.html).toContain("Institute &lt;of&gt; Practice");
    expect(email.html).not.toContain("Institute <of> Practice");
    expect(email.text).toContain(
      "https://app.loopskey.test/dashboard/professional",
    );
  });
});

describe("AssociationLifecycleMessageHandler group added", () => {
  const groupDelivery = delivery({
    messageType: AssociationMessageType.GROUP_ADDED,
    context: { groupId: "group-1" },
  });

  it("names the group and links to the member's requirements", async () => {
    const { handler, mail, prisma } = setup();
    prisma.associationMessageDelivery.findUnique.mockResolvedValue(
      groupDelivery,
    );

    await handler.handle({ deliveryId: "delivery-1" }, event);

    const email = sentEmail(mail);
    expect(email.subject).toContain("Northern Chapter");
    expect(email.text).toContain(
      "https://app.loopskey.test/dashboard/professional?tab=cpd-pdu-progress",
    );
  });

  it("skips when the member has since moved to another group", async () => {
    const { handler, mail, prisma } = setup();
    prisma.associationMessageDelivery.findUnique.mockResolvedValue({
      ...groupDelivery,
      member: { ...groupDelivery.member, groupId: "group-2" },
    });

    await handler.handle({ deliveryId: "delivery-1" }, event);

    expect(mail.deliver).not.toHaveBeenCalled();
    expect(settledState(prisma)?.data.skipReason).toBe(
      AssociationMessageSkipReason.NO_LONGER_APPLICABLE,
    );
  });

  it("skips a group that was deactivated before the email left", async () => {
    const { handler, mail, prisma } = setup();
    prisma.associationMessageDelivery.findUnique.mockResolvedValue(
      groupDelivery,
    );
    prisma.associationGroup.findFirst.mockResolvedValue(null);

    await handler.handle({ deliveryId: "delivery-1" }, event);

    expect(mail.deliver).not.toHaveBeenCalled();
  });
});

describe("AssociationLifecycleMessageHandler requirement assigned", () => {
  const requirementDelivery = delivery({
    messageType: AssociationMessageType.REQUIREMENT_ASSIGNED,
    context: { requirementId: "req-1", assignmentId: "a-1" },
  });

  it("links straight to the requirement, selected", async () => {
    const { handler, mail, prisma } = setup();
    prisma.associationMessageDelivery.findUnique.mockResolvedValue(
      requirementDelivery,
    );

    await handler.handle({ deliveryId: "delivery-1" }, event);

    expect(sentEmail(mail).text).toContain(
      "https://app.loopskey.test/dashboard/professional?tab=cpd-pdu-progress&requirement=association%3Areq-1",
    );
    expect(sentEmail(mail).subject).toContain("Annual CPD");
  });

  it("only advertises a published assignment the member still holds", async () => {
    const { handler, mail, prisma } = setup();
    prisma.associationMessageDelivery.findUnique.mockResolvedValue(
      requirementDelivery,
    );
    prisma.associationRequirementAssignment.findFirst.mockResolvedValue(null);

    await handler.handle({ deliveryId: "delivery-1" }, event);

    expect(
      prisma.associationRequirementAssignment.findFirst,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: "a-1",
          memberId: "member-1",
          isTargeted: true,
          requirement: { associationId: "assoc-1", status: "PUBLISHED" },
        },
      }),
    );
    expect(mail.deliver).not.toHaveBeenCalled();
    expect(settledState(prisma)?.data.skipReason).toBe(
      AssociationMessageSkipReason.NO_LONGER_APPLICABLE,
    );
  });
});

describe("AssociationLifecycleMessageHandler learning content assigned", () => {
  const contentDelivery = delivery({
    messageType: AssociationMessageType.LEARNING_CONTENT_ASSIGNED,
    context: { learningContentId: "lc-1", recipientId: "r-1" },
  });

  it("opens catalogue content on its own page with the association context", async () => {
    const { handler, mail, prisma } = setup();
    prisma.associationMessageDelivery.findUnique.mockResolvedValue(
      contentDelivery,
    );

    await handler.handle({ deliveryId: "delivery-1" }, event);

    expect(sentEmail(mail).text).toContain(
      "https://app.loopskey.test/courses/ethics-in-practice?requirement=association%3Areq-1&learningContent=lc-1",
    );
  });

  it("never links out to an external resource directly", async () => {
    const { handler, mail, prisma } = setup();
    prisma.associationMessageDelivery.findUnique.mockResolvedValue(
      contentDelivery,
    );
    prisma.associationLearningContentRecipient.findFirst.mockResolvedValue({
      learningContent: {
        id: "lc-1",
        contentType: null,
        contentId: null,
        externalTitle: "Vendor webinar",
        requirement: null,
      },
    });

    await handler.handle({ deliveryId: "delivery-1" }, event);

    const email = sentEmail(mail);
    expect(email.subject).toContain("Vendor webinar");
    expect(email.text).toContain(
      "https://app.loopskey.test/dashboard/professional?tab=cpd-pdu-progress",
    );
  });

  it("skips catalogue content that is no longer available", async () => {
    const { handler, mail, prisma, catalog } = setup();
    prisma.associationMessageDelivery.findUnique.mockResolvedValue(
      contentDelivery,
    );
    catalog.resolveCatalogItems.mockResolvedValue([
      { title: "Gone", isAvailable: false },
    ]);

    await handler.handle({ deliveryId: "delivery-1" }, event);

    expect(mail.deliver).not.toHaveBeenCalled();
  });

  it("does not name a requirement that is no longer published", async () => {
    const { handler, mail, prisma } = setup();
    prisma.associationMessageDelivery.findUnique.mockResolvedValue(
      contentDelivery,
    );
    prisma.associationLearningContentRecipient.findFirst.mockResolvedValue({
      learningContent: {
        id: "lc-1",
        contentType: "COURSE",
        contentId: "course-1",
        externalTitle: null,
        requirement: { id: "req-1", name: "Old CPD", status: "ARCHIVED" },
      },
    });

    await handler.handle({ deliveryId: "delivery-1" }, event);

    const email = sentEmail(mail);
    expect(email.text).not.toContain("Old CPD");
    expect(email.text).not.toContain("requirement=");
  });
});

describe("AssociationLifecycleMessageHandler invitation", () => {
  const mailPayload = {
    to: "ada@example.org",
    subject: "Invited",
    html: "<p>join</p>",
    text: "join",
  };

  it("sends the invitation exactly as it was rendered when queued", async () => {
    const { handler, mail, prisma, identity } = setup();
    prisma.associationMessageDelivery.findUnique.mockResolvedValue(
      delivery({
        messageType: AssociationMessageType.INVITATION,
        member: {
          id: "member-1",
          status: AssociationMemberStatus.PENDING_ACTIVATION,
          groupId: null,
          associationId: "assoc-1",
        },
      }),
    );

    await handler.handle(
      { deliveryId: "delivery-1", mail: mailPayload },
      event,
    );

    expect(mail.deliver).toHaveBeenCalledWith(mailPayload, "outbox-event-1");
    expect(identity.recipients).not.toHaveBeenCalled();
    expect(settledState(prisma)?.data.state).toBe(
      AssociationMessageDeliveryState.SENT,
    );
  });

  it("does not send a stale invitation once the member has accepted", async () => {
    const { handler, mail, prisma } = setup();
    prisma.associationMessageDelivery.findUnique.mockResolvedValue(
      delivery({ messageType: AssociationMessageType.INVITATION }),
    );

    await handler.handle(
      { deliveryId: "delivery-1", mail: mailPayload },
      event,
    );

    expect(mail.deliver).not.toHaveBeenCalled();
    expect(settledState(prisma)?.data.skipReason).toBe(
      AssociationMessageSkipReason.NO_LONGER_APPLICABLE,
    );
  });
});

describe("AssociationLifecycleMessageHandler failure", () => {
  it("leaves a provider failure queued so the outbox retries it", async () => {
    const { handler, mail, prisma } = setup();
    mail.deliver.mockRejectedValue(new Error("provider down"));

    await expect(
      handler.handle({ deliveryId: "delivery-1" }, event),
    ).rejects.toThrow("provider down");
    expect(prisma.associationMessageDelivery.updateMany).not.toHaveBeenCalled();
  });

  it("marks a queued delivery failed when the outbox gives up", async () => {
    const { handler, prisma } = setup();

    await handler.abandon({ deliveryId: "delivery-1" });

    expect(prisma.associationMessageDelivery.updateMany).toHaveBeenCalledWith({
      where: {
        id: "delivery-1",
        state: AssociationMessageDeliveryState.QUEUED,
      },
      data: {
        state: AssociationMessageDeliveryState.FAILED,
        failureReason: AssociationMessageCode.MESSAGE_DELIVERY_FAILED,
      },
    });
  });
});
