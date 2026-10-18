import type { ContactInquiryType } from "@/lib/graphql/base";

export const contactInquiryTypes = [
  { value: "GENERAL_QUESTION", fallback: "General question" },
  { value: "TECHNICAL_SUPPORT", fallback: "Technical support" },
  { value: "ACCOUNT_SUPPORT", fallback: "Account support" },
  { value: "CPD_PDU_TRACKING", fallback: "CPD/PDU tracking question" },
  { value: "ASSOCIATION_PARTNERSHIP", fallback: "Association partnership" },
  { value: "ORGANIZATION_SOLUTION", fallback: "Organization solution" },
  { value: "CONTENT_PROVIDER_INQUIRY", fallback: "Content provider inquiry" },
  { value: "PRIVACY_REQUEST", fallback: "Privacy request" },
  { value: "ACCESSIBILITY_FEEDBACK", fallback: "Accessibility feedback" },
  { value: "SECURITY_CONCERN", fallback: "Security concern" },
  { value: "OTHER", fallback: "Other" },
] as const satisfies readonly { value: ContactInquiryType; fallback: string }[];

export const CONTACT_INQUIRY_VALUES = contactInquiryTypes.map(
  (option) => option.value,
) as [ContactInquiryType, ...ContactInquiryType[]];

export const DEFAULT_CONTACT_INQUIRY: ContactInquiryType = "GENERAL_QUESTION";
