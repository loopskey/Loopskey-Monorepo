import { AuthMessageCode } from "@loopskey/api-contracts";
import { AuditAction, OtpPurpose, Role } from "@prisma/client";

export type ActivationLinkProfile = {
  readonly purpose: OtpPurpose;
  readonly urlConfigKey: string;
  readonly lockKeyPrefix: string;
  readonly urlFallbackPath: string;
};

export type ActivationProfile = ActivationLinkProfile & {
  readonly role: Role;
  readonly nameKey: string;
  readonly fallbackName: string;
  readonly auditResent: AuditAction;
  readonly activatedMessage: string;
  readonly loginUrlConfigKey: string;
  readonly auditActivated: AuditAction;
  readonly activatedCode: AuthMessageCode;
};
