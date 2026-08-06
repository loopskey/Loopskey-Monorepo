import { CONTACT_INQUIRY_TYPE_LABELS } from "@support/enums/contact-inquiry.enum";
import { ContactInquiryType } from "@support/enums/contact-inquiry.enum";

export type TContactInquiryEmail = {
  email: string;
  message: string;
  fullName: string;
  referenceId: string;
  organization?: string;
  inquiryType: ContactInquiryType;
};

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const row = (label: string, value: string) =>
  `<tr><td style="padding:6px 12px 6px 0;color:#64748b;vertical-align:top">${escapeHtml(label)}</td><td style="padding:6px 0;color:#0f172a">${escapeHtml(value)}</td></tr>`;

export const buildContactInquiryEmail = (input: TContactInquiryEmail) => {
  const typeLabel = CONTACT_INQUIRY_TYPE_LABELS[input.inquiryType];
  const organization = input.organization ?? "Not provided";
  const subject = `[Contact] ${typeLabel} - ${input.fullName}`;

  const text = [
    `Inquiry type: ${typeLabel}`,
    `Name: ${input.fullName}`,
    `Email: ${input.email}`,
    `Organization: ${organization}`,
    `Reference: ${input.referenceId}`,
    "",
    "Message:",
    input.message,
  ].join("\n");

  const html = [
    `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:640px">`,
    `<h2 style="color:#0f172a;margin:0 0 16px">New contact inquiry</h2>`,
    `<table style="border-collapse:collapse;font-size:14px;margin-bottom:20px">`,
    row("Inquiry type", typeLabel),
    row("Name", input.fullName),
    row("Email", input.email),
    row("Organization", organization),
    row("Reference", input.referenceId),
    `</table>`,
    `<div style="border-top:1px solid #e2e8f0;padding-top:16px">`,
    `<p style="color:#64748b;font-size:13px;margin:0 0 8px">Message</p>`,
    `<div style="color:#0f172a;font-size:14px;line-height:1.7;white-space:pre-wrap">${escapeHtml(input.message)}</div>`,
    `</div></div>`,
  ].join("");

  return { subject, html, text };
};
