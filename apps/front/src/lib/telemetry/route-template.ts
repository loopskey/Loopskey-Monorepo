import { TelemetryRouteTemplate } from "@/lib/graphql/base";
import { stripLocalePrefix } from "@/lib/i18n/locale";

const DETAIL_ROOTS = new Map<string, TelemetryRouteTemplate>([
  ["courses", TelemetryRouteTemplate.CourseDetail],
  ["events", TelemetryRouteTemplate.EventDetail],
  ["podcasts", TelemetryRouteTemplate.PodcastDetail],
  ["youtube", TelemetryRouteTemplate.YoutubeDetail],
  ["topics", TelemetryRouteTemplate.TopicHub],
  ["providers", TelemetryRouteTemplate.ProviderProfile],
]);

const STATIC_ROOTS = new Map<string, TelemetryRouteTemplate>([
  ["content", TelemetryRouteTemplate.ContentCatalog],
  ["about", TelemetryRouteTemplate.About],
  ["contact", TelemetryRouteTemplate.Contact],
  ["faq", TelemetryRouteTemplate.Faq],
  ["services", TelemetryRouteTemplate.Services],
  ["solutions", TelemetryRouteTemplate.Solutions],
  ["company", TelemetryRouteTemplate.Company],
  ["support", TelemetryRouteTemplate.Support],
  ["terms", TelemetryRouteTemplate.Legal],
  ["privacy-policy", TelemetryRouteTemplate.Legal],
  ["cookies", TelemetryRouteTemplate.Legal],
]);

export const routeTemplateOf = (pathname: string) => {
  const unprefixed = stripLocalePrefix(pathname);
  if (unprefixed === "/") return TelemetryRouteTemplate.Home;
  const [root, ...rest] = unprefixed.split("/").filter(Boolean);
  const detail = DETAIL_ROOTS.get(root);
  if (detail) return rest.length === 1 ? detail : null;
  return STATIC_ROOTS.get(root) ?? null;
};
