import { UpdateProfessionalSettingsInput } from "@professional/dtos/update-professional-settings.input";
import { SessionStatus, Role } from "@prisma/client";
import { ForbiddenException } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { TUser } from "@common/types/user.types";

@Injectable()
export class ProfessionalSettingsService {
  constructor(private readonly prismaService: PrismaService) {}

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

  async resetSettings(user: TUser) {
    this.assertProfessional(user);
    return this.prismaService.professionalSettings.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {
        messages: true,
        theme: "SYSTEM",
        showEmail: false,
        loginAlerts: true,
        courseUpdates: true,
        eventReminders: true,
        showCertificates: true,
        pushNotifications: true,
        interfaceLanguage: "EN",
        emailNotifications: true,
        showLearningProgress: true,
        profileVisibility: "PUBLIC",
      },
    });
  }

  async activeSessions(user: TUser) {
    this.assertProfessional(user);
    return this.prismaService.authSession.findMany({
      where: {
        userId: user.id,
        status: SessionStatus.ACTIVE,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
