import { Role, UserStatus } from "@prisma/client";

export type JwtPayload = {
  role: Role;
  sub: string;
  status: UserStatus;
  sessionId?: string;
  email: string | null;
  forcePasswordChange?: boolean;
};
