import { RouteLanguageProvider } from "@/providers/route-language-provider";
import { PublicTelemetry } from "@elements/public-telemetry";
import { clientMessages } from "@/i18n/public-messages";
import { asPublicLocale } from "@/lib/i18n/route-locale";
import { ReactNode } from "react";

import PublicChrome from "@layouts/PublicChrome";

type TLocalizedLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

const LocalizedLayout = async ({ children, params }: TLocalizedLayoutProps) => {
  const locale = asPublicLocale((await params).locale);

  return (
    <RouteLanguageProvider
      language={locale}
      dictionary={clientMessages(locale, "shell")}
    >
      <PublicChrome locale={locale}>{children}</PublicChrome>
      <PublicTelemetry />
    </RouteLanguageProvider>
  );
};

export default LocalizedLayout;
