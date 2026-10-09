import { NextRequest, NextResponse } from "next/server";
import { fetchSocialCardContent } from "@/lib/social-card/content";
import { UpstreamFailureError } from "@/lib/server/graphql-server";
import { isSocialCardKind } from "@/lib/social-card/content";
import { renderSocialCard } from "@/lib/social-card/render";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = "no-store";
const RETRY_AFTER_SECONDS = "60";

type Params = { params: Promise<{ kind: string; slug: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { kind, slug } = await params;
  if (!isSocialCardKind(kind))
    return new NextResponse("Unknown content kind.", { status: 404 });
  let content;
  try {
    content = await fetchSocialCardContent(kind, slug);
  } catch (error) {
    if (!(error instanceof UpstreamFailureError)) throw error;
    return new NextResponse("Social card temporarily unavailable.", {
      status: 503,
      headers: {
        "Cache-Control": NO_STORE,
        "Retry-After": RETRY_AFTER_SECONDS,
      },
    });
  }

  if (!content)
    return renderSocialCard({
      kind,
      title: null,
      category: null,
      published: false,
      status: 404,
    });

  if (content.published && content.imageUrl) {
    const target = new URL(content.imageUrl, request.nextUrl.origin);
    const redirect = NextResponse.redirect(target, 307);
    redirect.headers.set("Cache-Control", NO_STORE);
    return redirect;
  }

  return renderSocialCard({
    kind,
    title: content.title,
    category: content.category,
    published: content.published,
  });
}
