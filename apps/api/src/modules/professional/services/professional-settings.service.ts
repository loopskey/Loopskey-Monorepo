import { UpdateProfessionalSettingsInput } from "@professional/dtos/update-professional-settings.input";
import { type ProfessionalIdentityApi } from "@user/public/professional-identity-api";
import { PROFESSIONAL_IDENTITY_API } from "@user/public/professional-identity-api";
import { ForbiddenException } from "@nestjs/common";
import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { TUser } from "@common/types/user.types";
import { Role } from "@prisma/client";

@Injectable()
export class ProfessionalSettingsService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(PROFESSIONAL_IDENTITY_API)
    private readonly identity: ProfessionalIdentityApi,
  ) {}

  private assertProfessional(user: TUser) {
    if (user.role !== Role.PROFESSIONAL && user.role !== Role.ADMIN)
      throw new ForbiddenException("Professional access required.");
  }

  async settings(user: TUser) {
    this.assertProfessional(user);
    return this.prismaService.professionalSettings.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {},
    });
  }

  async updateSettings(user: TUser, input: UpdateProfessionalSettingsInput) {
    this.assertProfessional(user);
    return this.prismaService.professionalSettings.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...input },
      update: input,
    });
  }

  async activeSessions(user: TUser) {
    this.assertProfessional(user);
    return this.identity.activeSessions(user.id);
  }
}
