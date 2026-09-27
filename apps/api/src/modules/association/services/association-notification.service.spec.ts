import { AssociationMessageDeliveryState } from "@prisma/client";
import { AssociationMessageType } from "@prisma/client";

import { AssociationMessageSkipReason } from "@association/enums/association-attention.enum";
import { LIFECYCLE_EVENT_BY_TYPE } from "@association/enums/association-notification.enum";
import { cooldownBucketFor } from "@association/services/association-message.service";
import { AssociationNotificationService } from "./association-notification.service";

import type { LifecycleNotification } from "./association-notification.service";

const now = new Date("2026-09-27T10:00:00.000Z");

const notification = (
  over: Partial<LifecycleNotification> = {},
): LifecycleNotification => ({
  associationId: "assoc-1",
  memberId: "member-1",
  recipientUserId: "user-1",
  messageType: AssociationMessageType.GROUP_ADDED,
  occurrenceKey: "group-added:member-1:group-1:1",
  subject: { groupId: "group-1" },
  ...over,
});

type CreatedRow = {
  occurrenceKey: string;
  state: AssociationMessageDeliveryState;
};

const setup = (
  settings: { suppressAllEmail: boolean; welcomeMessages: boolean } | null = {
    suppressAllEmail: false,
    welcomeMessages: true,
  },
  inserted?: (rows: CreatedRow[]) => CreatedRow[],
) => {
  const tx = {
    associationSettings: {
      findMany: jest
        .fn()
        .mockResolvedValue(
          settings ? [{ associationId: "assoc-1", ...settings }] : [],
        ),
    },
    associationMessageDelivery: {
      createManyAndReturn: jest.fn(async ({ data }: { data: CreatedRow[] }) =>
        (inserted ? inserted(data) : data).map((row, index) => ({
          id: `delivery-${index + 1}`,
          state: row.state ?? AssociationMessageDeliveryState.QUEUED,
          occurrenceKey: row.occurrenceKey,
        })),
      ),
    },
  };
  const outbox = { append: jest.fn().mockResolvedValue({ id: "event-1" }) };

  return {
    tx,
    outbox,
    service: new AssociationNotificationService(outbox as never),
  };
};

const createdData = (tx: ReturnType<typeof setup>["tx"]) =>
  tx.associationMessageDelivery.createManyAndReturn.mock.calls[0][0].data as {
    state: AssociationMessageDeliveryState;
    skipReason: string | null;
    cooldownBucket: number | null;
    occurrenceKey: string;
  }[];

