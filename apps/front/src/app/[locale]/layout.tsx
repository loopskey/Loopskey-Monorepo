import { PUBLIC_LOCALES, isPublicLocale } from "@/lib/i18n/locale";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site/page-metadata";
import { siteOpenGraph, siteTwitter } from "@/lib/site/page-metadata";
import { isIndexableDeployment } from "@/lib/site/deployment-env";
import { RouteLocaleProvider } from "@/providers/route-locale-provider";
import { SITE_METADATA_BASE } from "@/lib/site/site-url";
import { AppToaster } from "@elements/app-toaster";
import { ReactNode } from "react";
import { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";

import "../globals.css";

type TRootLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

const THEME_COLOR = "#010080";

export const dynamicParams = false;

export const viewport: Viewport = { themeColor: THEME_COLOR };

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
        <AppToaster />
        <RouteLocaleProvider locale={locale}>{children}</RouteLocaleProvider>
      </body>
    </html>
  );
}
