import { Prisma, ProviderProfileStatus } from "@prisma/client";
import { publicContentChange } from "@utils/public-content-change.util";

import type { ContentUrlRecord } from "@contentUrl/public/content-url-kind-registry";
import type { IdentityProfileApi } from "@user/public/identity-profile-api";

type Transactional = {
  entityType: string;
  adminOnly: true;
  find(
    client: Prisma.TransactionClient,
    id: string,
  ): Promise<ContentUrlRecord | null>;
  rename(
    tx: Prisma.TransactionClient,
    id: string,
    from: string,
    to: string,
  ): Promise<number>;
  findPublishedSlug(
    client: Prisma.TransactionClient,
    id: string,
  ): Promise<string | null>;
};

export const providerPublicProfileUrlKind = (
  identity: IdentityProfileApi,
): Transactional => ({
  entityType: "ProviderPublicProfile",
  adminOnly: true,
  find: async (client, id) => {
    const profile = await client.providerPublicProfile.findUnique({
      where: { id },
      select: { id: true, slug: true, providerId: true, deletedAt: true },
    });
    return profile;
  },
  rename: async (tx, id, from, to) =>
    (
      await tx.providerPublicProfile.updateMany({
        where: { id, slug: from, deletedAt: null },
        data: { slug: to, ...publicContentChange() },
      })
    ).count,
  findPublishedSlug: async (client, id) => {
    const profile = await client.providerPublicProfile.findFirst({
      where: {
        id,
        status: ProviderProfileStatus.PUBLISHED,
        deletedAt: null,
        publishedRevision: { not: null },
      },
      select: { slug: true, providerId: true },
    });
    if (!profile) return null;
    const eligible = await identity.activeProviderIds([profile.providerId]);
    return eligible.has(profile.providerId) ? profile.slug : null;
  },
});
