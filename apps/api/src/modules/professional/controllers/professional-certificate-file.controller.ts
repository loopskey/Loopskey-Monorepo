import { BadRequestException, Controller, Delete, Get } from "@nestjs/common";
import { ProfessionalCertificateFileService } from "@professional/services/professional-certificate-file.service";
import { Param, Post, Res, UseInterceptors } from "@nestjs/common";
import { StreamableFile, UploadedFiles } from "@nestjs/common";
import { ProfessionalMessageCode } from "@professional/enums/message-code.enum";
import { FilesInterceptor } from "@nestjs/platform-express";
import { createReadStream } from "fs";
import { TResolverUser } from "@professional/types/professional-service.types";
import { CurrentUser } from "@auth/decorators/current-user.decorator";
import { Response } from "express";
import { extname } from "path";
import { Roles } from "@auth/decorators/roles.decorator";
import { Role } from "@prisma/client";

import * as C from "@professional/enums/certificate-file.constant";

import "multer";

@Controller("professional/certificates")
@Roles(Role.PROFESSIONAL, Role.ADMIN)
export class ProfessionalCertificateFileController {
  constructor(
    private readonly certificateFileService: ProfessionalCertificateFileService,
  ) {}

  private getUser(user: TResolverUser) {
    return { id: user.id ?? user.sub!, role: user.role };
  }

  @Post(":certificateId/files")
  @UseInterceptors(
    FilesInterceptor(C.CERTIFICATE_UPLOAD_FIELD, C.MAX_CERTIFICATE_FILES, {
      limits: {
        fileSize: C.MAX_CERTIFICATE_FILE_SIZE_BYTES,
        files: C.MAX_CERTIFICATE_FILES,
      },
      fileFilter: (_request, file, callback) => {
        const extension = extname(file.originalname).toLowerCase();
        if (!C.isAcceptedCertificateFile(file.mimetype, extension))
          return callback(
            new BadRequestException(
              ProfessionalMessageCode.CERTIFICATE_FILE_INVALID_TYPE,
            ),
            false,
          );
        callback(null, true);
      },
    }),
  )
  uploadEvidence(
    @CurrentUser() user: TResolverUser,
    @Param("certificateId") certificateId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.certificateFileService.uploadEvidence(
      this.getUser(user),
      certificateId,
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
      await this.certificateFileService.getEvidenceForDownload(
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
    return this.certificateFileService.deleteEvidence(
      this.getUser(user),
      fileId,
    );
  }
}
