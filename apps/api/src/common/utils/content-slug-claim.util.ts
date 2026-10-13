import { ContentUrlNamespace, Prisma } from "@prisma/client";

type ClaimReader = Pick<Prisma.TransactionClient, "contentUrlClaim">;

export const isContentSlugClaimed = async (
  client: ClaimReader,
  namespace: ContentUrlNamespace,
  slug: string,
) =>
  Boolean(
    await client.contentUrlClaim.findUnique({
      where: { namespace_slug: { namespace, slug } },
      select: { id: true },
    }),
  );
