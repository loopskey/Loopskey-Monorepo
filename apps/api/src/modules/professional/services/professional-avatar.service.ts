import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { type ProfessionalIdentityApi } from "@user/public/professional-identity-api";
import { PROFESSIONAL_IDENTITY_API } from "@user/public/professional-identity-api";
import { type EvidenceStoragePort } from "@professional/storage/evidence-storage.port";
import { ProfessionalMessageCode } from "@professional/enums/message-code.enum";
import { EVIDENCE_STORAGE } from "@professional/storage/evidence-storage.port";
import { randomUUID } from "crypto";
import { extname } from "path";
import { TUser } from "@common/types/user.types";
import { Role } from "@prisma/client";

import * as C from "@professional/enums/profile-avatar.constant";

@Injectable()
export class ProfessionalAvatarService {
  private readonly logger = new Logger(ProfessionalAvatarService.name);

  constructor(
    @Inject(PROFESSIONAL_IDENTITY_API)
    private readonly identity: ProfessionalIdentityApi,
    @Inject(EVIDENCE_STORAGE)
    private readonly storage: EvidenceStoragePort,
  ) {}

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
    return this.storage.resolve("avatar", storageKey);
  }

  private async removeStoredFile(storageKey: string | null) {
    if (!storageKey) return;
    if (!C.AVATAR_STORAGE_KEY_PATTERN.test(storageKey)) return;
    try {
      await this.storage.remove("avatar", storageKey);
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
    const current = await this.identity.avatar(user.id);
    if (!current)
      throw new NotFoundException(ProfessionalMessageCode.USER_NOT_FOUND);
    const storageKey = `${randomUUID()}${extension}`;
    await this.storage.store("avatar", storageKey, file.buffer);
    let updated: { id: string; avatarUrl: string | null };
    try {
      updated = await this.identity.setAvatar(user.id, {
        avatarStorageKey: storageKey,
        avatarUrl: C.buildAvatarUrl(storageKey),
      });
    } catch (error) {
      await this.storage.remove("avatar", storageKey);
      throw error;
    }
    await this.removeStoredFile(current.avatarStorageKey);
    return updated;
  }

  async deleteAvatar(user: TUser) {
    this.assertProfessional(user);
    const current = await this.identity.avatar(user.id);
    if (!current)
      throw new NotFoundException(ProfessionalMessageCode.USER_NOT_FOUND);
    const updated = await this.identity.setAvatar(user.id, {
      avatarStorageKey: null,
      avatarUrl: null,
    });
    await this.removeStoredFile(current.avatarStorageKey);
    return updated;
  }

  async getAvatarPath(storageKey: string) {
    const filePath = this.resolveStoragePath(storageKey);
    const owner = await this.identity.avatarOwner(storageKey);
    if (!owner)
      throw new NotFoundException(
        ProfessionalMessageCode.AVATAR_FILE_NOT_FOUND,
      );
    if (!(await this.storage.exists("avatar", storageKey))) {
      throw new NotFoundException(
        ProfessionalMessageCode.AVATAR_FILE_NOT_FOUND,
      );
    }
    return filePath;
  }
}
