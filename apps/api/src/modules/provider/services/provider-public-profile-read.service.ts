import { ContentUrlNamespace, ProviderProfileStatus } from "@prisma/client";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ProviderPublicProfileMessageCode } from "@loopskey/api-contracts/error-codes";
import { contentSocialImagePath } from "@loopskey/api-contracts/upload";
import { IDENTITY_PROFILE_API } from "@user/public/identity-profile-api";
import { CONTENT_PUBLIC_API } from "@contentUrl/public/content-public-api";
import { PrismaService } from "@prisma/prisma.service";
import { linksFromJson } from "@provider/utils/provider-public-profile.util";

import type { IdentityProfileApi } from "@user/public/identity-profile-api";
import type { PublicContentKind } from "@contentUrl/public/content-public-api";
import type { ContentPublicApi } from "@contentUrl/public/content-public-api";

const PUBLIC_ITEMS_LIMIT = 12;

const notFound = () =>
  new NotFoundException({
    code: ProviderPublicProfileMessageCode.NOT_FOUND,
    message: ProviderPublicProfileMessageCode.NOT_FOUND,
  });

const livePublication = {
  status: ProviderProfileStatus.PUBLISHED,
  deletedAt: null,
  publishedRevision: { not: null },
} as const;

@Injectable()
export class ProviderPublicProfileReadService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(IDENTITY_PROFILE_API) private readonly identity: IdentityProfileApi,
    @Inject(CONTENT_PUBLIC_API) private readonly content: ContentPublicApi,
  ) {}

  async bySlug(slug: string) {
    const profile = await this.prisma.providerPublicProfile.findFirst({
      where: { slug, ...livePublication },
    });
    if (!profile || profile.publishedRevision === null || !profile.publishedAt)
      throw notFound();

    const [eligible, revision, items] = await Promise.all([
      this.identity.activeProviderIds([profile.providerId]),
      this.prisma.providerPublicRevision.findUnique({
        where: {
          profileId_revision: {
            profileId: profile.id,
            revision: profile.publishedRevision,
          },
        },
      }),
      this.content.findPublishedByProvider(
        profile.providerId,
        PUBLIC_ITEMS_LIMIT,
      ),
    ]);
    if (!eligible.has(profile.providerId) || !revision) throw notFound();

    return {
      slug: profile.slug,
      displayName: revision.displayName,
      biography: revision.biography,
      logoPath: revision.logoImageId
        ? contentSocialImagePath(revision.logoImageId)
        : null,
      websiteUrl: revision.websiteUrl,
      links: linksFromJson(revision.links),
      items: items.map((card) => ({
        kind: card.kind as ContentUrlNamespace,
        slug: card.slug,
        title: card.title,
        summary: card.summary,
        imageUrl: card.imageUrl,
        category: card.category,
      })),
      excludeFromIndex: profile.excludeFromIndex,
      publishedAt: profile.publishedAt,
      updatedAt: profile.publicContentUpdatedAt,
    };
  }

  async bylineForContent(kind: ContentUrlNamespace, contentId: string) {
    if (!isContentKind(kind)) return null;
    const providerId = await this.content.findPublishedProviderId({
      kind,
      id: contentId,
    });
    if (!providerId) return null;
    const profile = await this.prisma.providerPublicProfile.findFirst({
      where: { providerId, ...livePublication },
    });
    if (!profile || profile.publishedRevision === null) return null;
    const [eligible, revision] = await Promise.all([
      this.identity.activeProviderIds([providerId]),
      this.prisma.providerPublicRevision.findUnique({
        where: {
          profileId_revision: {
            profileId: profile.id,
            revision: profile.publishedRevision,
          },
        },
        select: { displayName: true },
      }),
    ]);
    if (!eligible.has(providerId) || !revision) return null;
    return { slug: profile.slug, displayName: revision.displayName };
  }
}

const CONTENT_KINDS: ReadonlySet<string> = new Set([
  ContentUrlNamespace.COURSE,
  ContentUrlNamespace.EVENT,
  ContentUrlNamespace.PODCAST,
  ContentUrlNamespace.YOUTUBE,
]);

const isContentKind = (kind: ContentUrlNamespace): kind is PublicContentKind =>
  CONTENT_KINDS.has(kind);
