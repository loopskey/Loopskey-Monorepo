import { AuditAction, ProviderProfileReviewState } from "@prisma/client";
import { ConflictException, Inject, Injectable } from "@nestjs/common";
import { ProviderPublicProfileMessageCode } from "@loopskey/api-contracts/error-codes";
import { Prisma, ProviderProfileStatus } from "@prisma/client";
import { Logger, NotFoundException } from "@nestjs/common";
import { CONTENT_SOCIAL_IMAGE_API } from "@contentMedia/public/content-social-image-api";
import { ProviderProfileDecision } from "@provider/enums/public-profile-gql-names.enum";
import { contentSocialImagePath } from "@loopskey/api-contracts/upload";
import { IDENTITY_PROFILE_API } from "@user/public/identity-profile-api";
import { isContentSlugClaimed } from "@utils/content-slug-claim.util";
import { normalizeContentSlug } from "@utils/content-slug.util";
import { ContentUrlNamespace } from "@prisma/client";
import { requestContext } from "@infrastructure/observability/request-context";
import { PrismaService } from "@prisma/prisma.service";
import { slugify } from "@utils/slug.util";
import {
  assertSubmittableProfile,
  invalidProviderProfileField,
  cleanDisplayName,
  cleanBiography,
  cleanReviewNote,
  cleanWebsiteUrl,
  cleanLinks,
  linksFromJson,
} from "@provider/utils/provider-public-profile.util";

import type { SetProviderPublicProfileIndexExclusionInput } from "@provider/dtos/provider-public-profile.input";
import type { ModerateProviderPublicProfileInput } from "@provider/dtos/provider-public-profile.input";
import type { ReviewProviderPublicProfileInput } from "@provider/dtos/provider-public-profile.input";
import type { SubmitProviderPublicProfileInput } from "@provider/dtos/provider-public-profile.input";
import type { SaveProviderPublicProfileInput } from "@provider/dtos/provider-public-profile.input";
import type { ContentSocialImageApi } from "@contentMedia/public/content-social-image-api";
import type { IdentityProfileApi } from "@user/public/identity-profile-api";

export type ProviderProfileActor = { id: string };

const ADMIN_LIST_LIMIT = 100;
const SLUG_ATTEMPTS = 5;
const FALLBACK_SLUG = "provider";

const notFound = () =>
  new NotFoundException({
    code: ProviderPublicProfileMessageCode.NOT_FOUND,
    message: ProviderPublicProfileMessageCode.NOT_FOUND,
  });

const versionConflict = () =>
  new ConflictException({
    code: ProviderPublicProfileMessageCode.VERSION_CONFLICT,
    message: ProviderPublicProfileMessageCode.VERSION_CONFLICT,
  });

const invalidState = () =>
  new ConflictException({
    code: ProviderPublicProfileMessageCode.INVALID_STATE,
    message: ProviderPublicProfileMessageCode.INVALID_STATE,
  });

const logoMissing = () =>
  new NotFoundException({
    code: ProviderPublicProfileMessageCode.LOGO_NOT_FOUND,
    message: ProviderPublicProfileMessageCode.LOGO_NOT_FOUND,
  });

const isUniqueViolation = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === "P2002";

type ProfileRow = Prisma.ProviderPublicProfileGetPayload<object>;

const present = (row: ProfileRow) => ({
  id: row.id,
  slug: row.slug,
  status: row.status,
  reviewState: row.reviewState,
  displayName: row.displayName,
  biography: row.biography,
  websiteUrl: row.websiteUrl,
  links: linksFromJson(row.links),
  logoImageId: row.logoImageId,
  logoPath: row.logoImageId ? contentSocialImagePath(row.logoImageId) : null,
  draftVersion: row.draftVersion,
  submittedAt: row.submittedAt,
  reviewedAt: row.reviewedAt,
  reviewNote: row.reviewNote,
  publishedAt: row.publishedAt,
  isLive: row.status === ProviderProfileStatus.PUBLISHED,
  hasUnpublishedChanges:
    row.status === ProviderProfileStatus.PUBLISHED &&
    row.reviewState !== ProviderProfileReviewState.APPROVED,
});

@Injectable()
export class ProviderPublicProfileService {
  private readonly logger = new Logger(ProviderPublicProfileService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(IDENTITY_PROFILE_API) private readonly identity: IdentityProfileApi,
    @Inject(CONTENT_SOCIAL_IMAGE_API)
    private readonly images: ContentSocialImageApi,
  ) {}

