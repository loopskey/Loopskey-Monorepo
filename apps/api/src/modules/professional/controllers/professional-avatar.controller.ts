import { BadRequestException, Controller, Delete, Get } from "@nestjs/common";
import { Param, Post, Res, UseInterceptors } from "@nestjs/common";
import { StreamableFile, UploadedFile } from "@nestjs/common";
import { ProfessionalAvatarService } from "@professional/services/professional-avatar.service";
import { ProfessionalMessageCode } from "@professional/enums/message-code.enum";
import { createReadStream } from "fs";
import { FileInterceptor } from "@nestjs/platform-express";
import { TResolverUser } from "@professional/types/professional-service.types";
import { CurrentUser } from "@auth/decorators/current-user.decorator";
import { Response } from "express";
import { extname } from "path";
import { Public } from "@auth/decorators/public.decorator";
import { Roles } from "@auth/decorators/roles.decorator";
import { Role } from "@prisma/client";

import * as C from "@professional/enums/profile-avatar.constant";

import "multer";

@Controller(C.AVATAR_ROUTE_PREFIX)
export class ProfessionalAvatarController {
  constructor(
    private readonly professionalAvatarService: ProfessionalAvatarService,
  ) {}

  private getUser(user: TResolverUser) {
    return { id: user.id ?? user.sub!, role: user.role };
  }

  @Post()
  @Roles(Role.PROFESSIONAL, Role.ADMIN)
  @UseInterceptors(
    FileInterceptor(C.AVATAR_UPLOAD_FIELD, {
      limits: { fileSize: C.MAX_AVATAR_SIZE_BYTES, files: 1 },
      fileFilter: (_request, file, callback) => {
        const extension = extname(file.originalname).toLowerCase();
        if (!C.isAcceptedAvatarFile(file.mimetype, extension))
          return callback(
            new BadRequestException(
              ProfessionalMessageCode.AVATAR_FILE_INVALID_TYPE,
            ),
            false,
          );
        callback(null, true);
      },
    }),
  )
  uploadAvatar(
    @CurrentUser() user: TResolverUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.professionalAvatarService.uploadAvatar(
      this.getUser(user),
      file,
    );
  }

  @Delete()
  @Roles(Role.PROFESSIONAL, Role.ADMIN)
  deleteAvatar(@CurrentUser() user: TResolverUser) {
    return this.professionalAvatarService.deleteAvatar(this.getUser(user));
  }

  // Public by necessity: <img> requests cannot send the cross-site auth cookie.
  // Access is gated by the unguessable random storage key instead.
  @Get(":storageKey")
  @Public()
  async serveAvatar(
    @Param("storageKey") storageKey: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const filePath =
      await this.professionalAvatarService.getAvatarPath(storageKey);
    response.set({
      "Content-Type": `image/${extname(storageKey).slice(1).replace("jpg", "jpeg")}`,
      "Cache-Control": "private, max-age=300",
    });
    return new StreamableFile(createReadStream(filePath));
  }
}
