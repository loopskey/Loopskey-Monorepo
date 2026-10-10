"use client";

import { ArrowLeft, Home, LifeBuoy, Mail, SearchX } from "lucide-react";
import { EnglishRouteProvider } from "@/providers/english-route-provider";
import { FrenchRouteProvider } from "@/providers/french-route-provider";
import { isDetailPath } from "@/lib/i18n/locale";
import { useRouteLocale } from "@/providers/route-locale-provider";
import { stripLocalePrefix } from "@/lib/i18n/locale";
import { useEffect, useState } from "react";
import { ActiveRoleProvider } from "@/providers/active-role-provider";
import { RevealOnScroll } from "@elements/reveal-scroll";
import { siteLinks } from "@/utils/constant";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";

import Header from "@layouts/Header";
import Footer from "@layouts/Footer";
import Link from "@elements/localized-link";

// The global not-found page renders outside every route group (there is no
// matched segment tree for a truly unknown URL), so it can't inherit
// (public)/layout.tsx's chrome and renders it directly instead.
const NotFoundContent = () => {
  const { t, language } = useI18n();
  const [pathname, setPathname] = useState("");

  useEffect(() => {
    setPathname(window.location.pathname);
  }, []);

  const isMissingVariant = language === "fr" && isDetailPath(pathname);

  return (
    <ActiveRoleProvider>
      <Header />
      <main className="flex min-h-[calc(100vh-5rem)] items-center overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 -z-10"></div>

        <RevealOnScroll className="mx-auto w-full max-w-4xl text-center">
          <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-lg bg-primary/10 text-primary shadow-inner">
            <SearchX className="h-10 w-10" />
          </div>

          <p className="text-sm font-bold uppercase tracking-[0.35em] text-primary">
            {t("notFound.badge")}
          </p>

          <h1 className="mt-5 text-primary text-8xl font-black tracking-tight sm:text-9xl">
            404
          </h1>

          <h2 className="mt-6 text-2xl font-bold tracking-tight sm:text-4xl">
            {t("notFound.title")}
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            {t("notFound.description")}
          </p>

          {isMissingVariant && (
            <div className="mx-auto mt-6 max-w-2xl space-y-3">
              <p className="text-sm font-semibold sm:text-base">
                {t("contentDetails.common.variantMissing")}
              </p>
              <Button asChild variant="outline" radius="xl">
                <a lang="en" hrefLang="en" href={stripLocalePrefix(pathname)}>
                  {t("contentDetails.common.viewOriginal")}
                </a>
              </Button>
            </div>
          )}

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild radius="xl" size="lg">
              <Link href={siteLinks.home}>
                <Home className="h-4 w-4" />
                {t("notFound.backHome")}
              </Link>
            </Button>

            <Button asChild variant="outline" radius="xl" size="lg">
              <Link href={siteLinks.home}>
                <ArrowLeft className="h-4 w-4" />
                {t("notFound.goBack")}
              </Link>
            </Button>
          </div>

          <div className="mx-auto mt-10 grid max-w-2xl gap-4 sm:grid-cols-2">
            <a
              href="mailto:Loopskey.dev@gmail.com"
              className="group rounded-lg border p-5 text-left shadow-sm transition hover:border-primary/40 hover:bg-primary/5"
            >
              <Mail className="mb-3 h-5 w-5 text-primary" />
              <p className="text-sm font-bold">{t("notFound.emailTitle")}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Loopskey.dev@gmail.com
              </p>
            </a>

            <Link
              href={siteLinks.contact}
              className="group rounded-lg border p-5 text-left shadow-sm transition hover:border-primary/40 hover:bg-primary/5"
            >
              <LifeBuoy className="mb-3 h-5 w-5 text-primary" />
              <p className="text-sm font-bold">{t("notFound.supportTitle")}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("notFound.supportText")}
              </p>
            </Link>
          </div>
        </RevealOnScroll>
      </main>
      <Footer />
    </ActiveRoleProvider>
  );
};

const NotFoundPage = () => {
  const locale = useRouteLocale();
  const RouteProvider =
    locale === "fr" ? FrenchRouteProvider : EnglishRouteProvider;

  return (
    <RouteProvider>
      <NotFoundContent />
    </RouteProvider>
  );
};

export default NotFoundPage;
