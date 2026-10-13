import { EnglishRouteProvider } from "@/providers/english-route-provider";
import { FrenchRouteProvider } from "@/providers/french-route-provider";
import { PublicTelemetry } from "@elements/public-telemetry";
import { ReactNode } from "react";

import PublicChrome from "@layouts/PublicChrome";

type TLocalizedLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

const LocalizedLayout = async ({ children, params }: TLocalizedLayoutProps) => {
  const { locale } = await params;
  const RouteProvider =
    locale === "fr" ? FrenchRouteProvider : EnglishRouteProvider;

  return (
    <RouteProvider>
      <PublicChrome>{children}</PublicChrome>
      <PublicTelemetry />
    </RouteProvider>
  );
};

export default LocalizedLayout;