  async own(actor: ProviderProfileActor) {
    const row = await this.prisma.providerPublicProfile.findUnique({
      where: { providerId: actor.id },
    });
    return row ? present(row) : null;
  }

  async save(
    actor: ProviderProfileActor,
    input: SaveProviderPublicProfileInput,
  ) {
    const displayName = cleanDisplayName(input.displayName);
    const data = {
      displayName,
      biography: cleanBiography(input.biography),
      websiteUrl: cleanWebsiteUrl(input.websiteUrl),
      links: cleanLinks(input.links) as unknown as Prisma.InputJsonValue,
    };
    if (input.logoImageId)
      await this.assertLogoUsable(actor, input.logoImageId);

    const existing = await this.prisma.providerPublicProfile.findUnique({
      where: { providerId: actor.id },
    });
    if (!existing) {
      if (input.expectedVersion !== undefined) throw versionConflict();
      const created = await this.create(actor, displayName, {
        ...data,
        logoImageId: input.logoImageId ?? null,
      });
      return present(created);
    }

    if (input.expectedVersion === undefined) throw versionConflict();
    const { count } = await this.prisma.providerPublicProfile.updateMany({
      where: { id: existing.id, draftVersion: input.expectedVersion },
      data: {
        ...data,
        ...(input.logoImageId !== undefined
          ? { logoImageId: input.logoImageId }
          : {}),
        draftVersion: { increment: 1 },
        reviewState: ProviderProfileReviewState.DRAFT,
        submittedVersion: null,
        submittedAt: null,
      },
    });
    if (count !== 1) {
      this.warn("Provider profile edit lost a version race", actor.id);
      throw versionConflict();
    }
    if (
      input.logoImageId !== undefined &&
      existing.logoImageId &&
      existing.logoImageId !== input.logoImageId
    )
      await this.images.retireAll([existing.logoImageId]);
    return present(
      await this.prisma.providerPublicProfile.findUniqueOrThrow({
        where: { id: existing.id },
      }),
    );
  }

  async submit(
    actor: ProviderProfileActor,
    input: SubmitProviderPublicProfileInput,
  ) {
    const row = await this.prisma.providerPublicProfile.findUnique({
      where: { providerId: actor.id },
    });
    if (!row) throw notFound();
    assertSubmittableProfile({
      displayName: row.displayName,
      biography: row.biography,
      websiteUrl: row.websiteUrl,
      links: linksFromJson(row.links),
    });
    const now = new Date();
    const { count } = await this.prisma.$transaction(async (tx) => {
      const result = await tx.providerPublicProfile.updateMany({
        where: {
          id: row.id,
          draftVersion: input.expectedVersion,
          reviewState: {
            in: [
              ProviderProfileReviewState.DRAFT,
              ProviderProfileReviewState.REJECTED,
            ],
          },
        },
        data: {
          reviewState: ProviderProfileReviewState.SUBMITTED,
          submittedVersion: input.expectedVersion,
          submittedAt: now,
          reviewNote: null,
        },
      });
      if (result.count === 1)
        await this.audit(
          tx,
          actor.id,
          AuditAction.PROVIDER_PROFILE_SUBMITTED,
          row.id,
          {
            draftVersion: input.expectedVersion,
          },
        );
      return result;
    });
    if (count !== 1) {
      const current = await this.prisma.providerPublicProfile.findUniqueOrThrow(
        {
          where: { id: row.id },
        },
      );
      if (
        current.reviewState === ProviderProfileReviewState.SUBMITTED &&
        current.submittedVersion === input.expectedVersion
      )
        return present(current);
      throw current.draftVersion === input.expectedVersion
        ? invalidState()
        : versionConflict();
    }
    this.logger.log("Provider profile submitted", {
      profileId: row.id,
      correlationId: requestContext.correlationId(),
    });
    return present(
      await this.prisma.providerPublicProfile.findUniqueOrThrow({
        where: { id: row.id },
      }),
    );
  }

