import { Inject, Injectable, Logger } from "@nestjs/common";
import { AssociationAccessService } from "@association/services/association-access.service";
import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { type ObjectStoragePort } from "@infrastructure/storage/object-storage.port";
import { BadRequestException } from "@nestjs/common";
import { associationLogoPath } from "@loopskey/api-contracts/upload";
import { projectAssociation } from "@association/application/association.projection";
import { ASSOCIATION_SELECT } from "@association/types/association-service.types";
import { NotFoundException } from "@nestjs/common";
import { TAssociationUser } from "@association/types/association-service.types";
import { OBJECT_STORAGE } from "@infrastructure/storage/object-storage.port";
import { PrismaService } from "@prisma/prisma.service";
import { AuditAction } from "@prisma/client";
import { randomUUID } from "crypto";
import { extname } from "path";

import * as C from "@association/enums/association-logo.constant";

@Injectable()
export class AssociationLogoService {
  private readonly logger = new Logger(AssociationLogoService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly access: AssociationAccessService,
    @Inject(OBJECT_STORAGE)
    private readonly storage: ObjectStoragePort,
  ) {}

  async upload(user: TAssociationUser, file?: Express.Multer.File) {
    if (!file?.buffer?.length)
      throw new BadRequestException({
        code: AssociationMessageCode.LOGO_INVALID_TYPE,
        message: "Attach an image to use as the logo.",
      });

    if (file.size > C.MAX_LOGO_SIZE_BYTES)
      throw new BadRequestException({
        code: AssociationMessageCode.LOGO_TOO_LARGE,
        message: `A logo is at most ${Math.round(C.MAX_LOGO_SIZE_BYTES / (1024 * 1024))} MB.`,
      });

    const extension = extname(file.originalname).toLowerCase();

    if (!C.isAcceptedLogoFile(file.mimetype, extension))
      throw new BadRequestException({
        code: AssociationMessageCode.LOGO_INVALID_TYPE,
        message: `A logo is one of ${C.ACCEPTED_LOGO_EXTENSIONS.join(", ")}.`,
      });

    if (!C.hasImageSignature(file.buffer, file.mimetype))
      throw new BadRequestException({
        code: AssociationMessageCode.LOGO_INVALID_TYPE,
        message: "That file is not the image its name claims it is.",
      });

    const association = await this.access.requireOwned(user);

    const previous = await this.prisma.association.findUniqueOrThrow({
      where: { id: association.id },
      select: { logoStorageKey: true },
    });

    const storageKey = `${randomUUID()}${extension}`;

    await this.storage.store(C.LOGO_STORAGE_NAMESPACE, storageKey, file.buffer);

    let updated;

    try {
      updated = await this.prisma.association.update({
        where: { id: association.id },
        data: {
          logoStorageKey: storageKey,
          logoUrl: associationLogoPath(storageKey),
        },
        select: ASSOCIATION_SELECT,
      });
    } catch (error) {
      await this.storage.remove(C.LOGO_STORAGE_NAMESPACE, storageKey);
      throw error;
    }

    if (previous.logoStorageKey && previous.logoStorageKey !== storageKey)
      await this.storage.remove(
        C.LOGO_STORAGE_NAMESPACE,
        previous.logoStorageKey,
      );

    await this.prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: AuditAction.ASSOCIATION_SETTINGS_UPDATED,
        entityType: "Association",
        entityId: association.id,
        metadata: {
          associationId: association.id,
          section: "logo",
          sizeBytes: file.size,
          mimeType: file.mimetype,
        },
      },
    });

    this.logger.log("Association logo replaced", {
      associationId: association.id,
      sizeBytes: file.size,
      mimeType: file.mimetype,
    });

    return projectAssociation(updated);
  }

  async remove(user: TAssociationUser) {
    const association = await this.access.requireOwned(user);

    const previous = await this.prisma.association.findUniqueOrThrow({
      where: { id: association.id },
      select: { logoStorageKey: true },
    });

    const updated = await this.prisma.association.update({
      where: { id: association.id },
      data: { logoStorageKey: null, logoUrl: null },
      select: ASSOCIATION_SELECT,
    });

    if (previous.logoStorageKey)
      await this.storage.remove(
        C.LOGO_STORAGE_NAMESPACE,
        previous.logoStorageKey,
      );

    await this.prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: AuditAction.ASSOCIATION_SETTINGS_UPDATED,
        entityType: "Association",
        entityId: association.id,
        metadata: {
          associationId: association.id,
          section: "logo",
          removed: true,
        },
      },
    });

    return projectAssociation(updated);
  }

  async storedPath(storageKey: string) {
    if (!C.LOGO_STORAGE_KEY_PATTERN.test(storageKey))
      throw new NotFoundException({
        code: AssociationMessageCode.LOGO_NOT_FOUND,
        message: "No logo there.",
      });

    const association = await this.prisma.association.findFirst({
      where: { logoStorageKey: storageKey, deletedAt: null },
      select: { id: true },
    });

    if (!association)
      throw new NotFoundException({
        code: AssociationMessageCode.LOGO_NOT_FOUND,
        message: "No logo there.",
      });

    if (!(await this.storage.exists(C.LOGO_STORAGE_NAMESPACE, storageKey)))
      throw new NotFoundException({
        code: AssociationMessageCode.LOGO_NOT_FOUND,
        message: "No logo there.",
      });

    return this.storage.resolve(C.LOGO_STORAGE_NAMESPACE, storageKey);
  }

  async storedPathFor(associationId: string) {
    const association = await this.prisma.association.findFirst({
      where: { id: associationId, deletedAt: null },
      select: { logoStorageKey: true },
    });

    const storageKey = association?.logoStorageKey;
    if (!storageKey) return null;

    if (!(await this.storage.exists(C.LOGO_STORAGE_NAMESPACE, storageKey)))
      return null;

    return this.storage.resolve(C.LOGO_STORAGE_NAMESPACE, storageKey);
  }
}
