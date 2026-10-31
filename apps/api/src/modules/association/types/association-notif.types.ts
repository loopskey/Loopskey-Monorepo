import { AutomaticMessageType } from "@association/enums/association-notification.enum";
import { TSendEmailInput } from "@mail/types/mail-service.types";

export type LifecycleSubject = {
  groupId?: string;
  recipientId?: string;
  assignmentId?: string;
  requirementId?: string;
  learningContentId?: string;
};

export type LifecycleNotification = {
  memberId: string;
  associationId: string;
  occurrenceKey: string;
  recipientUserId: string;
  subject: LifecycleSubject;
  messageType: AutomaticMessageType;
};

export type InvitationNotification = {
  tokenId: string;
  memberId: string;
  associationId: string;
  mail: TSendEmailInput;
  recipientUserId: string;
};

export type DeliverySettings = {
  welcomeMessages: boolean;
  suppressAllEmail: boolean;
};
