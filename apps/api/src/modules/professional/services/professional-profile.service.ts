import { UpdateProfessionalProfileInput } from "@professional/dtos/update-professional-profile.input";
import { Injectable, NotFoundException } from "@nestjs/common";
import { ForbiddenException } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { TUser } from "@common/types/user.types";
import { Role } from "@prisma/client";

@Injectable()
export class ProfessionalProfileService {
  constructor(private readonly prismaService: PrismaService) {}

  private assertProfessional(user: TUser) {
    if (user.role !== Role.PROFESSIONAL && user.role !== Role.ADMIN)
      throw new ForbiddenException("Professional access required.");
  }

  async profile(user: TUser) {
    this.assertProfessional(user);
    const found = await this.prismaService.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        bio: true,
        role: true,
        email: true,
        phone: true,
        status: true,
        fullName: true,
        avatarUrl: true,
        certificates: true,
        pduActivities: true,
        contentEnrollments: true,
        professionalProfile: {
          select: {
            location: true,
            website: true,
            education: true,
            occupation: true,
          },
        },
      },
    });
    if (!found) throw new NotFoundException("User not found.");
    return {
      id: found.id,
      bio: found.bio,
      role: found.role,
      email: found.email,
      phone: found.phone,
      status: found.status,
      fullName: found.fullName,
      avatarUrl: found.avatarUrl,
      certificatesEarned: found.certificates.length,
      coursesEnrolled: found.contentEnrollments.length,
      website: found.professionalProfile?.website ?? null,
      location: found.professionalProfile?.location ?? null,
      education: found.professionalProfile?.education ?? null,
      occupation: found.professionalProfile?.occupation ?? null,
      learningHours: found.pduActivities.reduce(
        (sum, item) => sum + Number(item.pdus ?? 0),
        0,
      ),
    };
  }

  async updateProfile(user: TUser, input: UpdateProfessionalProfileInput) {
    this.assertProfessional(user);
    const { location, website, education, occupation, ...userData } = input;
    await this.prismaService.user.update({
      where: { id: user.id },
      data: userData,
    });
    await this.prismaService.professionalProfile.upsert({
      where: { userId: user.id },
      create: {
        website,
        location,
        education,
        occupation,
        skills: [],
        interests: [],
        userId: user.id,
      },
      update: {
        website,
        location,
        education,
        occupation,
      },
    });
    return this.profile(user);
  }
}
