import { loadDictionary } from "@/i18n/dictionaries";
import { translatorFor } from "@/lib/i18n/translator";
import { toCardItems } from "@/lib/content-catalog/card-items";

import type { TContentResultsProps } from "@/types/content-module.types";
import type { PublicLocale } from "@/lib/i18n/locale";

import ContentCardView from "@elements/content-card-view";

const ContentResults = async ({
  page,
  locale,
}: TContentResultsProps & { locale: PublicLocale }) => {
  const { t } = translatorFor(await loadDictionary(locale));

  return (
    <ul className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {toCardItems(page, t, locale).map((item) => (
        <li key={`${item.kind}-${item.id}`} className="flex">
          <ContentCardView
            item={item}
            className="w-full"
            viewDetails={t("content.card.viewDetails")}
            originalLanguage={t("content.card.originalLanguage")}
          />
        </li>
      ))}
    </ul>
  );
};

export default ContentResults;
