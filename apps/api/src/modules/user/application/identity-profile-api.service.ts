import { ConflictException, Injectable } from "@nestjs/common";
import { IdentityDisplayProjection } from "@user/public/identity-profile-api";
import { Prisma, Role, UserStatus } from "@prisma/client";
import { IdentityProfileApi } from "@user/public/identity-profile-api";
import { PrismaService } from "@prisma/prisma.service";

@Injectable()
export class IdentityProfileApiService implements IdentityProfileApi {
  constructor(private readonly prisma: PrismaService) {}

  display(userId: string): Promise<IdentityDisplayProjection | null> {
    return this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { id: true, email: true, fullName: true },
    });
  }

  async existsByEmail(email: string) {
    return Boolean(
      await this.prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() },
        select: { id: true },
      }),
    );
  }

  upsertProfessionalMember(command: {
    email: string;
    fullName: string;
    atomicContext?: object;
  }) {
    const email = command.email.trim().toLowerCase();
    const db =
      (command.atomicContext as Prisma.TransactionClient | undefined) ??
      this.prisma;
    return db.user.upsert({
      where: { email },
      create: {
        email,
        fullName: command.fullName.trim(),
        role: Role.PROFESSIONAL,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
      },
      update: { fullName: command.fullName.trim() },
      select: { id: true },
    });
  }

  async updateRole(userId: string, role: string, atomicContext?: object) {
    const db =
      (atomicContext as Prisma.TransactionClient | undefined) ?? this.prisma;
    await db.user.update({
      where: { id: userId },
      data: { role: role as Role },
    });
  }

  async resolveOrganizationOwner(command: {
    email: string;
    fullName: string;
    atomicContext: object;
  }) {
    const db = command.atomicContext as Prisma.TransactionClient;
    const email = command.email.trim().toLowerCase();
    const existing = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        role: true,
        deletedAt: true,
        ownedOrganization: { select: { id: true } },
      },
    });
    if (existing?.deletedAt)
      throw new ConflictException({
        code: "UserAlreadyExists",
        message:
          "A deleted account already uses this work email. Restore or replace it before approving.",
      });
    if (existing && existing.role !== Role.ORGANIZATION)
      throw new ConflictException({
        code: "UserRoleConflict",
        message:
          "An account with this work email already exists under a different role. Resolve the account before approving.",
      });
    if (existing?.ownedOrganization)
      throw new ConflictException({
        code: "OrganizationAlreadyExists",
        message: "This work email already owns an organization.",
      });
    if (existing) return { id: existing.id, linkedExisting: true };
    const created = await db.user.create({
      data: {
        email,
        passwordHash: null,
        role: Role.ORGANIZATION,
        status: UserStatus.PENDING,
        forcePasswordChange: false,
        emailVerifiedAt: null,
        fullName: command.fullName.trim(),
      },
      select: { id: true },
    });
    return { id: created.id, linkedExisting: false };
  }

  async createPendingAssociationOwner(command: {
    email: string;
    fullName: string;
    atomicContext: object;
  }) {
    const db = command.atomicContext as Prisma.TransactionClient;
    const created = await db.user.create({
      data: {
        email: command.email.trim().toLowerCase(),
        passwordHash: null,
        role: Role.ASSOCIATION,
        status: UserStatus.PENDING,
        forcePasswordChange: false,
        emailVerifiedAt: null,
        fullName: command.fullName.trim(),
      },
      select: { id: true },
    });
    return { id: created.id };
  }

  async resolveAssociationMemberUser(command: {
    email: string;
    fullName: string;
    atomicContext: object;
  }) {
    const db = command.atomicContext as Prisma.TransactionClient;
    const email = command.email.trim().toLowerCase();
    const existing = await db.user.findUnique({
      where: { email },
      select: { id: true, deletedAt: true },
    });
    if (existing?.deletedAt)
      throw new ConflictException({
        code: "UserDeleted",
        message:
          "A deleted account uses this email. Restore it before inviting.",
      });
    // An existing account is linked exactly as it stands. Rewriting its name or
    // role here would let any association edit a person it merely invited.
    if (existing) return { id: existing.id, linkedExisting: true };
    const created = await db.user.create({
      data: {
        email,
        passwordHash: null,
        role: Role.PROFESSIONAL,
        status: UserStatus.PENDING,
        forcePasswordChange: false,
        emailVerifiedAt: null,
        fullName: command.fullName.trim(),
      },
      select: { id: true },
    });
    return { id: created.id, linkedExisting: false };
  }
}
