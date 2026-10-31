import { CONTACT_INQUIRY_TYPE_LABELS } from "@support/enums/contact-inquiry.enum";
import { escapeHtml, singleLine } from "@mail/utils/email-layout";
import { ContactInquiryType } from "@support/enums/contact-inquiry.enum";

export type TContactInquiryEmail = {
  email: string;
  message: string;
  fullName: string;
  referenceId: string;
  organization?: string;
  inquiryType: ContactInquiryType;
};

const row = (label: string, value: string) =>
  `<tr><td style="padding:6px 12px 6px 0;color:#64748b;vertical-align:top">${escapeHtml(label)}</td><td style="padding:6px 0;color:#0f172a">${escapeHtml(value)}</td></tr>`;

export const buildContactInquiryEmail = (input: TContactInquiryEmail) => {
  const typeLabel = CONTACT_INQUIRY_TYPE_LABELS[input.inquiryType];
  const fullName = singleLine(input.fullName);
  const email = singleLine(input.email);
  const organization = singleLine(input.organization ?? "") || "Not provided";
  const referenceId = singleLine(input.referenceId);
  const subject = singleLine(`New contact inquiry — ${typeLabel}`);

  const text = [
    "New inquiry received",
    "",
    `Type: ${typeLabel}`,
    `Name: ${fullName}`,
    `Email: ${email}`,
    `Organization: ${organization}`,
    `Reference: ${referenceId}`,
    "",
    "Message:",
    input.message,
  ].join("\n");

  const html = [
    `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:640px">`,
    `<h2 style="color:#0f172a;margin:0 0 16px">New inquiry received</h2>`,
    `<table style="border-collapse:collapse;font-size:14px;margin-bottom:20px">`,
    row("Type", typeLabel),
    row("Name", fullName),
    row("Email", email),
    row("Organization", organization),
    row("Reference", referenceId),
    `</table>`,
    `<div style="border-top:1px solid #e2e8f0;padding-top:16px">`,
    `<p style="color:#64748b;font-size:13px;margin:0 0 8px">Message</p>`,
    `<div style="color:#0f172a;font-size:14px;line-height:1.7;white-space:pre-wrap">${escapeHtml(input.message)}</div>`,
    `</div></div>`,
  ].join("");

  return { subject, html, text };
};
