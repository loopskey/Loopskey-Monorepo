import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { Logger, NotFoundException } from "@nestjs/common";
import { contentSocialImagePath } from "@loopskey/api-contracts/upload";
import { ContentSeoMessageCode } from "@loopskey/api-contracts/error-codes";
import { OBJECT_STORAGE } from "@infrastructure/storage/object-storage.port";
import { requestContext } from "@infrastructure/observability/request-context";
import { PrismaService } from "@prisma/prisma.service";
import { randomUUID } from "crypto";
import { extname } from "path";
import { Prisma } from "@prisma/client";

import { type ObjectStoragePort } from "@infrastructure/storage/object-storage.port";

import * as C from "@contentMedia/enums/content-social-image.constant";

const CONTENT_TYPE_BY_EXTENSION: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

const unreferenced = {
  courseSeo: { none: {} },
  eventSeo: { none: {} },
  podcastSeo: { none: {} },
  channelSeo: { none: {} },
  providerProfiles: { none: {} },
  providerRevisions: { none: {} },
} satisfies Prisma.ContentSocialImageWhereInput;

@Injectable()
export class ContentSocialImageService {
  private readonly logger = new Logger(ContentSocialImageService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(OBJECT_STORAGE)
    private readonly storage: ObjectStoragePort,
  ) {}

  async upload(ownerId: string, file?: Express.Multer.File) {
    if (!file?.buffer?.length) throw this.invalidType();

    if (file.size > C.MAX_SOCIAL_IMAGE_SIZE_BYTES)
      throw new BadRequestException({
        code: ContentSeoMessageCode.IMAGE_TOO_LARGE,
        message: `A social image is at most ${Math.round(C.MAX_SOCIAL_IMAGE_SIZE_BYTES / (1024 * 1024))} MB.`,
      });

    const extension = extname(file.originalname).toLowerCase();
    if (!C.isAcceptedSocialImageFile(file.mimetype, extension))
      throw this.invalidType();
    if (!C.hasSocialImageSignature(file.buffer, file.mimetype))
      throw this.invalidType();

    await this.makeRoomFor(ownerId);

    const storageKey = `${C.SOCIAL_IMAGE_KEY_PREFIX}${randomUUID()}${extension}`;
    await this.storage.store(
      C.SOCIAL_IMAGE_STORAGE_NAMESPACE,
      storageKey,
      file.buffer,
    );

    try {
      const image = await this.prisma.contentSocialImage.create({
        data: {
          ownerId,
          storageKey,
          mimeType: file.mimetype,
          sizeBytes: file.size,
        },
        select: { id: true },
      });
      this.logger.log("Social image uploaded", {
        ownerId,
        imageId: image.id,
        sizeBytes: file.size,
        mimeType: file.mimetype,
        correlationId: requestContext.correlationId(),
      });
      return { id: image.id, path: contentSocialImagePath(image.id) };
    } catch (error) {
      await this.storage.remove(C.SOCIAL_IMAGE_STORAGE_NAMESPACE, storageKey);
      throw error;
    }
  }

  async read(imageId: string) {
    if (!C.SOCIAL_IMAGE_ID_PATTERN.test(imageId)) throw this.notFound();
    const image = await this.prisma.contentSocialImage.findUnique({
      where: { id: imageId },
      select: { storageKey: true, mimeType: true },
    });
    if (!image) throw this.notFound();

    try {
      const data = await this.storage.read(
        C.SOCIAL_IMAGE_STORAGE_NAMESPACE,
        image.storageKey,
      );
      return {
        data,
        contentType:
          CONTENT_TYPE_BY_EXTENSION[extname(image.storageKey)] ??
          image.mimeType,
      };
    } catch {
      throw this.notFound();
    }
  }

  async isOwnedBy(imageId: string, ownerId: string) {
    const image = await this.prisma.contentSocialImage.findFirst({
      where: { id: imageId, ownerId },
      select: { id: true },
    });
    return Boolean(image);
  }

  async retire(imageId: string) {
    const image = await this.prisma.contentSocialImage.findUnique({
      where: { id: imageId },
      select: { id: true, storageKey: true },
    });
    if (!image) return false;

    try {
      await this.prisma.contentSocialImage.delete({ where: { id: image.id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === "P2003" || error.code === "P2025")
      )
        return false;
      throw error;
    }

    await this.storage.remove(
      C.SOCIAL_IMAGE_STORAGE_NAMESPACE,
      image.storageKey,
    );
    this.logger.log("Social image retired", {
      imageId: image.id,
      correlationId: requestContext.correlationId(),
    });
    return true;
  }

  async retireAll(
    imageIds: readonly (string | null | undefined)[],
  ): Promise<void> {
    for (const imageId of new Set(imageIds))
      if (imageId)
        await this.retire(imageId).catch((error: unknown) =>
          this.logger.warn("Social image retirement failed", {
            imageId,
            error: error instanceof Error ? error.name : "unknown",
            correlationId: requestContext.correlationId(),
          }),
        );
  }

  private async makeRoomFor(ownerId: string) {
    const pending = () =>
      this.prisma.contentSocialImage.count({
        where: { ownerId, ...unreferenced },
      });
    if ((await pending()) < C.MAX_UNREFERENCED_IMAGES_PER_OWNER) return;

    const expired = await this.prisma.contentSocialImage.findMany({
      where: {
        ownerId,
        ...unreferenced,
        createdAt: { lt: new Date(Date.now() - C.UNREFERENCED_IMAGE_TTL_MS) },
      },
      select: { id: true },
    });
    await this.retireAll(expired.map((image) => image.id));

    if ((await pending()) >= C.MAX_UNREFERENCED_IMAGES_PER_OWNER)
      throw new BadRequestException({
        code: ContentSeoMessageCode.IMAGE_QUOTA_REACHED,
        message: ContentSeoMessageCode.IMAGE_QUOTA_REACHED,
      });
  }

  private invalidType() {
    return new BadRequestException({
      code: ContentSeoMessageCode.IMAGE_INVALID_TYPE,
      message: `A social image is one of ${C.ACCEPTED_SOCIAL_IMAGE_EXTENSIONS.join(", ")}.`,
    });
  }

  private notFound() {
    return new NotFoundException({
      code: ContentSeoMessageCode.IMAGE_NOT_FOUND,
      message: ContentSeoMessageCode.IMAGE_NOT_FOUND,
    });
  }
}
