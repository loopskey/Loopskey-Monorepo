import { renderSiteSocialCard } from "@/lib/social-card/render-site";

export const runtime = "nodejs";
export const dynamic = "force-static";

export const GET = () => renderSiteSocialCard();
