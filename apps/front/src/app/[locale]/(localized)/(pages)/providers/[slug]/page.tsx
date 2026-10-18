import { getPublicProviderProfile } from "@/lib/server/public-content";
import { redirectToRenamedContent } from "@/lib/server/renamed-content";
import { TContentDetailPageProps } from "@/types/pages.types";
import { resolveSocialImageUrl } from "@/utils/content-seo";
import { providerProfileGraph } from "@/lib/structured-data/editorial-graphs";
import { editorialMetadata } from "@/lib/site/editorial-metadata";
import { noindexMetadata } from "@/lib/site/page-metadata";
import { asPublicLocale } from "@/lib/i18n/route-locale";
import { editorialTrail } from "@/lib/structured-data/trail";
import { ClientMessages } from "@elements/client-messages";
import { loadDictionary } from "@/i18n/dictionaries";
import { providerPath } from "@/lib/content-catalog/public-path";
import { notFound } from "next/navigation";

import type { Metadata } from "next";

import ProviderProfilePage from "@modules/Editorial/ProviderProfilePage";
import Breadcrumbs from "@elements/breadcrumbs";
import JsonLd from "@elements/json-ld";

export const dynamic = "force-dynamic";

const ENGLISH_ONLY = ["en"] as const;

export const generateMetadata = async ({
  params,
}: TContentDetailPageProps): Promise<Metadata> => {
  const { slug, locale } = await params;
  const publicLocale = asPublicLocale(locale);
  const profile = await getPublicProviderProfile(slug, publicLocale);
  if (!profile) return noindexMetadata();
  const dictionary = await loadDictionary(publicLocale);
  return editorialMetadata({
    path: providerPath(profile.slug),
    title: profile.displayName,
    description: profile.biography,
    fallbackDescription: dictionary.providerProfile.metaFallback,
    locale: publicLocale,
    variants: ENGLISH_ONLY,
    excludeFromIndex: profile.excludeFromIndex,
    imageUrl: resolveSocialImageUrl(profile.logoPath),
  });
};

const Page = async ({ params }: TContentDetailPageProps) => {
  const { slug, locale } = await params;
  const publicLocale = asPublicLocale(locale);
  const profile = await getPublicProviderProfile(slug, publicLocale);
  if (!profile) {
    await redirectToRenamedContent(
      "provider",
      slug,
      publicLocale,
      getPublicProviderProfile,
    );
    notFound();
  }
  const trail = await editorialTrail({
    kind: "provider",
    slug: profile.slug,
    title: profile.displayName,
    locale: publicLocale,
  });
  return (
    <>
      {!profile.excludeFromIndex && (
        <JsonLd
          nodes={providerProfileGraph({
            content: profile,
            locale: publicLocale,
            trail,
            logoUrl: resolveSocialImageUrl(profile.logoPath),
          })}
        />
      )}
      <ClientMessages scope="editorial" locale={publicLocale}>
        <ProviderProfilePage
          profile={profile}
          locale={publicLocale}
          breadcrumbs={<Breadcrumbs trail={trail} locale={publicLocale} />}
        />
      </ClientMessages>
    </>
  );
};

export default Page;
