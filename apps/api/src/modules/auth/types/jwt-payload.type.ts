import { Role, UserStatus } from "@prisma/client";

export type JwtPayload = {
  role: Role;
  sub: string;
  status: UserStatus;
  sessionId?: string;
  /**
   * The session rotation counter this token was minted at. Refresh rotation
   * compares it against the stored counter, which is what makes a replayed
   * refresh token distinguishable from a concurrent one.
   */
  rot?: number;
  email: string | null;
  forcePasswordChange?: boolean;
};
