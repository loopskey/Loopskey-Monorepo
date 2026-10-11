import { PrismaClient, Role, SessionStatus, UserStatus } from "@prisma/client";
import { JwtService } from "@nestjs/jwt";
import {
  JWT_ACCESS_AUDIENCE,
  JWT_ALGORITHM,
  JWT_ISSUER,
  TOKEN_TYPE,
} from "@loopskey/api-contracts/auth";

const SESSION_LIFETIME_MS = 60 * 60 * 1000;

export const sessionIdFor = (userId: string) => `e2e-session-${userId}`;

export const openSession = (prisma: PrismaClient, userId: string) =>
  prisma.authSession.create({
    data: {
      id: sessionIdFor(userId),
      userId,
      refreshTokenHash: "e2e-not-a-real-hash",
      status: SessionStatus.ACTIVE,
      expiresAt: new Date(Date.now() + SESSION_LIFETIME_MS),
    },
  });

export const signAccessToken = (id: string, email: string, role: Role) =>
  new JwtService({ secret: process.env.JWT_ACCESS_SECRET }).sign(
    {
      sub: id,
      email,
      role,
      status: UserStatus.ACTIVE,
      sessionId: sessionIdFor(id),
      tokenType: TOKEN_TYPE.ACCESS,
    },
    {
      issuer: JWT_ISSUER,
      audience: JWT_ACCESS_AUDIENCE,
      algorithm: JWT_ALGORITHM,
      expiresIn: "15m",
    },
  );
