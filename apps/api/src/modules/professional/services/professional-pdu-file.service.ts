import { BadRequestException, NotFoundException } from "@nestjs/common";
import { ForbiddenException, Injectable } from "@nestjs/common";
import { extname, join, resolve, sep } from "path";
import { ProfessionalMessageCode } from "@professional/enums/message-code.enum";
import { ProfessionalPduService } from "@professional/services/professional-pdu.service";
import { PrismaService } from "@prisma/prisma.service";
import { randomUUID } from "crypto";
import { mkdirSync } from "fs";
import { writeFile } from "fs/promises";
import { TUser } from "@common/types/user.types";
import { Role } from "@prisma/client";

import * as C from "@professional/enums/pdu-file.constant";

@Injectable()
export class ProfessionalPduFileService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly professionalPduService: ProfessionalPduService,
  ) {}

  private assertProfessional(user: TUser) {
    if (user.role !== Role.PROFESSIONAL && user.role !== Role.ADMIN)
      throw new ForbiddenException(
        ProfessionalMessageCode.PROFESSIONAL_ACCESS_REQUIRED,
      );
  }

  private resolveStoragePath(storageKey: string) {
    const uploadDir = resolve(C.getPduUploadDir());
    const filePath = resolve(join(uploadDir, storageKey));
    if (filePath !== uploadDir && !filePath.startsWith(uploadDir + sep))
      throw new NotFoundException(
        ProfessionalMessageCode.PDU_ACTIVITY_FILE_NOT_FOUND,
      );
    return filePath;
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
    const uploadDir = C.getPduUploadDir();
    mkdirSync(uploadDir, { recursive: true });
    const created: { id: string }[] = [];
    for (const file of files) {
      const extension = extname(file.originalname).toLowerCase();
      if (!C.isAcceptedEvidenceFile(file.mimetype, extension))
        throw new BadRequestException(
          ProfessionalMessageCode.PDU_ACTIVITY_FILE_INVALID_TYPE,
        );
      const storageKey = `${randomUUID()}${extension}`;
      await writeFile(this.resolveStoragePath(storageKey), file.buffer);
      const row = await this.prismaService.pDUActivityFile.create({
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

  async getEvidenceForDownload(user: TUser, fileId: string) {
    this.assertProfessional(user);
    const file = await this.findOwnedFile(user, fileId);
    return { file, filePath: this.resolveStoragePath(file.storageKey) };
  }

  async deleteEvidence(user: TUser, fileId: string) {
    this.assertProfessional(user);
    const file = await this.findOwnedFile(user, fileId);
    await this.prismaService.pDUActivityFile.delete({ where: { id: file.id } });
    await this.professionalPduService.removeEvidenceBlobs([file.storageKey]);
    return { id: file.id };
  }
}
