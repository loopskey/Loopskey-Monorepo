import { RouteLocaleProvider } from "@/providers/route-locale-provider";
import { StoreProvider } from "@/providers/rtk-provider";
import { AppToaster } from "@elements/app-toaster";
import { ReactNode } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";

import { isIndexableDeployment } from "@/lib/site/deployment-env";
import { SITE_METADATA_BASE } from "@/lib/site/site-url";
import { PUBLIC_LOCALES, isPublicLocale } from "@/lib/i18n/locale";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  siteOpenGraph,
  siteTwitter,
} from "@/lib/site/page-metadata";

import "../globals.css";

type TRootLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export const dynamicParams = false;

export const generateStaticParams = () =>
  PUBLIC_LOCALES.map((locale) => ({ locale }));

export const generateMetadata = async ({
  params,
}: Pick<TRootLayoutProps, "params">): Promise<Metadata> => {
  const { locale } = await params;
  const publicLocale = isPublicLocale(locale) ? locale : "en";
  return {
    metadataBase: SITE_METADATA_BASE,
    title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
    description: SITE_DESCRIPTION,
    applicationName: SITE_NAME,
    openGraph: siteOpenGraph({
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      locale: publicLocale,
    }),
    twitter: siteTwitter({ title: SITE_NAME, description: SITE_DESCRIPTION }),
    ...(isIndexableDeployment
      ? {}
      : { robots: { index: false, follow: false } }),
  };
};

export default async function RootLayout({
  children,
  params,
}: TRootLayoutProps) {
  const { locale } = await params;
  if (!isPublicLocale(locale)) notFound();

  return (
    <html lang={locale}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <StoreProvider>
          <AppToaster />
          <RouteLocaleProvider locale={locale}>{children}</RouteLocaleProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
