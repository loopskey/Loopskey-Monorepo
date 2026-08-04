import { BadRequestException, NotFoundException } from "@nestjs/common";
import { ProfessionalCertificatesService } from "@professional/services/professional-certificate.service";
import { ForbiddenException, Injectable } from "@nestjs/common";
import { type EvidenceStoragePort } from "@professional/storage/evidence-storage.port";
import { ProfessionalMessageCode } from "@professional/enums/message-code.enum";
import { EVIDENCE_STORAGE } from "@professional/storage/evidence-storage.port";
import { PrismaService } from "@prisma/prisma.service";
import { randomUUID } from "crypto";
import { extname } from "path";
import { Inject } from "@nestjs/common";
import { TUser } from "@common/types/user.types";
import { Role } from "@prisma/client";

import * as C from "@professional/enums/certificate-file.constant";

@Injectable()
export class ProfessionalCertificateFileService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly certificatesService: ProfessionalCertificatesService,
    @Inject(EVIDENCE_STORAGE)
    private readonly storage: EvidenceStoragePort,
  ) {}

  private assertProfessional(user: TUser) {
    if (user.role !== Role.PROFESSIONAL && user.role !== Role.ADMIN)
      throw new ForbiddenException(
        ProfessionalMessageCode.PROFESSIONAL_ACCESS_REQUIRED,
      );
  }

  private async assertCertificateOwned(user: TUser, certificateId: string) {
    const certificate = await this.prismaService.certificate.findFirst({
      where: { id: certificateId, userId: user.id },
      select: { id: true, _count: { select: { evidenceFiles: true } } },
    });
    if (!certificate)
      throw new NotFoundException(
        ProfessionalMessageCode.CERTIFICATE_NOT_FOUND,
      );
    return certificate;
  }

  async uploadEvidence(
    user: TUser,
    certificateId: string,
    files: Express.Multer.File[],
  ) {
    this.assertProfessional(user);
    if (!files?.length)
      throw new BadRequestException(
        ProfessionalMessageCode.CERTIFICATE_FILE_EMPTY,
      );
    const certificate = await this.assertCertificateOwned(user, certificateId);
    if (
      certificate._count.evidenceFiles + files.length >
      C.MAX_CERTIFICATE_FILES
    )
      throw new BadRequestException(
        ProfessionalMessageCode.CERTIFICATE_FILE_LIMIT_EXCEEDED,
      );

    const created: { id: string }[] = [];
    for (const file of files) {
      if (!file.size || !file.buffer?.length)
        throw new BadRequestException(
          ProfessionalMessageCode.CERTIFICATE_FILE_EMPTY,
        );
      const extension = extname(file.originalname).toLowerCase();
      if (!C.isAcceptedCertificateFile(file.mimetype, extension))
        throw new BadRequestException(
          ProfessionalMessageCode.CERTIFICATE_FILE_INVALID_TYPE,
        );
      const storageKey = `${randomUUID()}${extension}`;
      await this.storage.store("certificate", storageKey, file.buffer);
      let row: { id: string };
      try {
        row = await this.prismaService.certificateFile.create({
          data: {
            certificateId,
            userId: user.id,
            fileName: file.originalname,
            storageKey,
            mimeType: file.mimetype,
            sizeBytes: file.size,
          },
          select: { id: true },
        });
      } catch (error) {
        await this.storage.remove("certificate", storageKey);
        throw error;
      }
      created.push(row);
    }
    return { certificateId, uploaded: created.length };
  }

  private async findOwnedFile(user: TUser, fileId: string) {
    const file = await this.prismaService.certificateFile.findFirst({
      where: { id: fileId, userId: user.id },
    });
    if (!file)
      throw new NotFoundException(
        ProfessionalMessageCode.CERTIFICATE_FILE_NOT_FOUND,
      );
    return file;
  }

  private resolveStoredFile(storageKey: string) {
    try {
      return this.storage.resolve("certificate", storageKey);
    } catch {
      throw new NotFoundException(
        ProfessionalMessageCode.CERTIFICATE_FILE_NOT_FOUND,
      );
    }
  }

  async getEvidenceForDownload(user: TUser, fileId: string) {
    this.assertProfessional(user);
    const file = await this.findOwnedFile(user, fileId);
    return { file, filePath: this.resolveStoredFile(file.storageKey) };
  }

  async deleteEvidence(user: TUser, fileId: string) {
    this.assertProfessional(user);
    const file = await this.findOwnedFile(user, fileId);
    await this.prismaService.certificateFile.delete({ where: { id: file.id } });
    await this.certificatesService.removeCertificateBlobs([file.storageKey]);
    return { id: file.id };
  }
}