describe("AssociationNotificationService record", () => {
  it("writes a queued delivery and its versioned event in the caller's transaction", async () => {
    const { service, tx, outbox } = setup();

    await expect(
      service.record(tx as never, [notification()], now),
    ).resolves.toBe(1);

    expect(outbox.append).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: LIFECYCLE_EVENT_BY_TYPE[AssociationMessageType.GROUP_ADDED],
        aggregateId: "delivery-1",
        payload: {
          deliveryId: "delivery-1",
          memberId: "member-1",
          occurrenceKey: "group-added:member-1:group-1:1",
          groupId: "group-1",
        },
      }),
      tx,
    );
  });

  it("relies on the occurrence key rather than a cooldown for automatic mail", async () => {
    const { service, tx } = setup();

    await service.record(
      tx as never,
      [
        notification({
          messageType: AssociationMessageType.REQUIREMENT_ASSIGNED,
          occurrenceKey: "requirement-assigned:a-1:1",
        }),
        notification({
          messageType: AssociationMessageType.REQUIREMENT_ASSIGNED,
          occurrenceKey: "requirement-assigned:a-2:1",
        }),
      ],
      now,
    );

    expect(
      tx.associationMessageDelivery.createManyAndReturn,
    ).toHaveBeenCalledWith(expect.objectContaining({ skipDuplicates: true }));
    expect(createdData(tx).map((row) => row.cooldownBucket)).toEqual([
      null,
      null,
    ]);
  });

  it("gives the automatic welcome the current cooldown bucket so a manual welcome collides with it", async () => {
    const { service, tx } = setup();

    await service.record(
      tx as never,
      [
        notification({
          messageType: AssociationMessageType.WELCOME,
          occurrenceKey: "welcome:member-1",
          subject: {},
        }),
      ],
      now,
    );

    expect(createdData(tx)[0].cooldownBucket).toBe(cooldownBucketFor(now));
  });

  it("records a suppressed notification as skipped and queues no email", async () => {
    const { service, tx, outbox } = setup({
      suppressAllEmail: true,
      welcomeMessages: true,
    });

    await service.record(tx as never, [notification()], now);

    expect(createdData(tx)[0]).toMatchObject({
      state: AssociationMessageDeliveryState.SKIPPED,
      skipReason: AssociationMessageSkipReason.EMAIL_SUPPRESSED,
    });
    expect(outbox.append).not.toHaveBeenCalled();
  });

  it("suppresses only the welcome when welcome messages are off", async () => {
    const { service, tx, outbox } = setup({
      suppressAllEmail: false,
      welcomeMessages: false,
    });

    await service.record(
      tx as never,
      [
        notification({
          messageType: AssociationMessageType.WELCOME,
          occurrenceKey: "welcome:member-1",
        }),
        notification(),
      ],
      now,
    );

    expect(createdData(tx).map((row) => row.state)).toEqual([
      AssociationMessageDeliveryState.SKIPPED,
      AssociationMessageDeliveryState.QUEUED,
    ]);
    expect(outbox.append).toHaveBeenCalledTimes(1);
  });

  it("queues nothing for an occurrence that already exists", async () => {
    const { service, tx, outbox } = setup(undefined, () => []);

    await expect(
      service.record(tx as never, [notification()], now),
    ).resolves.toBe(0);

    expect(outbox.append).not.toHaveBeenCalled();
  });

  it("uses default settings when the association never saved any", async () => {
    const { service, tx, outbox } = setup(null);

    await service.record(tx as never, [notification()], now);

    expect(outbox.append).toHaveBeenCalledTimes(1);
  });

  it("does nothing for an empty list", async () => {
    const { service, tx } = setup();

    await expect(service.record(tx as never, [], now)).resolves.toBe(0);

    expect(tx.associationSettings.findMany).not.toHaveBeenCalled();
  });
});

describe("AssociationNotificationService recordInvitation", () => {
  const invitation = {
    associationId: "assoc-1",
    memberId: "member-1",
    recipientUserId: "user-1",
    tokenId: "otp-1",
    mail: {
      to: "ada@example.org",
      subject: "Invited",
      html: "<p>https://app/join?token=secret</p>",
      text: "https://app/join?token=secret",
    },
  };

  it("keys the invitation to its token and is never suppressed", async () => {
    const { service, tx, outbox } = setup({
      suppressAllEmail: true,
      welcomeMessages: false,
    });

    await expect(
      service.recordInvitation(tx as never, invitation),
    ).resolves.toBe("delivery-1");

    expect(createdData(tx)[0]).toMatchObject({
      occurrenceKey: "invitation:otp-1",
    });
    expect(createdData(tx)[0]).not.toHaveProperty(
      "state",
      AssociationMessageDeliveryState.SKIPPED,
    );
    expect(outbox.append).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: LIFECYCLE_EVENT_BY_TYPE[AssociationMessageType.INVITATION],
        payload: expect.objectContaining({ deliveryId: "delivery-1" }),
      }),
      tx,
    );
  });

  it("keeps the activation link out of the delivery history row", async () => {
    const { service, tx } = setup();

    await service.recordInvitation(tx as never, invitation);

    expect(JSON.stringify(createdData(tx))).not.toContain("token=secret");
  });

  it("queues no second email for the same token", async () => {
    const { service, tx, outbox } = setup(undefined, () => []);

    await expect(
      service.recordInvitation(tx as never, invitation),
    ).resolves.toBeNull();

    expect(outbox.append).not.toHaveBeenCalled();
  });
});
