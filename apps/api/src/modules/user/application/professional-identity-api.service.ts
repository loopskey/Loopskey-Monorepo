import { ProfessionalIdentityApi } from "@user/public/professional-identity-api";
import { Prisma, SessionStatus } from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ProfessionalIdentityApiService implements ProfessionalIdentityApi {
  constructor(private readonly prisma: PrismaService) {}

  profile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        bio: true,
        role: true,
        email: true,
        phone: true,
        status: true,
        fullName: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        emailVerifiedAt: true,
      },
    });
  }

  async update(
    userId: string,
    data: { fullName?: string; bio?: string | null; phone?: string | null },
    atomicContext?: object,
  ) {
    const db =
      (atomicContext as Prisma.TransactionClient | undefined) ?? this.prisma;
    await db.user.update({ where: { id: userId }, data });
  }

  avatar(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatarStorageKey: true },
    });
  }

  setAvatar(
    userId: string,
    value: { avatarStorageKey: string | null; avatarUrl: string | null },
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data: value,
      select: { id: true, avatarUrl: true },
    });
  }

  async avatarOwner(storageKey: string) {
    return Boolean(
      await this.prisma.user.findFirst({
        where: { avatarStorageKey: storageKey },
        select: { id: true },
      }),
    );
  }

  activeSessions(userId: string) {
    return this.prisma.authSession.findMany({
      where: {
        userId,
        status: SessionStatus.ACTIVE,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        userId: true,
        status: true,
        revokedAt: true,
        userAgent: true,
        ipAddress: true,
        createdAt: true,
        updatedAt: true,
        expiresAt: true,
      },
    });
  }
}
