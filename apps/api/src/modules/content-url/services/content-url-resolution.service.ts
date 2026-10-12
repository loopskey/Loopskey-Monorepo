import { ContentUrlKindRegistryService } from "@contentUrl/services/content-url-kind-registry.service";
import { isWellFormedContentSlug } from "@utils/content-slug.util";
import { ContentUrlNamespace } from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ContentUrlResolutionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly kinds: ContentUrlKindRegistryService,
  ) {}

  async resolve(kind: ContentUrlNamespace, requested: string) {
    if (!isWellFormedContentSlug(requested)) return null;
    const claim = await this.prisma.contentUrlClaim.findUnique({
      where: { namespace_slug: { namespace: kind, slug: requested } },
      select: { targetId: true },
    });
    if (!claim) return null;
    const slug = await this.kinds
      .get(kind)
      .findPublishedSlug(this.prisma, claim.targetId);
    return slug ? { slug } : null;
  }
}
