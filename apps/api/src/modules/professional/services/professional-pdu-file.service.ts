import { BadRequestException, NotFoundException } from "@nestjs/common";
import { ForbiddenException, Injectable } from "@nestjs/common";
import { type EvidenceStoragePort } from "@professional/storage/evidence-storage.port";
import { ProfessionalMessageCode } from "@professional/enums/message-code.enum";
import { ProfessionalPduService } from "@professional/services/professional-pdu.service";
import { EVIDENCE_STORAGE } from "@professional/storage/evidence-storage.port";
import { PrismaService } from "@prisma/prisma.service";
import { randomUUID } from "crypto";
import { extname } from "path";
import { Inject } from "@nestjs/common";
import { TUser } from "@common/types/user.types";
import { Role } from "@prisma/client";

import * as C from "@professional/enums/pdu-file.constant";

@Injectable()
export class ProfessionalPduFileService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly professionalPduService: ProfessionalPduService,
    @Inject(EVIDENCE_STORAGE)
    private readonly storage: EvidenceStoragePort,
  ) {}

  private assertProfessional(user: TUser) {
    if (user.role !== Role.PROFESSIONAL && user.role !== Role.ADMIN)
      throw new ForbiddenException(
        ProfessionalMessageCode.PROFESSIONAL_ACCESS_REQUIRED,
      );
  }

  private async assertActivityOwned(user: TUser, activityId: string) {
    const activity = await this.prismaService.pDUActivity.findFirst({
      where: { id: activityId, userId: user.id },
      select: { id: true, _count: { select: { evidenceFiles: true } } },
    });
    if (!activity)
      throw new NotFoundException(
        ProfessionalMessageCode.PDU_ACTIVITY_NOT_FOUND,
      );
    return activity;
  }

  async uploadEvidence(
    user: TUser,
    activityId: string,
    files: Express.Multer.File[],
  ) {
    this.assertProfessional(user);
    if (!files?.length)
      throw new BadRequestException(
        ProfessionalMessageCode.PDU_ACTIVITY_FILE_INVALID_TYPE,
      );
    const activity = await this.assertActivityOwned(user, activityId);
    if (activity._count.evidenceFiles + files.length > C.MAX_EVIDENCE_FILES)
      throw new BadRequestException(
        ProfessionalMessageCode.PDU_ACTIVITY_FILE_LIMIT_EXCEEDED,
      );
    const created: { id: string }[] = [];
    for (const file of files) {
      const extension = extname(file.originalname).toLowerCase();
      if (!C.isAcceptedEvidenceFile(file.mimetype, extension))
        throw new BadRequestException(
          ProfessionalMessageCode.PDU_ACTIVITY_FILE_INVALID_TYPE,
        );
      const storageKey = `${randomUUID()}${extension}`;
      await this.storage.store("pdu", storageKey, file.buffer);
      let row: { id: string };
      try {
        row = await this.prismaService.pDUActivityFile.create({
          data: {
            activityId,
            userId: user.id,
            fileName: file.originalname,
            storageKey,
            mimeType: file.mimetype,
            sizeBytes: file.size,
          },
          select: { id: true },
        });
      } catch (error) {
        await this.storage.remove("pdu", storageKey);
        throw error;
      }
      created.push(row);
    }
    return { activityId, uploaded: created.length };
  }

  private async findOwnedFile(user: TUser, fileId: string) {
    const file = await this.prismaService.pDUActivityFile.findFirst({
      where: { id: fileId, userId: user.id },
    });
    if (!file)
      throw new NotFoundException(
        ProfessionalMessageCode.PDU_ACTIVITY_FILE_NOT_FOUND,
      );
    return file;
  }

  private resolveStoredFile(storageKey: string) {
    try {
      return this.storage.resolve("pdu", storageKey);
    } catch {
      throw new NotFoundException(
        ProfessionalMessageCode.PDU_ACTIVITY_FILE_NOT_FOUND,
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
    await this.prismaService.pDUActivityFile.delete({ where: { id: file.id } });
    await this.professionalPduService.removeEvidenceBlobs([file.storageKey]);
    return { id: file.id };
  }
}
