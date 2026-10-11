import { bespokePageMetadata } from "@/utils/static-info-page.utils";
import { asPublicLocale } from "@/lib/i18n/route-locale";
import { loadDictionary } from "@/i18n/dictionaries";
import { identityGraph } from "@/lib/structured-data/graph";

import AboutPageClient from "@templates/AboutPageClient";
import JsonLd from "@elements/json-ld";

export const generateMetadata = bespokePageMetadata("aboutPage", "/about");

type TAboutPageProps = { params: Promise<{ locale: string }> };

const AboutPage = async ({ params }: TAboutPageProps) => {
  const locale = asPublicLocale((await params).locale);
  const { title, description } = (await loadDictionary(locale)).aboutPage.meta;

  return (
    <>
      <JsonLd
        nodes={identityGraph({
          path: "/about",
          name: title,
          locale,
          description,
          type: "AboutPage",
        })}
      />
      <AboutPageClient />
    </>
  );
};

export default AboutPage;
