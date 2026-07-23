-- Audit actions the organization onboarding workflow was missing. Submission,
-- account creation and notification failure were previously only observable as
-- request columns or server log lines, neither of which is an audit record.
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'ORG_ACCESS_REQUEST_SUBMITTED';

ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'ORGANIZATION_ACCOUNT_CREATED';

ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'ORGANIZATION_NOTIFICATION_FAILED';

-- Activation resolves a link by its hashed token alone, with no user or
-- destination available to narrow the search. Without this index the lookup
-- scans OtpCode, which grows with every OTP the platform issues.
CREATE INDEX IF NOT EXISTS "OtpCode_codeHash_purpose_idx"
  ON "OtpCode" ("codeHash", "purpose");
