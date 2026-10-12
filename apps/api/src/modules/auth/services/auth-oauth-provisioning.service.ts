import { REGISTRATION_COMPLETED_EVENT } from "@telemetry/public/telemetry-events";
import { TCreateOAuthUserInput } from "@auth/types/oauth-service.types";
import { RoleProfileRegistry } from "@prisma/role-profile-registry.service";
import { Role, UserStatus } from "@prisma/client";
import { AUTH_USER_SELECT } from "@auth/types/auth-user-select.constant";
import { PrismaService } from "@prisma/prisma.service";
import { OutboxService } from "@infrastructure/outbox/outbox.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AuthOAuthProvisioningService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly roleProfiles: RoleProfileRegistry,
    private readonly outbox: OutboxService,
  ) {}

  async createUser(input: TCreateOAuthUserInput) {
    const { link, ...profile } = input;
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: profile.email,
          role: profile.role,
          status: UserStatus.ACTIVE,
          fullName: profile.fullName,
          avatarUrl: profile.avatarUrl,
          emailVerifiedAt: new Date(),
          forcePasswordChange: false,
        },
        select: AUTH_USER_SELECT,
      });
      await this.roleProfiles.provision(profile.role, user.id, tx);
      await link?.(tx, user.id);
      await this.outbox.append(
        {
          eventName: REGISTRATION_COMPLETED_EVENT,
          aggregateType: "User",
          aggregateId: user.id,
          payload: { role: profile.role },
        },
        tx,
      );
      return user;
    });
  }

  async ensureRoleProfile(role: Role, userId: string) {
    await this.roleProfiles.provision(role, userId);
  }
}
