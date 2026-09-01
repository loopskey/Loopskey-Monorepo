import { Prisma, Role, UserStatus } from "@prisma/client";
import { ActivationTokenStatus } from "@auth/enums/activation-token-status.enum";

import { type ActivationAccountRole } from "@auth/public/account-activation-api";

export type IssueActivationLinkArgs = {
  userId: string;
  destination: string;
  role?: ActivationAccountRole;
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
    },
  },
} satisfies Prisma.OtpCodeSelect;

export type AccountActivationRecord = Prisma.OtpCodeGetPayload<{
  select: typeof ACTIVATION_RECORD_SELECT;
}>;

export type AccountActivationSubject = NonNullable<
  AccountActivationRecord["user"]
>;

export type AccountActivationCheck =
  | {
      status: ActivationTokenStatus.VALID;
      otpCodeId: string;
      subject: AccountActivationSubject;
    }
  | {
      status: Exclude<ActivationTokenStatus, ActivationTokenStatus.VALID>;
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
