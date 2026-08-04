import { IdentityAdministrationApi } from "@user/public/identity-administration-api";
import { IdentityDirectoryQuery } from "@user/public/identity-administration-api";
import { RoleProfileRegistry } from "@prisma/role-profile-registry.service";
import { Role, UserStatus } from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class IdentityAdministrationApiService
  implements IdentityAdministrationApi
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly roleProfiles: RoleProfileRegistry,
  ) {}

  profile(userId: string) {
    return this.prisma.user.findFirst({
      where: { id: userId, role: Role.ADMIN, deletedAt: null },
    });
  }

  updateProfile(
    userId: string,
    input: {
      fullName?: string;
      email?: string;
      avatarUrl?: string;
      bio?: string;
    },
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: input.fullName,
        email: input.email?.trim().toLowerCase(),
        avatarUrl: input.avatarUrl,
        bio: input.bio,
      },
    });
  }

  async directory(query: IdentityDirectoryQuery) {
    const roles = query.role
      ? [query.role as Role]
      : [Role.PROVIDER, Role.PROFESSIONAL, Role.ORGANIZATION];
    const rows = await this.prisma.user.findMany({
      where: {
        deletedAt: null,
        role: { in: roles },
        status: query.status as UserStatus | undefined,
      },
      orderBy: { createdAt: "desc" },
    });
    const enriched = await Promise.all(
      rows.map(async (user) => {
        const profile = await this.roleProfiles.project(user.role, user.id);
        return { user, profile };
      }),
    );
    const search = query.search?.trim().toLowerCase();
    const filtered = enriched.filter(({ user, profile }) => {
      const profileValues = profile ? Object.values(profile) : [];
      const matchesSearch =
        !search ||
        [user.fullName, user.email, ...profileValues].some(
          (value) =>
            typeof value === "string" && value.toLowerCase().includes(search),
        );
      const matchesPremium = !query.premiumOnly || profile?.isPremium === true;
      return matchesSearch && matchesPremium;
    });
    const cursorIndex = query.cursor
      ? filtered.findIndex(({ user }) => user.id === query.cursor) + 1
      : 0;
    const page = filtered.slice(cursorIndex, cursorIndex + query.take + 1);
    const items = page.slice(0, query.take).map(({ user, profile }) => ({
      id: user.id,
      role: user.role,
      email: user.email,
      status: user.status,
      fullName: user.fullName,
      createdAt: user.createdAt,
      avatarUrl: user.avatarUrl,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
      isPremium: profile?.isPremium === true,
      location:
        (typeof profile?.workLocation === "string" && profile.workLocation) ||
        (typeof profile?.organizationName === "string" &&
          profile.organizationName) ||
        null,
    }));
    return {
      items,
      totalCount: filtered.length,
      pageInfo: {
        hasNextPage: page.length > query.take,
        nextCursor: page.length > query.take ? items.at(-1)?.id : null,
      },
    };
  }

  async updateStatus(userId: string, status: string) {
    const target = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    });
    if (!target) return null;
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        status: status as UserStatus,
        deletedAt: status === UserStatus.DELETED ? new Date() : null,
      },
    });
  }

  async growth(mode: "DAILY" | "MONTHLY") {
    const from = new Date();
    if (mode === "MONTHLY") from.setMonth(from.getMonth() - 11);
    else from.setDate(from.getDate() - 29);
    from.setHours(0, 0, 0, 0);
    const users = await this.prisma.user.findMany({
      where: {
        deletedAt: null,
        createdAt: { gte: from },
        role: { in: [Role.PROVIDER, Role.PROFESSIONAL] },
      },
      select: { role: true, createdAt: true },
    });
    const map = new Map<string, { providers: number; professionals: number }>();
    for (const item of users) {
      const key =
        mode === "MONTHLY"
          ? item.createdAt.toISOString().slice(0, 7)
          : item.createdAt.toISOString().slice(0, 10);
      const current = map.get(key) ?? { providers: 0, professionals: 0 };
      if (item.role === Role.PROVIDER) current.providers += 1;
      if (item.role === Role.PROFESSIONAL) current.professionals += 1;
      map.set(key, current);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({
        date,
        label: date,
        ...value,
        total: value.providers + value.professionals,
      }));
  }
}
