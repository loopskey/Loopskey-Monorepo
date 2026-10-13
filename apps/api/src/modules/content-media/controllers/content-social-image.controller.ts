import { BadRequestException, Controller, Get, Param } from "@nestjs/common";
import { Post, Res, StreamableFile, UploadedFile } from "@nestjs/common";
import { ContentSocialImageErrorFilter } from "@contentMedia/controllers/content-social-image-error.filter";
import { UseFilters, UseInterceptors } from "@nestjs/common";
import { CONTENT_SOCIAL_IMAGE_ROUTE } from "@loopskey/api-contracts/upload";
import { ContentSocialImageService } from "@contentMedia/services/content-social-image.service";
import { ContentSeoMessageCode } from "@loopskey/api-contracts/error-codes";
import { FileInterceptor } from "@nestjs/platform-express";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { Response } from "express";
import { extname } from "path";
import { Public } from "@common/decorators/public.decorator";
import { Roles } from "@common/decorators/roles.decorator";
import { Role } from "@prisma/client";

import * as C from "@contentMedia/enums/content-social-image.constant";

import "multer";

type TUploader = { id?: string; sub?: string };

@Controller(CONTENT_SOCIAL_IMAGE_ROUTE)
export class ContentSocialImageController {
  constructor(private readonly images: ContentSocialImageService) {}

  @Post()
  @Roles(Role.PROVIDER, Role.ADMIN)
  @UseFilters(ContentSocialImageErrorFilter)
  @UseInterceptors(
    FileInterceptor(C.SOCIAL_IMAGE_UPLOAD_FIELD, {
      limits: { fileSize: C.MAX_SOCIAL_IMAGE_SIZE_BYTES, files: 1 },
      fileFilter: (_request, file, callback) => {
        const extension = extname(file.originalname).toLowerCase();
        if (!C.isAcceptedSocialImageFile(file.mimetype, extension))
          return callback(
            new BadRequestException({
              code: ContentSeoMessageCode.IMAGE_INVALID_TYPE,
              message: `A social image is one of ${C.ACCEPTED_SOCIAL_IMAGE_EXTENSIONS.join(", ")}.`,
            }),
            false,
          );
        callback(null, true);
      },
    }),
  )
  upload(
    @CurrentUser() user: TUploader,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.images.upload(user.id ?? user.sub!, file);
  }

  @Get(":imageId")
  @Public()
  async serve(
    @Param("imageId") imageId: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { data, contentType } = await this.images.read(imageId);

    response.set({
      "Content-Type": contentType,
      "Content-Length": String(data.length),
      "Cache-Control": "public, max-age=300",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
    });

    return new StreamableFile(data);
  }
}
