import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { CreateProfessionalCredentialInput } from "@professional/dtos/create-professional-credential.input";
import { UpdateProfessionalCredentialInput } from "@professional/dtos/update-professional-credential.input";
import { Injectable, NotFoundException } from "@nestjs/common";
import { ProfessionalMessageCode } from "@professional/enums/message-code.enum";
import { PrismaService } from "@prisma/prisma.service";
import { TUser } from "@common/types/user.types";
import { Role } from "@prisma/client";

@Injectable()
export class ProfessionalCredentialService {
  constructor(private readonly prismaService: PrismaService) {}

  private assertProfessional(user: TUser) {
    if (user.role !== Role.PROFESSIONAL && user.role !== Role.ADMIN)
      throw new ForbiddenException(
        ProfessionalMessageCode.PROFESSIONAL_ACCESS_REQUIRED,
      );
  }

  private async buildData(
    user: TUser,
    input: CreateProfessionalCredentialInput,
  ) {
    const issueDate = new Date(input.issueDate);
    const expiryDate = input.expiryDate ? new Date(input.expiryDate) : null;

    if (expiryDate && expiryDate.getTime() < issueDate.getTime())
      throw new BadRequestException(
        ProfessionalMessageCode.CREDENTIAL_EXPIRY_BEFORE_ISSUE,
      );

    if (input.pduTargetId) {
      const plan = await this.prismaService.pDUTarget.findFirst({
        where: { id: input.pduTargetId, userId: user.id },
        select: { id: true },
      });
      if (!plan)
        throw new BadRequestException(
          ProfessionalMessageCode.CREDENTIAL_CPD_PLAN_NOT_FOUND,
        );
    }
    return {
      issueDate,
      expiryDate,
      name: input.name,
      issuingOrganization: input.issuingOrganization,
      licenceNumber: input.licenceNumber ?? null,
      annualCpdHours: input.annualCpdHours ?? null,
      pduTargetId: input.pduTargetId ?? null,
    };
  }

  private async assertOwned(user: TUser, credentialId: string) {
    const credential =
      await this.prismaService.professionalCredential.findFirst({
        where: { id: credentialId, userId: user.id },
        select: { id: true },
      });
    if (!credential)
      throw new NotFoundException(ProfessionalMessageCode.CREDENTIAL_NOT_FOUND);
    return credential;
  }

  async create(user: TUser, input: CreateProfessionalCredentialInput) {
    this.assertProfessional(user);
    const data = await this.buildData(user, input);
    return this.prismaService.professionalCredential.create({
      data: { ...data, userId: user.id },
    });
  }

  async update(user: TUser, input: UpdateProfessionalCredentialInput) {
    this.assertProfessional(user);
    const { id, ...rest } = input;
    await this.assertOwned(user, id);
    const data = await this.buildData(user, rest);
    return this.prismaService.professionalCredential.update({
      where: { id },
      data,
    });
  }

  async delete(user: TUser, credentialId: string) {
    this.assertProfessional(user);
    await this.assertOwned(user, credentialId);
    await this.prismaService.professionalCredential.delete({
      where: { id: credentialId },
    });
    return { id: credentialId };
  }
}