  async withdrawOwn(actor: ProviderProfileActor) {
    const row = await this.prisma.providerPublicProfile.findUnique({
      where: { providerId: actor.id },
    });
    if (!row) throw notFound();
    await this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const { count } = await tx.providerPublicProfile.updateMany({
        where: { id: row.id, status: ProviderProfileStatus.PUBLISHED },
        data: {
          status: ProviderProfileStatus.WITHDRAWN,
          withdrawnAt: now,
          publicContentUpdatedAt: now,
        },
      });
      if (count !== 1) throw invalidState();
      await tx.providerPublicProfile.updateMany({
        where: {
          id: row.id,
          reviewState: ProviderProfileReviewState.SUBMITTED,
        },
        data: {
          reviewState: ProviderProfileReviewState.DRAFT,
          submittedVersion: null,
          submittedAt: null,
        },
      });
      await this.audit(
        tx,
        actor.id,
        AuditAction.PROVIDER_PROFILE_WITHDRAWN,
        row.id,
        {
          by: "provider",
        },
      );
    });
    return present(
      await this.prisma.providerPublicProfile.findUniqueOrThrow({
        where: { id: row.id },
      }),
    );
  }

  async adminList(state?: ProviderProfileReviewState | null) {
    const rows = await this.prisma.providerPublicProfile.findMany({
      where: state ? { reviewState: state } : {},
      orderBy: [{ submittedAt: "asc" }, { updatedAt: "desc" }],
      take: ADMIN_LIST_LIMIT,
    });
    const people = await this.identity.recipients(
      rows.map((row) => row.providerId),
    );
    const names = new Map(people.map((person) => [person.id, person.fullName]));
    const queue = rows
      .map((row) => this.presentAdmin(row, names.get(row.providerId) ?? null))
      .sort(
        (left, right) =>
          Number(right.reviewState === ProviderProfileReviewState.SUBMITTED) -
          Number(left.reviewState === ProviderProfileReviewState.SUBMITTED),
      );
    return queue;
  }

  async review(
    actor: ProviderProfileActor,
    input: ReviewProviderPublicProfileInput,
  ) {
    const row = await this.prisma.providerPublicProfile.findUnique({
      where: { id: input.profileId },
    });
    if (!row) throw notFound();
    const note = cleanReviewNote(input.note);
    const approving = input.decision === ProviderProfileDecision.APPROVE;
    if (approving) {
      const eligible = await this.identity.activeProviderIds([row.providerId]);
      if (!eligible.has(row.providerId)) throw invalidState();
    }

    await this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const { count } = await tx.providerPublicProfile.updateMany({
        where: {
          id: row.id,
          reviewState: ProviderProfileReviewState.SUBMITTED,
          draftVersion: input.expectedDraftVersion,
          submittedVersion: input.expectedDraftVersion,
        },
        data: {
          reviewState: approving
            ? ProviderProfileReviewState.APPROVED
            : ProviderProfileReviewState.REJECTED,
          reviewedAt: now,
          reviewedById: actor.id,
          reviewNote: note,
        },
      });
      if (count !== 1) throw versionConflict();

      if (approving) {
        const locked = await tx.providerPublicProfile.findUniqueOrThrow({
          where: { id: row.id },
        });
        assertSubmittableProfile({
          displayName: locked.displayName,
          biography: locked.biography,
          websiteUrl: locked.websiteUrl,
          links: linksFromJson(locked.links),
        });
        const latest = await tx.providerPublicRevision.aggregate({
          where: { profileId: row.id },
          _max: { revision: true },
        });
        const revision = (latest._max.revision ?? 0) + 1;
        await tx.providerPublicRevision.create({
          data: {
            profileId: row.id,
            revision,
            displayName: locked.displayName!,
            biography: locked.biography!,
            websiteUrl: locked.websiteUrl,
            links: locked.links as Prisma.InputJsonValue,
            logoImageId: locked.logoImageId,
            approvedById: actor.id,
            approvedAt: now,
          },
        });
        await tx.providerPublicProfile.update({
          where: { id: row.id },
          data: {
            status: ProviderProfileStatus.PUBLISHED,
            publishedRevision: revision,
            publishedAt: locked.publishedAt ?? now,
            withdrawnAt: null,
            publicContentUpdatedAt: now,
          },
        });
      }
      await this.audit(
        tx,
        actor.id,
        AuditAction.PROVIDER_PROFILE_REVIEWED,
        row.id,
        {
          decision: input.decision,
        },
      );
    });
    this.logger.log("Provider profile reviewed", {
      profileId: row.id,
      decision: input.decision,
      actorId: actor.id,
      correlationId: requestContext.correlationId(),
    });
    return this.adminOne(row.id);
  }

  async withdrawAsAdmin(
    actor: ProviderProfileActor,
    input: ModerateProviderPublicProfileInput,
  ) {
    const note = cleanReviewNote(input.note);
    await this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const { count } = await tx.providerPublicProfile.updateMany({
        where: { id: input.profileId, status: ProviderProfileStatus.PUBLISHED },
        data: {
          status: ProviderProfileStatus.WITHDRAWN,
          withdrawnAt: now,
          publicContentUpdatedAt: now,
          reviewNote: note,
        },
      });
      if (count !== 1) {
        const exists = await tx.providerPublicProfile.count({
          where: { id: input.profileId },
        });
        throw exists ? invalidState() : notFound();
      }
      await this.audit(
        tx,
        actor.id,
        AuditAction.PROVIDER_PROFILE_WITHDRAWN,
        input.profileId,
        {
          by: "admin",
        },
      );
    });
    return this.adminOne(input.profileId);
  }

  async setIndexExclusion(
    actor: ProviderProfileActor,
    input: SetProviderPublicProfileIndexExclusionInput,
  ) {
    await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.providerPublicProfile.updateMany({
        where: { id: input.profileId, excludeFromIndex: !input.excluded },
        data: {
          excludeFromIndex: input.excluded,
          publicContentUpdatedAt: new Date(),
        },
      });
      if (count === 1)
        await this.audit(
          tx,
          actor.id,
          AuditAction.PROVIDER_PROFILE_INDEX_EXCLUSION_CHANGED,
          input.profileId,
          { excludeFromIndex: input.excluded },
        );
    });
    return this.adminOne(input.profileId);
  }

  private async adminOne(profileId: string) {
    const row = await this.prisma.providerPublicProfile.findUnique({
      where: { id: profileId },
    });
    if (!row) throw notFound();
    const [person] = await this.identity.recipients([row.providerId]);
    return this.presentAdmin(row, person?.fullName ?? null);
  }

  private presentAdmin(row: ProfileRow, providerName: string | null) {
    return {
      ...present(row),
      providerId: row.providerId,
      providerName,
      excludeFromIndex: row.excludeFromIndex,
      withdrawnAt: row.withdrawnAt,
    };
  }

  private async create(
    actor: ProviderProfileActor,
    displayName: string,
    data: {
      displayName: string;
      biography: string | null;
      websiteUrl: string | null;
      links: Prisma.InputJsonValue;
      logoImageId: string | null;
    },
  ) {
    for (let attempt = 0; attempt < SLUG_ATTEMPTS; attempt += 1) {
      const slug = await this.freeSlug(displayName, attempt);
      try {
        return await this.prisma.providerPublicProfile.create({
          data: { providerId: actor.id, slug, ...data },
        });
      } catch (error) {
        if (!isUniqueViolation(error)) throw error;
        const raced = await this.prisma.providerPublicProfile.findUnique({
          where: { providerId: actor.id },
        });
        if (raced) throw versionConflict();
      }
    }
    throw invalidProviderProfileField("displayName");
  }

  private async freeSlug(displayName: string, attempt: number) {
    const base = slugify(displayName) || FALLBACK_SLUG;
    for (let counter = attempt === 0 ? 0 : attempt + 1; ; counter += 1) {
      const candidate = counter === 0 ? base : `${base}-${counter}`;
      try {
        const slug = normalizeContentSlug(candidate);
        if (
          !(await isContentSlugClaimed(
            this.prisma,
            ContentUrlNamespace.PROVIDER,
            slug,
          ))
        )
          return slug;
      } catch (error) {
        if (counter > 50) throw error;
      }
    }
  }

  private async assertLogoUsable(actor: ProviderProfileActor, imageId: string) {
    if (!(await this.images.isOwnedBy(imageId, actor.id))) throw logoMissing();
  }

  private audit(
    tx: Prisma.TransactionClient,
    actorId: string,
    action: AuditAction,
    profileId: string,
    metadata: Prisma.InputJsonObject,
  ) {
    return tx.auditLog.create({
      data: {
        actorId,
        action,
        entityType: "ProviderPublicProfile",
        entityId: profileId,
        metadata,
      },
    });
  }

  private warn(message: string, providerId: string) {
    this.logger.warn(message, {
      providerId,
      correlationId: requestContext.correlationId(),
    });
  }
}
