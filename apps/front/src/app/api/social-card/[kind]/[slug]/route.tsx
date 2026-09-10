import { fetchSocialCardContent, isSocialCardKind } from "@/lib/social-card/content";
import { renderSocialCard } from "@/lib/social-card/render";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
// The card is generated on request and cached, never stored per item.
export const revalidate = 86400;

type Params = { params: Promise<{ kind: string; slug: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { kind, slug } = await params;

  if (!isSocialCardKind(kind))
    return new NextResponse("Unknown content kind.", { status: 404 });

  const content = await fetchSocialCardContent(kind, slug);

  // A real platform-hosted image wins over the generated composition. It is only
  // used for published content; the redirect keeps the bytes off this route.
  if (content?.published && content.imageUrl) {
    const target = new URL(content.imageUrl, request.nextUrl.origin);
    return NextResponse.redirect(target, 307);
  }

  return renderSocialCard({
    kind,
    title: content?.title ?? null,
    category: content?.category ?? null,
    published: content?.published ?? false,
  });
}
