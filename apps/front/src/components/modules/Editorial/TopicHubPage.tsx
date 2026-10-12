import { toEditorialCardItems } from "@/lib/content-catalog/editorial-items";
import { formatPublicDate } from "@/lib/site/format-public-date";
import { loadDictionary } from "@/i18n/dictionaries";
import { localizePath } from "@/lib/i18n/locale";
import { ArrowRight } from "lucide-react";
import { tabHref } from "@/lib/content-catalog/catalog-href";
import { Badge } from "@ui/badge";

import type { PublicTopicHub } from "@/lib/server/public-content";
import type { PublicLocale } from "@/lib/i18n/locale";
import type { ReactNode } from "react";

import EditorialText from "@modules/Editorial/EditorialText";
import ContentCard from "@elements/content-card";
import Link from "next/link";

type TTopicHubPageProps = {
  hub: PublicTopicHub;
  locale: PublicLocale;
  breadcrumbs: ReactNode;
};

const CATALOG_PATH = "/content";

const TopicHubPage = async ({
  hub,
  locale,
  breadcrumbs,
}: TTopicHubPageProps) => {
  const dictionary = await loadDictionary(locale);
  const copy = dictionary.topicHub;
  const items = toEditorialCardItems(hub.items, dictionary);
  const updated = formatPublicDate(hub.updatedAt, locale);
  const contentLanguage = hub.contentLanguage?.toLowerCase();
  const categoryLabel = hub.category
    ? ((dictionary.content.enums.courseCategory as Record<string, string>)[
        hub.category
      ] ?? hub.category)
    : null;

  return (
    <main className="py-8">
      <div className="mx-auto max-w-5xl space-y-10 px-4 sm:px-6 lg:px-8">
        <header className="space-y-4">
          {breadcrumbs}
          <Badge variant="secondary">{copy.badge}</Badge>
          <h1
            lang={contentLanguage}
            className="text-3xl font-medium tracking-tight md:text-5xl"
          >
            {hub.title}
          </h1>
          <EditorialText
            text={hub.introduction}
            lang={contentLanguage}
            className="max-w-3xl space-y-3 text-lg text-muted-foreground"
          />
        </header>

        <section aria-labelledby="topic-guidance" className="space-y-4">
          <h2
            id="topic-guidance"
            className="text-2xl font-medium tracking-tight"
          >
            {copy.guidanceHeading}
          </h2>
          <EditorialText
            text={hub.guidance}
            lang={contentLanguage}
            className="max-w-3xl space-y-4"
          />
          {hub.sections.map((section) => (
            <div key={section.heading} className="max-w-3xl space-y-2 pt-2">
              <h3
                lang={contentLanguage}
                className="text-xl font-medium tracking-tight"
              >
                {section.heading}
              </h3>
              <EditorialText text={section.body} lang={contentLanguage} />
            </div>
          ))}
        </section>

        <section aria-labelledby="topic-links" className="space-y-4">
          <div className="space-y-1">
            <h2
              id="topic-links"
              className="text-2xl font-medium tracking-tight"
            >
              {copy.linksHeading}
            </h2>
            <p className="text-muted-foreground">{copy.linksIntro}</p>
          </div>

          {items.length > 0 ? (
            <ul className="grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {items.map((item) => (
                <li key={`${item.kind}-${item.id}`} className="flex">
                  <ContentCard item={item} className="w-full" />
                </li>
              ))}
            </ul>
          ) : (
            <p
              role="status"
              className="rounded-lg border border-dashed p-6 text-muted-foreground"
            >
              {copy.empty}
            </p>
          )}

          <div className="flex flex-wrap gap-4 pt-2 text-sm font-medium">
            <Link
              href={localizePath(tabHref("courses"), locale)}
              className="inline-flex items-center gap-1.5 underline-offset-4 hover:underline"
            >
              {copy.browseCatalog}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            {categoryLabel ? (
              <Link
                href={localizePath(
                  `${CATALOG_PATH}?category=${encodeURIComponent(hub.category ?? "")}`,
                  locale,
                )}
                className="inline-flex items-center gap-1.5 underline-offset-4 hover:underline"
              >
                {copy.browseCategory.replace("{{category}}", categoryLabel)}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            ) : null}
          </div>
        </section>

        {updated ? (
          <p className="text-sm text-muted-foreground">
            {copy.updated.replace("{{date}}", updated)}
          </p>
        ) : null}
      </div>
    </main>
  );
};

export default TopicHubPage;
