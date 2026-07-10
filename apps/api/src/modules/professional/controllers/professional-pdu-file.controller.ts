import { BadRequestException, Controller, Delete, Get } from "@nestjs/common";
import { Param, Post, Res, UseInterceptors } from "@nestjs/common";
import { StreamableFile, UploadedFiles } from "@nestjs/common";
import { ProfessionalPduFileService } from "@professional/services/professional-pdu-file.service";
import { ProfessionalMessageCode } from "@professional/enums/message-code.enum";
import { FilesInterceptor } from "@nestjs/platform-express";
import { createReadStream } from "fs";
import { TResolverUser } from "@professional/types/professional-service.types";
import { CurrentUser } from "@auth/decorators/current-user.decorator";
import { Response } from "express";
import { extname } from "path";
import { Roles } from "@auth/decorators/roles.decorator";
import { Role } from "@prisma/client";

import * as C from "@professional/enums/pdu-file.constant";

import "multer";

@Controller("professional/pdu-activities")
@Roles(Role.PROFESSIONAL, Role.ADMIN)
export class ProfessionalPduFileController {
  constructor(
    private readonly professionalPduFileService: ProfessionalPduFileService,
  ) {}

  private getUser(user: TResolverUser) {
    return { id: user.id ?? user.sub!, role: user.role };
  }

  @Post(":activityId/files")
  @UseInterceptors(
    FilesInterceptor(C.EVIDENCE_UPLOAD_FIELD, C.MAX_EVIDENCE_FILES, {
      limits: {
        fileSize: C.MAX_EVIDENCE_SIZE_BYTES,
        files: C.MAX_EVIDENCE_FILES,
      },
      fileFilter: (_request, file, callback) => {
        const extension = extname(file.originalname).toLowerCase();
        if (!C.isAcceptedEvidenceFile(file.mimetype, extension))
          return callback(
            new BadRequestException(
              ProfessionalMessageCode.PDU_ACTIVITY_FILE_INVALID_TYPE,
            ),
            false,
          );
        callback(null, true);
      },
    }),
  )
  uploadEvidence(
    @CurrentUser() user: TResolverUser,
    @Param("activityId") activityId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.professionalPduFileService.uploadEvidence(
      this.getUser(user),
      activityId,
      files,
    );
  }

  @Get("files/:fileId")
  async downloadEvidence(
    @CurrentUser() user: TResolverUser,
    @Param("fileId") fileId: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { file, filePath } =
      await this.professionalPduFileService.getEvidenceForDownload(
        this.getUser(user),
        fileId,
      );

    response.set({
      "Content-Type": file.mimeType,
      "Content-Length": String(file.sizeBytes),
      "Content-Disposition": `attachment; filename="${encodeURIComponent(file.fileName)}"`,
    });
    return new StreamableFile(createReadStream(filePath));
  }

  @Delete("files/:fileId")
  deleteEvidence(
    @CurrentUser() user: TResolverUser,
    @Param("fileId") fileId: string,
  ) {
    return this.professionalPduFileService.deleteEvidence(
      this.getUser(user),
      fileId,
    );
  }
}
