import { isWellFormedContentSlug } from "@utils/content-slug.util";
import { ContentUrlNamespace } from "@prisma/client";
import { CONTENT_URL_KINDS } from "@contentUrl/services/content-url-kinds";
import { PrismaService } from "@prisma/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ContentUrlResolutionService {
  constructor(private readonly prisma: PrismaService) {}

  async resolve(kind: ContentUrlNamespace, requested: string) {
    if (!isWellFormedContentSlug(requested)) return null;
    const claim = await this.prisma.contentUrlClaim.findUnique({
      where: { namespace_slug: { namespace: kind, slug: requested } },
      select: { targetId: true },
    });
    if (!claim) return null;
    const slug = await CONTENT_URL_KINDS[kind].findPublishedSlug(
      this.prisma,
      claim.targetId,
    );
    return slug ? { slug } : null;
  }
}
