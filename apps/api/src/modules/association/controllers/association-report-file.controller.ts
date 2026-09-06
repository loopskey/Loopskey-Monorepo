import { ASSOCIATION_REPORT_FILES_ROUTE } from "@loopskey/api-contracts/upload";
import { AssociationReportExportService } from "@association/services/association-report-export.service";
import { Controller, Get, Param, Res, StreamableFile } from "@nestjs/common";
import { TResolverUser } from "@association/types/association-service.types";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { createReadStream } from "fs";
import { Response } from "express";
import { Roles } from "@common/decorators/roles.decorator";
import { Role } from "@prisma/client";

@Controller(ASSOCIATION_REPORT_FILES_ROUTE)
@Roles(Role.ASSOCIATION)
export class AssociationReportFileController {
  constructor(private readonly exports: AssociationReportExportService) {}

  @Get(":exportId/download")
  async download(
    @CurrentUser() user: TResolverUser,
    @Param("exportId") exportId: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const file = await this.exports.downloadable(
      { id: user.id ?? user.sub!, role: user.role },
      exportId,
    );

    response.set({
      "Content-Type": file.mimeType,
      "Cache-Control": "no-store, private",
      "Content-Length": String(file.sizeBytes),
      "Content-Disposition": `attachment; filename="${encodeURIComponent(file.fileName)}"`,
    });

    return new StreamableFile(createReadStream(file.filePath));
  }
}
