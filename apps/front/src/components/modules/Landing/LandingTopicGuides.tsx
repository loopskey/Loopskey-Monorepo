import { getPublicTopicHubSummaries } from "@/lib/server/public-content";
import { loadDictionary } from "@/i18n/dictionaries";
import { localizePath } from "@/lib/i18n/locale";
import { ArrowRight } from "lucide-react";
import { topicPath } from "@/lib/content-catalog/public-path";

import type { PublicLocale } from "@/lib/i18n/locale";

import Link from "next/link";

type TLandingTopicGuidesProps = {
  locale: PublicLocale;
};

const GUIDES_SHOWN = 3;

const LandingTopicGuides = async ({ locale }: TLandingTopicGuidesProps) => {
  const hubs = await getPublicTopicHubSummaries(locale, GUIDES_SHOWN);
  if (hubs.length === 0) return null;
  const copy = (await loadDictionary(locale)).landing.topicGuides;

  return (
    <section aria-labelledby="landing-topic-guides" className="py-12">
      <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-2">
          <h2
            id="landing-topic-guides"
            className="text-3xl font-medium tracking-tight"
          >
            {copy.title}
          </h2>
          <p className="max-w-2xl text-muted-foreground">{copy.subtitle}</p>
        </div>
        <ul className="grid gap-4 md:grid-cols-3">
          {hubs.map((hub) => (
            <li key={hub.slug} className="flex">
              <article className="relative flex w-full flex-col gap-3 rounded-xl border bg-card p-5 shadow-sm">
                <h3 className="text-lg font-semibold tracking-tight">
                  <Link
                    href={localizePath(topicPath(hub.slug), locale)}
                    className="rounded-sm outline-none after:absolute after:inset-0 hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {hub.title}
                  </Link>
                </h3>
                <p className="text-sm text-muted-foreground">
                  {hub.introduction}
                </p>
                <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium">
                  {copy.read}
                  <ArrowRight className="size-4" aria-hidden />
                </span>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default LandingTopicGuides;
