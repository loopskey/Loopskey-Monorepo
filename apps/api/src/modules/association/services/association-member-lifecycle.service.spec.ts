import { AssociationMemberStatus } from "@prisma/client";
import { AssociationMessageType } from "@prisma/client";

import { AssociationMemberLifecycleService } from "./association-member-lifecycle.service";

const now = new Date("2026-09-27T10:00:00.000Z");

const member = {
  id: "member-1",
  associationId: "assoc-1",
  userId: "user-1",
  groupId: "group-1",
};

const setup = () => {
  const tx = {
    associationGroup: {
      findFirst: jest.fn().mockResolvedValue({ id: "group-1" }),
    },
    associationMember: {
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      findUniqueOrThrow: jest.fn().mockResolvedValue({
        id: "member-1",
        associationId: "assoc-1",
        userId: "user-1",
        status: AssociationMemberStatus.ACTIVE,
      }),
    },
  };
  const notifications = { record: jest.fn().mockResolvedValue(1) };
  const assignments = { announce: jest.fn().mockResolvedValue(0) };
  const learningRecipients = { announce: jest.fn().mockResolvedValue(0) };

  return {
    tx,
    notifications,
    assignments,
    learningRecipients,
    service: new AssociationMemberLifecycleService(
      notifications as never,
      assignments as never,
      learningRecipients as never,
    ),
  };
};

const recorded = (notifications: ReturnType<typeof setup>["notifications"]) =>
  notifications.record.mock.calls.flatMap(
    ([, list]) => list as { messageType: string; occurrenceKey: string }[],
  );

describe("AssociationMemberLifecycleService announceActivation", () => {
  it("welcomes once, announces the initial group, and releases every held assignment", async () => {
    const { service, tx, notifications, assignments, learningRecipients } =
      setup();

    await service.announceActivation(tx as never, member, now);

    expect(recorded(notifications)).toEqual([
      expect.objectContaining({
        messageType: AssociationMessageType.WELCOME,
        occurrenceKey: "welcome:member-1",
      }),
      expect.objectContaining({
        messageType: AssociationMessageType.GROUP_ADDED,
        occurrenceKey: "group-added:member-1:group-1:activation",
      }),
    ]);
    expect(assignments.announce).toHaveBeenCalledWith(
      tx,
      { memberIds: ["member-1"] },
      now,
    );
    expect(learningRecipients.announce).toHaveBeenCalledWith(
      tx,
      { memberIds: ["member-1"] },
      now,
    );
  });

  it("announces no group for a member without one", async () => {
    const { service, tx, notifications } = setup();

    await service.announceActivation(
      tx as never,
      { ...member, groupId: null },
      now,
    );

    expect(recorded(notifications).map((one) => one.messageType)).toEqual([
      AssociationMessageType.WELCOME,
    ]);
    expect(tx.associationGroup.findFirst).not.toHaveBeenCalled();
  });

  it("announces no group that has been deactivated", async () => {
    const { service, tx, notifications } = setup();
    tx.associationGroup.findFirst.mockResolvedValue(null);

    await service.announceActivation(tx as never, member, now);

    expect(recorded(notifications).map((one) => one.messageType)).toEqual([
      AssociationMessageType.WELCOME,
    ]);
    expect(tx.associationGroup.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "group-1", associationId: "assoc-1", isActive: true },
      }),
    );
  });
});

describe("AssociationMemberLifecycleService moveToGroup", () => {
  it("moves with a conditional write that only matches a real change", async () => {
    const { service, tx } = setup();

    await service.moveToGroup(tx as never, member, "group-2", now);

    expect(tx.associationMember.updateMany).toHaveBeenCalledWith({
      where: {
        id: "member-1",
        associationId: "assoc-1",
        OR: [{ groupId: null }, { groupId: { not: "group-2" } }],
      },
      data: { groupId: "group-2" },
    });
  });

  it("announces the new group for an active member, keyed to the move", async () => {
    const { service, tx, notifications } = setup();

    await expect(
      service.moveToGroup(tx as never, member, "group-2", now),
    ).resolves.toBe(true);

    expect(recorded(notifications)).toEqual([
      expect.objectContaining({
        messageType: AssociationMessageType.GROUP_ADDED,
        occurrenceKey: `group-added:member-1:group-2:${now.getTime()}`,
      }),
    ]);
  });

  it("announces nothing when the member is already in that group", async () => {
    const { service, tx, notifications } = setup();
    tx.associationMember.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      service.moveToGroup(tx as never, member, "group-1", now),
    ).resolves.toBe(false);

    expect(notifications.record).not.toHaveBeenCalled();
  });

  it("defers the announcement for a pending member until activation", async () => {
    const { service, tx, notifications } = setup();
    tx.associationMember.findUniqueOrThrow.mockResolvedValue({
      id: "member-1",
      associationId: "assoc-1",
      userId: "user-1",
      status: AssociationMemberStatus.PENDING_ACTIVATION,
    });

    await expect(
      service.moveToGroup(tx as never, member, "group-2", now),
    ).resolves.toBe(true);

    expect(notifications.record).not.toHaveBeenCalled();
  });

  it("announces nothing for an inactive member", async () => {
    const { service, tx, notifications } = setup();
    tx.associationMember.findUniqueOrThrow.mockResolvedValue({
      id: "member-1",
      associationId: "assoc-1",
      userId: "user-1",
      status: AssociationMemberStatus.INACTIVE,
    });

    await service.moveToGroup(tx as never, member, "group-2", now);

    expect(notifications.record).not.toHaveBeenCalled();
  });
});
