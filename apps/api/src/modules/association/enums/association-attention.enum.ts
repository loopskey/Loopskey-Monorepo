import { AssociationMessageType } from "@prisma/client";

export enum AssociationAttentionSection {
  NEW_JOINERS = "NEW_JOINERS",
  READY_REPORTS = "READY_REPORTS",
  CATEGORY_BEHIND = "CATEGORY_BEHIND",
  BELOW_THRESHOLD = "BELOW_THRESHOLD",
  EXPIRING_CERTIFICATES = "EXPIRING_CERTIFICATES",
}

export const MESSAGE_TYPE_BY_SECTION = {
  [AssociationAttentionSection.BELOW_THRESHOLD]:
    AssociationMessageType.BEHIND_THRESHOLD,
  [AssociationAttentionSection.NEW_JOINERS]: AssociationMessageType.WELCOME,
  [AssociationAttentionSection.CATEGORY_BEHIND]:
    AssociationMessageType.CATEGORY_BEHIND,
  [AssociationAttentionSection.EXPIRING_CERTIFICATES]:
    AssociationMessageType.CERTIFICATE_EXPIRING,
} as const;

export const MANUAL_MESSAGE_TYPES = [
  AssociationMessageType.WELCOME,
  AssociationMessageType.CATEGORY_BEHIND,
  AssociationMessageType.BEHIND_THRESHOLD,
  AssociationMessageType.CERTIFICATE_EXPIRING,
] as const;

export type ManualMessageType = (typeof MANUAL_MESSAGE_TYPES)[number];

export const isManualMessageType = (
  messageType: AssociationMessageType,
): messageType is ManualMessageType =>
  (MANUAL_MESSAGE_TYPES as readonly AssociationMessageType[]).includes(
    messageType,
  );

export const SECTION_BY_MESSAGE_TYPE = {
  [AssociationMessageType.BEHIND_THRESHOLD]:
    AssociationAttentionSection.BELOW_THRESHOLD,
  [AssociationMessageType.WELCOME]: AssociationAttentionSection.NEW_JOINERS,
  [AssociationMessageType.CATEGORY_BEHIND]:
    AssociationAttentionSection.CATEGORY_BEHIND,
  [AssociationMessageType.CERTIFICATE_EXPIRING]:
    AssociationAttentionSection.EXPIRING_CERTIFICATES,
} as const satisfies Record<ManualMessageType, AssociationAttentionSection>;

export enum AssociationMessageSkipReason {
  COOLDOWN = "COOLDOWN",
  NOT_IN_LIST = "NOT_IN_LIST",
  NO_VERIFIED_EMAIL = "NO_VERIFIED_EMAIL",
  INACTIVE_ACCOUNT = "INACTIVE_ACCOUNT",
  EMAIL_SUPPRESSED = "EMAIL_SUPPRESSED",
  NO_LONGER_APPLICABLE = "NO_LONGER_APPLICABLE",
}
