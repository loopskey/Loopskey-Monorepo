import {
  TOrganizationApprovalEmail,
  TOrganizationEmailBase,
  TOrganizationRejectionEmail,
} from "@mail/mail-service.type";

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const frame = (input: TOrganizationEmailBase, title: string, body: string) => {
  const appName = escapeHtml(input.appName);
  const supportEmail = escapeHtml(input.supportEmail);
  return `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#111827;background:#f6f8fb;padding:32px"><main style="max-width:600px;margin:auto;background:white;padding:32px;border-radius:16px"><strong style="color:#2563eb">${appName}</strong><h1>${escapeHtml(title)}</h1>${body}<p>Need help? Contact <a href="mailto:${supportEmail}">${supportEmail}</a>.</p><p style="color:#6b7280">${appName} Team</p></main></body></html>`;
};

export const buildOrganizationSubmittedEmail = (
  input: TOrganizationEmailBase,
) => ({
  subject: `${input.appName}: application received`,
  text: `We received the application for ${input.organizationName}. It is waiting for Admin review. Support: ${input.supportEmail}`,
  html: frame(
    input,
    "Application received",
    `<p>We received the application for <strong>${escapeHtml(input.organizationName)}</strong>.</p><p>It is waiting for Admin review.</p>`,
  ),
});

export const buildOrganizationRejectionEmail = (
  input: TOrganizationRejectionEmail,
) => ({
  subject: `${input.appName}: application update`,
  text: `The application for ${input.organizationName} was not approved. Reason: ${input.reason}. Support: ${input.supportEmail}`,
  html: frame(
    input,
    "Application reviewed",
    `<p>The application for <strong>${escapeHtml(input.organizationName)}</strong> was not approved.</p><p><strong>Reason:</strong> ${escapeHtml(input.reason)}</p><p>You may contact support for next steps.</p>`,
  ),
});

export const buildOrganizationApprovalEmail = (
  input: TOrganizationApprovalEmail,
) => ({
  subject: `${input.appName}: activate your Organization account`,
  text: `The application for ${input.organizationName} was approved. Username: ${input.username}. Set your password: ${input.activationUrl}. This single-use link expires in ${input.expiresInMinutes} minutes. Login: ${input.loginUrl}. Do not share this link. Support: ${input.supportEmail}`,
  html: frame(
    input,
    "Application approved",
    `<p>The application for <strong>${escapeHtml(input.organizationName)}</strong> was approved.</p><p>Username: <strong>${escapeHtml(input.username)}</strong></p><p><a href="${escapeHtml(input.activationUrl)}" style="display:inline-block;padding:12px 20px;background:#2563eb;color:white;text-decoration:none;border-radius:10px">Set your password</a></p><p>This single-use link expires in ${input.expiresInMinutes} minutes. Do not share it.</p><p>After activation, sign in at <a href="${escapeHtml(input.loginUrl)}">${escapeHtml(input.loginUrl)}</a>.</p>`,
  ),
});

export const buildOrganizationPasswordChangedEmail = (
  input: TOrganizationEmailBase,
) => ({
  subject: `${input.appName}: password changed`,
  text: `The password for ${input.organizationName} was changed successfully. If this was not you, contact ${input.supportEmail} immediately.`,
  html: frame(
    input,
    "Password changed",
    `<p>The password for <strong>${escapeHtml(input.organizationName)}</strong> was changed successfully.</p><p>If this was not you, contact support immediately.</p>`,
  ),
});
