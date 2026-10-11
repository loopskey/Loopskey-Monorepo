import { Role, UserStatus } from "@prisma/client";

export type JwtPayload = {
  role: Role;
  sub: string;
  rot?: number;
  status: UserStatus;
  sessionId?: string;
  tokenType?: string;
  email: string | null;
  forcePasswordChange?: boolean;
};
