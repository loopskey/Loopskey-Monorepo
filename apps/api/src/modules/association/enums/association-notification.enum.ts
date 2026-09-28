import { AssociationMessageType } from "@prisma/client";

export const LIFECYCLE_MESSAGE_TYPES = [
  AssociationMessageType.INVITATION,
  AssociationMessageType.WELCOME,
  AssociationMessageType.GROUP_ADDED,
  AssociationMessageType.REQUIREMENT_ASSIGNED,
  AssociationMessageType.LEARNING_CONTENT_ASSIGNED,
] as const;

export type LifecycleMessageType = (typeof LIFECYCLE_MESSAGE_TYPES)[number];

export type AutomaticMessageType = Exclude<
  LifecycleMessageType,
  typeof AssociationMessageType.INVITATION
>;

export const LIFECYCLE_EVENT_BY_TYPE = {
  [AssociationMessageType.INVITATION]: "association.member.invited.v1",
  [AssociationMessageType.WELCOME]: "association.membership.activated.v1",
  [AssociationMessageType.GROUP_ADDED]: "association.member.group-added.v1",
  [AssociationMessageType.REQUIREMENT_ASSIGNED]:
    "association.requirement.assigned.v1",
  [AssociationMessageType.LEARNING_CONTENT_ASSIGNED]:
    "association.learning-content.assigned.v1",
} as const satisfies Record<LifecycleMessageType, string>;

export const LIFECYCLE_TEMPLATE_VERSION = 1;

export const AUTOMATIC_AUDIENCE = { trigger: "AUTOMATIC" } as const;

export const occurrenceKeys = {
  invitation: (tokenId: string) => `invitation:${tokenId}`,
  welcome: (memberId: string) => `welcome:${memberId}`,
  groupAdded: (memberId: string, groupId: string, occurrence: string) =>
    `group-added:${memberId}:${groupId}:${occurrence}`,
  requirementAssigned: (assignmentId: string, announcedAt: Date) =>
    `requirement-assigned:${assignmentId}:${announcedAt.getTime()}`,
  learningContentAssigned: (recipientId: string, announcedAt: Date) =>
    `learning-content-assigned:${recipientId}:${announcedAt.getTime()}`,
};

export const GROUP_ADDED_ON_ACTIVATION = "activation";
