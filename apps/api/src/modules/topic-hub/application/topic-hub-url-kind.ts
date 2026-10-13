import { Prisma, TopicHubStatus } from "@prisma/client";
import { publicContentChange } from "@utils/public-content-change.util";

import type { ContentUrlRecord } from "@contentUrl/public/content-url-kind-registry";

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

export const topicHubUrlKind: Transactional = {
  entityType: "TopicHub",
  adminOnly: true,
  find: async (client, id) => {
    const hub = await client.topicHub.findUnique({
      where: { id },
      select: { id: true, slug: true, deletedAt: true },
    });
    return hub ? { ...hub, providerId: null } : null;
  },
  rename: async (tx, id, from, to) =>
    (
      await tx.topicHub.updateMany({
        where: { id, slug: from, deletedAt: null },
        data: { slug: to, ...publicContentChange() },
      })
    ).count,
  findPublishedSlug: async (client, id) =>
    (
      await client.topicHub.findFirst({
        where: { id, status: TopicHubStatus.PUBLISHED, deletedAt: null },
        select: { slug: true },
      })
    )?.slug ?? null,
};
