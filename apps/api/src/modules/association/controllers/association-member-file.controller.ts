import { ASSOCIATION_MEMBER_FILES_ROUTE } from "@loopskey/api-contracts/upload";
import { AssociationMemberFileService } from "@association/services/association-member-file.service";
import { Controller, Get, Param, Res } from "@nestjs/common";
import { ComplianceStoredFile } from "@professional/public/professional-compliance-api";
import { createReadStream } from "fs";
import { StreamableFile } from "@nestjs/common";
import { TResolverUser } from "@association/types/association-service.types";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { Response } from "express";
import { Roles } from "@common/decorators/roles.decorator";
import { Role } from "@prisma/client";

@Controller(ASSOCIATION_MEMBER_FILES_ROUTE)
@Roles(Role.ASSOCIATION)
export class AssociationMemberFileController {
  constructor(private readonly files: AssociationMemberFileService) {}

  private getUser(user: TResolverUser) {
    return { id: user.id ?? user.sub!, role: user.role };
  }

  @Get(":memberId/evidence/:fileId")
  async downloadEvidence(
    @CurrentUser() user: TResolverUser,
    @Param("memberId") memberId: string,
    @Param("fileId") fileId: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.stream(
      await this.files.evidenceFile(this.getUser(user), memberId, fileId),
      response,
    );
  }

  @Get(":memberId/certificate/:fileId")
  async downloadCertificate(
    @CurrentUser() user: TResolverUser,
    @Param("memberId") memberId: string,
    @Param("fileId") fileId: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.stream(
      await this.files.certificateFile(this.getUser(user), memberId, fileId),
      response,
    );
  }

  private stream({ file, filePath }: ComplianceStoredFile, response: Response) {
    response.set({
      "Content-Type": file.mimeType,
      "Cache-Control": "no-store, private",
      "Content-Length": String(file.sizeBytes),
      "Content-Disposition": `attachment; filename="${encodeURIComponent(file.fileName)}"`,
    });

    return new StreamableFile(createReadStream(filePath));
  }
}
