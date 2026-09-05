import { AppLanguage, AssociationMessageType } from "@prisma/client";

import { type AttentionRow } from "@association/types/association-attention.types";
import { type TAssociationMessageInput } from "@mail/mail-service.type";

export type MessageContext = {
  percent: number;
  requiredCredits: number;
  completedCredits: number;
  deadline: string | null;
  detail: string;
  detailDate: string | null;
};

export const messageContextOf = (row: AttentionRow): MessageContext => ({
  percent: row.percent ?? 0,
  requiredCredits: row.requiredCredits ?? 0,
  completedCredits: row.completedCredits ?? 0,
  deadline: row.deadline?.toISOString() ?? null,
  detail: row.detail ?? "",
  detailDate: row.detailDate?.toISOString() ?? null,
});

const readNumber = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

const readText = (value: unknown) => (typeof value === "string" ? value : "");

const readDate = (value: unknown) => {
  if (typeof value !== "string") return null;
  const at = new Date(value);
  return Number.isNaN(at.getTime()) ? null : at;
};

export const readMessageContext = (value: unknown) => {
  const source = (
    typeof value === "object" && value !== null ? value : {}
  ) as Record<string, unknown>;

  return {
    percent: readNumber(source.percent),
    requiredCredits: readNumber(source.requiredCredits),
    completedCredits: readNumber(source.completedCredits),
    deadline: readDate(source.deadline),
    detail: readText(source.detail),
    detailDate: readDate(source.detailDate),
  };
};

export const messageTemplateInput = ({
  appName,
  language,
  memberName,
  messageType,
  supportEmail,
  dashboardUrl,
  associationName,
  context,
}: {
  appName: string;
  language: AppLanguage;
  memberName: string;
  messageType: AssociationMessageType;
  supportEmail: string;
  dashboardUrl: string;
  associationName: string;
  context: ReturnType<typeof readMessageContext>;
}): TAssociationMessageInput => {
  const base = {
    appName,
    language,
    memberName,
    supportEmail,
    dashboardUrl,
    associationName,
  };

  if (messageType === AssociationMessageType.WELCOME)
    return { ...base, messageType };

  if (messageType === AssociationMessageType.CATEGORY_BEHIND)
    return {
      ...base,
      messageType,
      percent: context.percent,
      categoryName: context.detail,
    };

  if (messageType === AssociationMessageType.CERTIFICATE_EXPIRING)
    return {
      ...base,
      messageType,
      expiresOn: context.detailDate,
      certificateTitle: context.detail,
    };

  return {
    ...base,
    messageType,
    percent: context.percent,
    deadline: context.deadline,
    requiredCredits: context.requiredCredits,
    completedCredits: context.completedCredits,
  };
};
