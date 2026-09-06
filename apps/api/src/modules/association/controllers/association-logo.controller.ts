import { BadRequestException, Controller, Delete } from "@nestjs/common";
import { Get, Param, Post, Res, UseFilters } from "@nestjs/common";
import { AssociationUploadErrorFilter } from "@association/controllers/association-upload-error.filter";
import { StreamableFile, UploadedFile } from "@nestjs/common";
import { ASSOCIATION_LOGO_ROUTE } from "@loopskey/api-contracts/upload";
import { AssociationLogoService } from "@association/services/association-logo.service";
import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { createReadStream } from "fs";
import { UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { TResolverUser } from "@association/types/association-service.types";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { Response } from "express";
import { extname } from "path";
import { Public } from "@common/decorators/public.decorator";
import { Roles } from "@common/decorators/roles.decorator";
import { Role } from "@prisma/client";

import * as C from "@association/enums/association-logo.constant";

import "multer";

@Controller(ASSOCIATION_LOGO_ROUTE)
export class AssociationLogoController {
  constructor(private readonly logos: AssociationLogoService) {}

  private getUser(user: TResolverUser) {
    return { id: user.id ?? user.sub!, role: user.role };
  }

  @Post()
  @Roles(Role.ASSOCIATION)
  @UseFilters(AssociationUploadErrorFilter)
  @UseInterceptors(
    FileInterceptor(C.LOGO_UPLOAD_FIELD, {
      limits: { fileSize: C.MAX_LOGO_SIZE_BYTES, files: 1 },
      fileFilter: (_request, file, callback) => {
        const extension = extname(file.originalname).toLowerCase();
        if (!C.isAcceptedLogoFile(file.mimetype, extension))
          return callback(
            new BadRequestException({
              code: AssociationMessageCode.LOGO_INVALID_TYPE,
              message: `A logo is one of ${C.ACCEPTED_LOGO_EXTENSIONS.join(", ")}.`,
            }),
            false,
          );
        callback(null, true);
      },
    }),
  )
  upload(
    @CurrentUser() user: TResolverUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.logos.upload(this.getUser(user), file);
  }

  @Delete()
  @Roles(Role.ASSOCIATION)
  remove(@CurrentUser() user: TResolverUser) {
    return this.logos.remove(this.getUser(user));
  }

  @Get(":storageKey")
  @Public()
  async serve(
    @Param("storageKey") storageKey: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const filePath = await this.logos.storedPath(storageKey);

    response.set({
      "Content-Type": `image/${extname(storageKey).slice(1).replace("jpg", "jpeg")}`,
      "Cache-Control": "public, max-age=300",
    });

    return new StreamableFile(createReadStream(filePath));
  }
}
