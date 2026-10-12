import { providerPath, topicPath } from "@/lib/content-catalog/public-path";
import { loadDictionary } from "@/i18n/dictionaries";
import { localizePath } from "@/lib/i18n/locale";

import type { PublicTopicHubSummary } from "@/lib/server/public-content";
import type { PublicProviderByline } from "@/lib/server/public-content";
import type { PublicLocale } from "@/lib/i18n/locale";

import Link from "next/link";

type TContentRelationsProps = {
  locale: PublicLocale;
  hubs: readonly PublicTopicHubSummary[];
  byline: PublicProviderByline | null;
};

const LINK_CLASS_NAME =
  "rounded-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring";

const ContentRelations = async ({
  locale,
  hubs,
  byline,
}: TContentRelationsProps) => {
  if (hubs.length === 0 && !byline) return null;
  const dictionary = await loadDictionary(locale);

  return (
    <ul className="mb-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
      {byline ? (
        <li>
          {dictionary.providerProfile.providedBy}{" "}
          <Link
            href={localizePath(providerPath(byline.slug), "en")}
            className={LINK_CLASS_NAME}
          >
            {byline.displayName}
          </Link>
        </li>
      ) : null}
      {hubs.map((hub) => (
        <li key={hub.slug}>
          {dictionary.topicHub.partOf}:{" "}
          <Link
            href={localizePath(topicPath(hub.slug), locale)}
            className={LINK_CLASS_NAME}
          >
            {hub.title}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default ContentRelations;
