import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { extname, join, resolve, sep } from "path";
import { ProfessionalMessageCode } from "@professional/enums/message-code.enum";
import { PrismaService } from "@prisma/prisma.service";
import { access, rm, writeFile } from "fs/promises";
import { randomUUID } from "crypto";
import { mkdirSync } from "fs";
import { TUser } from "@common/types/user.types";
import { Role } from "@prisma/client";

import * as C from "@professional/enums/profile-avatar.constant";

@Injectable()
export class ProfessionalAvatarService {
  private readonly logger = new Logger(ProfessionalAvatarService.name);

  constructor(private readonly prismaService: PrismaService) {}

  private assertProfessional(user: TUser) {
    if (user.role !== Role.PROFESSIONAL && user.role !== Role.ADMIN)
      throw new ForbiddenException(
        ProfessionalMessageCode.PROFESSIONAL_ACCESS_REQUIRED,
      );
  }

  private resolveStoragePath(storageKey: string) {
    if (!C.AVATAR_STORAGE_KEY_PATTERN.test(storageKey))
      throw new NotFoundException(
        ProfessionalMessageCode.AVATAR_FILE_NOT_FOUND,
      );
    const uploadDir = resolve(C.getAvatarUploadDir());
    const filePath = resolve(join(uploadDir, storageKey));
    if (!filePath.startsWith(uploadDir + sep))
      throw new NotFoundException(
        ProfessionalMessageCode.AVATAR_FILE_NOT_FOUND,
      );
    return filePath;
  }

  /**
   * Best effort by design: this only ever runs once the new avatar is already
   * committed, so a cleanup failure (a Windows EBUSY/EPERM from a concurrent
   * read of the old file, a permission change) must not fail an upload the user
   * has effectively completed. Worst case we leak one orphaned file.
   */
  private async removeStoredFile(storageKey: string | null) {
    if (!storageKey) return;
    if (!C.AVATAR_STORAGE_KEY_PATTERN.test(storageKey)) return;
    try {
      await rm(this.resolveStoragePath(storageKey), { force: true });
    } catch (error) {
      this.logger.warn(
        `Failed to remove previous avatar "${storageKey}": ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async uploadAvatar(user: TUser, file?: Express.Multer.File) {
    this.assertProfessional(user);
    if (!file)
      throw new BadRequestException(
        ProfessionalMessageCode.AVATAR_FILE_REQUIRED,
      );
    const extension = extname(file.originalname).toLowerCase();
    if (!C.isAcceptedAvatarFile(file.mimetype, extension))
      throw new BadRequestException(
        ProfessionalMessageCode.AVATAR_FILE_INVALID_TYPE,
      );
    if (file.size > C.MAX_AVATAR_SIZE_BYTES)
      throw new BadRequestException(
        ProfessionalMessageCode.AVATAR_FILE_TOO_LARGE,
      );
    const current = await this.prismaService.user.findUnique({
      where: { id: user.id },
      select: { avatarStorageKey: true },
    });
    if (!current)
      throw new NotFoundException(ProfessionalMessageCode.USER_NOT_FOUND);
    const storageKey = `${randomUUID()}${extension}`;
    mkdirSync(C.getAvatarUploadDir(), { recursive: true });
    await writeFile(this.resolveStoragePath(storageKey), file.buffer);
    const updated = await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        avatarStorageKey: storageKey,
        avatarUrl: C.buildAvatarUrl(storageKey),
      },
      select: { id: true, avatarUrl: true },
    });
    await this.removeStoredFile(current.avatarStorageKey);
    return updated;
  }

  async deleteAvatar(user: TUser) {
    this.assertProfessional(user);
    const current = await this.prismaService.user.findUnique({
      where: { id: user.id },
      select: { avatarStorageKey: true },
    });
    if (!current)
      throw new NotFoundException(ProfessionalMessageCode.USER_NOT_FOUND);
    const updated = await this.prismaService.user.update({
      where: { id: user.id },
      data: { avatarStorageKey: null, avatarUrl: null },
      select: { id: true, avatarUrl: true },
    });
    await this.removeStoredFile(current.avatarStorageKey);
    return updated;
  }

  async getAvatarPath(storageKey: string) {
    const filePath = this.resolveStoragePath(storageKey);
    const owner = await this.prismaService.user.findFirst({
      where: { avatarStorageKey: storageKey },
      select: { id: true },
    });
    if (!owner)
      throw new NotFoundException(
        ProfessionalMessageCode.AVATAR_FILE_NOT_FOUND,
      );
    // The row is not proof the file survived: storage can drift from the
    // database. Without this the response streams a file that is not there and
    // fails after the headers are sent, which reaches the browser as a broken
    // image rather than a 404.
    try {
      await access(filePath);
    } catch {
      throw new NotFoundException(
        ProfessionalMessageCode.AVATAR_FILE_NOT_FOUND,
      );
    }
    return filePath;
  }
}
