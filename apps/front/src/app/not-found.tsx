"use client";

import { ArrowLeft, Home, LifeBuoy, Mail, SearchX } from "lucide-react";
import { RevealOnScroll } from "@elements/reveal-scroll";
import { siteLinks } from "@/utils/constant";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";

import Link from "next/link";

const NotFoundPage = () => {
  const { t } = useI18n();

  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-center overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-10 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-10 left-10 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-20 right-10 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <RevealOnScroll className="mx-auto w-full max-w-4xl text-center">
        <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-primary/10 text-primary shadow-inner">
          <SearchX className="h-10 w-10" />
        </div>

        <p className="text-sm font-bold uppercase tracking-[0.35em] text-primary">
          {t("notFound.badge")}
        </p>

        <h1 className="mt-5 bg-gradient-to-r from-primary via-cyan-400 to-violet-400 bg-clip-text text-8xl font-black tracking-tight text-transparent sm:text-9xl">
          404
        </h1>

        <h2 className="mt-6 text-2xl font-bold tracking-tight sm:text-4xl">
          {t("notFound.title")}
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
          {t("notFound.description")}
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild variant="brand" radius="xl" size="lg">
            <Link href={siteLinks.home}>
              <Home className="h-4 w-4" />
              {t("notFound.backHome")}
            </Link>
          </Button>

          <Button asChild variant="glass" radius="xl" size="lg">
            <Link href={siteLinks.home}>
              <ArrowLeft className="h-4 w-4" />
              {t("notFound.goBack")}
            </Link>
          </Button>
        </div>

        <div className="mx-auto mt-10 grid max-w-2xl gap-4 sm:grid-cols-2">
          <a
            href="mailto:Loopskey.dev@gmail.com"
            className="group rounded-3xl border border-glass-border bg-background/35 p-5 text-left shadow-sm backdrop-blur-xl transition hover:border-primary/40 hover:bg-primary/5"
          >
            <Mail className="mb-3 h-5 w-5 text-primary" />
            <p className="text-sm font-bold">{t("notFound.emailTitle")}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Loopskey.dev@gmail.com
            </p>
          </a>

          <Link
            href={siteLinks.contact}
            className="group rounded-3xl border border-glass-border bg-background/35 p-5 text-left shadow-sm backdrop-blur-xl transition hover:border-primary/40 hover:bg-primary/5"
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
  );
};

export default NotFoundPage;
