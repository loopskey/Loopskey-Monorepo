import { resolveSocialImageUrl } from "@/utils/content-seo";
import { toEditorialCardItems } from "@/lib/content-catalog/editorial-items";
import { formatPublicDate } from "@/lib/site/format-public-date";
import { loadDictionary } from "@/i18n/dictionaries";
import { ExternalLink } from "lucide-react";
import { Badge } from "@ui/badge";

import type { PublicProviderProfile } from "@/lib/server/public-content";
import type { PublicLocale } from "@/lib/i18n/locale";
import type { ReactNode } from "react";

import EditorialText from "@modules/Editorial/EditorialText";
import ContentCard from "@elements/content-card";
import Image from "next/image";

type TProviderProfilePageProps = {
  profile: PublicProviderProfile;
  locale: PublicLocale;
  breadcrumbs: ReactNode;
};

const LOGO_SIZE = 96;
const EXTERNAL_REL = "noopener noreferrer nofollow";

const ProviderProfilePage = async ({
  profile,
  locale,
  breadcrumbs,
}: TProviderProfilePageProps) => {
  const dictionary = await loadDictionary(locale);
  const copy = dictionary.providerProfile;
  const items = toEditorialCardItems(profile.items, dictionary);
  const updated = formatPublicDate(profile.updatedAt, locale);
  const logoUrl = resolveSocialImageUrl(profile.logoPath);

  return (
    <main className="py-8">
      <div className="mx-auto max-w-5xl space-y-10 px-4 sm:px-6 lg:px-8">
        <header className="space-y-4">
          {breadcrumbs}
          <div className="flex flex-wrap items-center gap-5">
            {logoUrl ? (
              <Image
                unoptimized
                src={logoUrl}
                width={LOGO_SIZE}
                height={LOGO_SIZE}
                alt={copy.logoAlt.replace("{{name}}", profile.displayName)}
                className="size-24 rounded-xl border bg-card object-contain p-2"
              />
            ) : null}
            <div className="space-y-2">
              <Badge variant="secondary">{copy.badge}</Badge>
              <h1 className="text-3xl font-medium tracking-tight md:text-5xl">
                {profile.displayName}
              </h1>
            </div>
          </div>
        </header>

        <section aria-labelledby="provider-about" className="space-y-4">
          <h2
            id="provider-about"
            className="text-2xl font-medium tracking-tight"
          >
            {copy.aboutHeading.replace("{{name}}", profile.displayName)}
          </h2>
          <EditorialText
            text={profile.biography}
            className="max-w-3xl space-y-4"
          />
          {profile.websiteUrl ? (
            <p>
              <a
                href={profile.websiteUrl}
                target="_blank"
                rel={EXTERNAL_REL}
                className="inline-flex items-center gap-1.5 font-medium underline-offset-4 hover:underline"
              >
                {copy.website}
                <ExternalLink className="size-4" aria-hidden />
              </a>
            </p>
          ) : null}
        </section>

        {profile.links.length > 0 ? (
          <section aria-labelledby="provider-links" className="space-y-3">
            <h2
              id="provider-links"
              className="text-2xl font-medium tracking-tight"
            >
              {copy.linksHeading}
            </h2>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {profile.links.map((link) => (
                <li key={link.url}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel={EXTERNAL_REL}
                    className="inline-flex items-center gap-1.5 underline-offset-4 hover:underline"
                  >
                    {link.label}
                    <ExternalLink className="size-3.5" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section aria-labelledby="provider-content" className="space-y-4">
          <h2
            id="provider-content"
            className="text-2xl font-medium tracking-tight"
          >
            {copy.contentHeading}
          </h2>
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
              {copy.contentEmpty}
            </p>
          )}
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

export default ProviderProfilePage;
