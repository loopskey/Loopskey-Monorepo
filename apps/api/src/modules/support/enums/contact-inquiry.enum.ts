import { registerEnumType } from "@nestjs/graphql";

export enum ContactInquiryType {
  OTHER = "OTHER",
  ACCOUNT_SUPPORT = "ACCOUNT_SUPPORT",
  PRIVACY_REQUEST = "PRIVACY_REQUEST",
  CPD_PDU_TRACKING = "CPD_PDU_TRACKING",
  SECURITY_CONCERN = "SECURITY_CONCERN",
  GENERAL_QUESTION = "GENERAL_QUESTION",
  TECHNICAL_SUPPORT = "TECHNICAL_SUPPORT",
  ORGANIZATION_SOLUTION = "ORGANIZATION_SOLUTION",
  ACCESSIBILITY_FEEDBACK = "ACCESSIBILITY_FEEDBACK",
  ASSOCIATION_PARTNERSHIP = "ASSOCIATION_PARTNERSHIP",
  CONTENT_PROVIDER_INQUIRY = "CONTENT_PROVIDER_INQUIRY",
}

registerEnumType(ContactInquiryType, { name: "ContactInquiryType" });

export const CONTACT_INQUIRY_TYPE_LABELS: Record<ContactInquiryType, string> = {
  [ContactInquiryType.GENERAL_QUESTION]: "General question",
  [ContactInquiryType.TECHNICAL_SUPPORT]: "Technical support",
  [ContactInquiryType.ACCOUNT_SUPPORT]: "Account support",
  [ContactInquiryType.CPD_PDU_TRACKING]: "CPD/PDU tracking question",
  [ContactInquiryType.ASSOCIATION_PARTNERSHIP]: "Association partnership",
  [ContactInquiryType.ORGANIZATION_SOLUTION]: "Organization solution",
  [ContactInquiryType.CONTENT_PROVIDER_INQUIRY]: "Content provider inquiry",
  [ContactInquiryType.PRIVACY_REQUEST]: "Privacy request",
  [ContactInquiryType.ACCESSIBILITY_FEEDBACK]: "Accessibility feedback",
  [ContactInquiryType.SECURITY_CONCERN]: "Security concern",
  [ContactInquiryType.OTHER]: "Other",
};

export enum ContactGqlNames {
  SUBMIT_CONTACT_INQUIRY = "submitContactInquiry",
  SUBMIT_CONTACT_INQUIRY_INPUT = "SubmitContactInquiryInput",
  SUBMIT_CONTACT_INQUIRY_PAYLOAD = "SubmitContactInquiryPayload",
}
