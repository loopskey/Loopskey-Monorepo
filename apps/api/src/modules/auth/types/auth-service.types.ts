import { Role, UserStatus } from "@prisma/client";

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
