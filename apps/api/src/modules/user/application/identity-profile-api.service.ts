import { ConflictException, Injectable } from "@nestjs/common";
import { IdentityRecipientProjection } from "@user/public/identity-profile-api";
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

  async recipients(
    userIds: readonly string[],
  ): Promise<IdentityRecipientProjection[]> {
    if (userIds.length === 0) return [];

    const users = await this.prisma.user.findMany({
      where: { id: { in: [...userIds] }, deletedAt: null },
      select: {
        id: true,
        email: true,
        status: true,
        fullName: true,
        emailVerifiedAt: true,
      },
    });

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      emailVerifiedAt: user.emailVerifiedAt,
      isActive: user.status === UserStatus.ACTIVE,
    }));
  }

  async activeProviderIds(userIds: readonly string[]) {
    if (userIds.length === 0) return new Set<string>();
    const providers = await this.prisma.user.findMany({
      where: {
        id: { in: [...userIds] },
        role: Role.PROVIDER,
        status: UserStatus.ACTIVE,
        deletedAt: null,
      },
      select: { id: true },
    });
    return new Set(providers.map((provider) => provider.id));
  }

  async renameUnclaimedUser(userId: string, fullName: string) {
    const renamed = await this.prisma.user.updateMany({
      where: {
        id: userId,
        deletedAt: null,
        passwordHash: null,
        status: UserStatus.PENDING,
      },
      data: { fullName: fullName.trim() },
    });

    return renamed.count === 1;
  }

  async existsByEmail(email: string) {
    return Boolean(
      await this.prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() },
        select: { id: true },
      }),
    );
  }

  async upsertProfessionalMember(command: {
    email: string;
    fullName: string;
    atomicContext?: object;
  }) {
    const email = command.email.trim().toLowerCase();
    const db =
      (command.atomicContext as Prisma.TransactionClient | undefined) ??
      this.prisma;
    const member = await db.user.upsert({
      where: { email },
      create: {
        email,
        fullName: command.fullName.trim(),
        role: Role.PROFESSIONAL,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
      },
      update: {},
      select: { id: true, role: true, deletedAt: true },
    });
    if (member.deletedAt || member.role !== Role.PROFESSIONAL)
      throw new ConflictException({
        code: "UserRoleConflict",
        message:
          "This email belongs to an account that cannot be added as a member.",
      });
    return { id: member.id };
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

  async resolveAssociationOwner(command: {
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
        ownedAssociation: { select: { id: true } },
      },
    });
    if (existing?.deletedAt)
      throw new ConflictException({
        code: "UserAlreadyExists",
        message:
          "A deleted account already uses this work email. Restore or replace it before approving.",
      });
    if (existing && existing.role !== Role.ASSOCIATION)
      throw new ConflictException({
        code: "UserRoleConflict",
        message:
          "An account with this work email already exists under a different role. Resolve the account before approving.",
      });
    if (existing?.ownedAssociation)
      throw new ConflictException({
        code: "AssociationAlreadyExists",
        message: "This work email already owns an association.",
      });
    if (existing) return { id: existing.id, linkedExisting: true };
    const created = await db.user.create({
      data: {
        email,
        passwordHash: null,
        role: Role.ASSOCIATION,
        status: UserStatus.PENDING,
        forcePasswordChange: false,
        emailVerifiedAt: null,
        fullName: command.fullName.trim(),
      },
      select: { id: true },
    });
    return { id: created.id, linkedExisting: false };
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
      select: { id: true, status: true, deletedAt: true },
    });
    if (existing?.deletedAt)
      throw new ConflictException({
        code: "UserDeleted",
        message:
          "A deleted account uses this email. Restore it before inviting.",
      });
    if (existing)
      return {
        id: existing.id,
        linkedExisting: existing.status === UserStatus.ACTIVE,
      };
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
