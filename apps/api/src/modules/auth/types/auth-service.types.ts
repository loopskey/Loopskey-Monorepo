import { OrganizationActivationTokenStatus } from "@auth/enums/organization-activation-token-status.enum";
import { Prisma, Role, UserStatus } from "@prisma/client";

export type IssueActivationLinkArgs = {
  userId: string;
  destination: string;
};

export const ACTIVATION_RECORD_SELECT = {
  id: true,
  expiresAt: true,
  consumedAt: true,
  user: {
    select: {
      id: true,
      role: true,
      email: true,
      status: true,
      deletedAt: true,
      emailVerifiedAt: true,
      organizationProfile: { select: { organizationName: true } },
    },
  },
} satisfies Prisma.OtpCodeSelect;

export type OrganizationActivationRecord = Prisma.OtpCodeGetPayload<{
  select: typeof ACTIVATION_RECORD_SELECT;
}>;

export type OrganizationActivationSubject = NonNullable<
  OrganizationActivationRecord["user"]
>;

export type OrganizationActivationCheck =
  | {
      status: OrganizationActivationTokenStatus.VALID;
      otpCodeId: string;
      subject: OrganizationActivationSubject;
    }
  | {
      status: Exclude<
        OrganizationActivationTokenStatus,
        OrganizationActivationTokenStatus.VALID
      >;
      otpCodeId: null;
      subject: null;
    };

export type AuthCookieTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthenticatedUser = {
  id: string;
  role: Role;
  status: UserStatus;
  email: string | null;
  fullName: string | null;
  emailVerifiedAt: Date | null;
};

export type RequestContextInfo = {
  ipAddress?: string | null;
  userAgent?: string | null;
};
