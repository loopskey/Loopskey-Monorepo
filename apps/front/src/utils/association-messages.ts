import { AssociationAttentionSection } from "@/lib/graphql/base";
import { AssociationMessageDeliveryState } from "@/lib/graphql/base";
import { AssociationMessageType } from "@/lib/graphql/base";

export const ATTENTION_SECTIONS = [
  AssociationAttentionSection.BelowThreshold,
  AssociationAttentionSection.NewJoiners,
  AssociationAttentionSection.CategoryBehind,
  AssociationAttentionSection.ExpiringCertificates,
  AssociationAttentionSection.ReadyReports,
] as const;

export type TAttentionSection = (typeof ATTENTION_SECTIONS)[number];

export const ACTIONABLE_SECTIONS = [
  AssociationAttentionSection.BelowThreshold,
  AssociationAttentionSection.NewJoiners,
  AssociationAttentionSection.CategoryBehind,
  AssociationAttentionSection.ExpiringCertificates,
] as const;

export const MESSAGE_TYPE_OF: Record<
  (typeof ACTIONABLE_SECTIONS)[number],
  AssociationMessageType
> = {
  [AssociationAttentionSection.BelowThreshold]:
    AssociationMessageType.BehindThreshold,
  [AssociationAttentionSection.NewJoiners]: AssociationMessageType.Welcome,
  [AssociationAttentionSection.CategoryBehind]:
    AssociationMessageType.CategoryBehind,
  [AssociationAttentionSection.ExpiringCertificates]:
    AssociationMessageType.CertificateExpiring,
};

export const isActionableSection = (
  section: TAttentionSection,
): section is (typeof ACTIONABLE_SECTIONS)[number] =>
  section !== AssociationAttentionSection.ReadyReports;

export const STATE_VARIANT_OF = {
  [AssociationMessageDeliveryState.Queued]: "secondary",
  [AssociationMessageDeliveryState.Sent]: "default",
  [AssociationMessageDeliveryState.Failed]: "destructive",
  [AssociationMessageDeliveryState.Skipped]: "outline",
} as const;

export const ATTENTION_PAGE_SIZE = 25;

const SKIP_REASONS = new Set<string>([
  "COOLDOWN",
  "NOT_IN_LIST",
  "NO_VERIFIED_EMAIL",
  "INACTIVE_ACCOUNT",
]);

export const isSkipReason = (value: string | null | undefined) =>
  Boolean(value && SKIP_REASONS.has(value));

export const sectionSendButtonId = (section: TAttentionSection) =>
  `attention-send-${section}`;

export const attentionSectionHref = (section: TAttentionSection) =>
  `/dashboard/association?tab=notifications&section=${section}`;
