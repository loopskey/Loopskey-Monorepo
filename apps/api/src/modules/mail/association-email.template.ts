import { TAssociationMemberInvitationEmail } from "@mail/mail-service.type";
import { TAssociationActivationEmail } from "@mail/mail-service.type";
import { TAssociationEmailBase } from "@mail/mail-service.type";

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const frame = (input: TAssociationEmailBase, title: string, body: string) => {
  const appName = escapeHtml(input.appName);
  const supportEmail = escapeHtml(input.supportEmail);
  return `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#111827;background:#f6f8fb;padding:32px"><main style="max-width:600px;margin:auto;background:white;padding:32px;border-radius:16px"><strong style="color:#2563eb">${appName}</strong><h1>${escapeHtml(title)}</h1>${body}<p>Need help? Contact <a href="mailto:${supportEmail}">${supportEmail}</a>.</p><p style="color:#6b7280">${appName} Team</p></main></body></html>`;
};

export const buildAssociationActivationEmail = (
  input: TAssociationActivationEmail,
) => ({
  subject: `${input.appName}: activate your Association account`,
  text: `An Association account was created for ${input.associationName}. Username: ${input.username}. Set your password: ${input.activationUrl}. This single-use link expires in ${input.expiresInMinutes} minutes. Login: ${input.loginUrl}. Do not share this link. Support: ${input.supportEmail}`,
  html: frame(
    input,
    "Activate your account",
    `<p>An Association account was created for <strong>${escapeHtml(input.associationName)}</strong>.</p><p>Username: <strong>${escapeHtml(input.username)}</strong></p><p><a href="${escapeHtml(input.activationUrl)}" style="display:inline-block;padding:12px 20px;background:#2563eb;color:white;text-decoration:none;border-radius:10px">Set your password</a></p><p>This single-use link expires in ${input.expiresInMinutes} minutes. Do not share it.</p><p>After activation, sign in at <a href="${escapeHtml(input.loginUrl)}">${escapeHtml(input.loginUrl)}</a>.</p>`,
  ),
});

export const buildAssociationPasswordChangedEmail = (
  input: TAssociationEmailBase,
) => ({
  subject: `${input.appName}: password changed`,
  text: `The password for ${input.associationName} was changed successfully. If this was not you, contact ${input.supportEmail} immediately.`,
  html: frame(
    input,
    "Password changed",
    `<p>The password for <strong>${escapeHtml(input.associationName)}</strong> was changed successfully.</p><p>If this was not you, contact support immediately.</p>`,
  ),
});

export const buildAssociationMemberInvitationEmail = (
  input: TAssociationMemberInvitationEmail,
) => ({
  subject: `${input.appName}: ${input.associationName} invited you`,
  text: `${input.associationName} invited you to join them on ${input.appName}. Set your password to accept: ${input.invitationUrl}. This single-use link expires in ${input.expiresInMinutes} minutes. Do not share it. Support: ${input.supportEmail}`,
  html: frame(
    input,
    "You have been invited",
    `<p>Hello ${escapeHtml(input.memberName)},</p><p><strong>${escapeHtml(input.associationName)}</strong> invited you to join them on ${escapeHtml(input.appName)}.</p><p><a href="${escapeHtml(input.invitationUrl)}" style="display:inline-block;padding:12px 20px;background:#2563eb;color:white;text-decoration:none;border-radius:10px">Accept the invitation</a></p><p>This single-use link expires in ${input.expiresInMinutes} minutes. Do not share it.</p>`,
  ),
});
