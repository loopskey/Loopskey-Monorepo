"use client";

import { RevealOnScroll } from "@elements/reveal-scroll";
import { useTermsPage } from "@/hooks/useTermsPage";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";
import { cn } from "@/lib/utils";

import Link from "next/link";

import * as L from "lucide-react";

const noticeIconMap = {
  file: L.FileText,
  shield: L.ShieldCheck,
  sparkles: L.Sparkles,
  alert: L.AlertTriangle,
};

const TermsPage = () => {
  const { t, sections, activeSectionId, setActiveSectionId } = useTermsPage();

  return (
    <main className="overflow-hidden">
      <section className="relative px-4 py-10 md:py-16">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.18),transparent_34%),radial-gradient(circle_at_bottom_right,hsl(var(--accent)/0.14),transparent_32%)]" />

        <div className="mx-auto max-w-7xl">
          <RevealOnScroll direction="up">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-glass-border bg-background/55 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-primary shadow-sm backdrop-blur-xl ring-1 ring-white/40 dark:ring-white/5">
                <L.ScrollText className="h-4 w-4" />
                {t("termsPage.hero.eyebrow")}
              </span>

              <h1 className="mt-6 text-4xl font-medium leading-tight text-foreground md:text-6xl">
                {t("termsPage.hero.title")}{" "}
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  {t("termsPage.hero.highlight")}
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                {t("termsPage.hero.description")}
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Badge variant="secondary" className="rounded-full px-4 py-2">
                  {t("termsPage.hero.lastUpdated")}
                </Badge>

                <Badge variant="secondary" className="rounded-full px-4 py-2">
                  {t("termsPage.hero.appliesTo")}
                </Badge>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="mx-auto grid max-w-7xl items-start gap-8 xl:grid-cols-[330px_1fr]">
          <RevealOnScroll direction="left">
            <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
              <GlassCard className="p-5">
                <div className="mb-5">
                  <p className="text-sm font-semibold text-foreground">
                    {t("termsPage.nav.title")}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("termsPage.nav.description")}
                  </p>
                </div>

                <nav className="custom-scrollbar grid max-h-[calc(100vh-18rem)] gap-2 overflow-y-auto pr-1">
                  {sections.map((section, index) => {
                    const isActive = activeSectionId === section.id;
                    return (
                      <a
                        key={section.id}
                        href={`#${section.id}`}
                        onClick={() => setActiveSectionId(section.id)}
                        className={cn(
                          "group flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition-all duration-300",
                          isActive
                            ? "border-primary/30 bg-primary/10 text-primary shadow-sm"
                            : "border-glass-border bg-background/35 text-muted-foreground hover:border-primary/25 hover:bg-primary/5 hover:text-foreground",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-bold",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
                          )}
                        >
                          {index + 1}
                        </span>

                        <span className="line-clamp-1">{section.title}</span>
                      </a>
                    );
                  })}
                </nav>
              </GlassCard>

              <GlassCard className="p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                    <L.Mail className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="font-semibold text-foreground">
                      {t("termsPage.contactCard.title")}
                    </p>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {t("termsPage.contactCard.description")}
                    </p>
                  </div>
                </div>

                <Button
                  asChild
                  radius="xl"
                  variant="brand"
                  className="mt-5 w-full"
                >
                  <Link href="mailto:legal@loopskey.com">
                    {t("termsPage.contactCard.button")}
                    <L.ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </GlassCard>
            </aside>
          </RevealOnScroll>

          <RevealOnScroll direction="right" delay={120}>
            <div className="space-y-5">
              {sections.map((section, index) => {
                const NoticeIcon = section.notice
                  ? noticeIconMap[section.notice.icon]
                  : null;

                const isWarn = section.notice?.tone === "warn";

                return (
                  <RevealOnScroll
                    key={section.id}
                    delay={Math.min(index * 45, 260)}
                    direction={index % 2 === 0 ? "right" : "left"}
                  >
                    <GlassCard
                      id={section.id}
                      className="scroll-mt-28 p-6 md:p-8"
                      onMouseEnter={() => setActiveSectionId(section.id)}
                    >
                      <div className="mb-5 flex items-start justify-between gap-4">
                        <div>
                          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                            <L.FileText className="h-3.5 w-3.5" />
                            {t("termsPage.sectionLabel", {
                              number: String(index + 1).padStart(2, "0"),
                            })}
                          </div>

                          <h2 className="text-2xl font-medium text-foreground md:text-3xl">
                            {section.title}
                          </h2>
                        </div>
                      </div>

                      <div className="space-y-4 text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
                        {section.paragraphs?.map((paragraph) => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}

                        {section.bullets && section.bullets.length > 0 && (
                          <ul className="grid gap-3 pt-1">
                            {section.bullets.map((bullet) => (
                              <li key={bullet} className="flex gap-3">
                                <span className="mt-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                  <L.Check className="h-3.5 w-3.5" />
                                </span>

                                <span>{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {section.notice && NoticeIcon && (
                          <div
                            className={cn(
                              "mt-6 rounded-3xl border p-5",
                              isWarn
                                ? "border-amber-500/25 bg-amber-500/10"
                                : "border-primary/20 bg-primary/5",
                            )}
                          >
                            <div className="flex gap-4">
                              <div
                                className={cn(
                                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                                  isWarn
                                    ? "bg-amber-500/15 text-amber-500"
                                    : "bg-primary/10 text-primary",
                                )}
                              >
                                <NoticeIcon className="h-6 w-6" />
                              </div>

                              <div>
                                <p className="font-semibold text-foreground">
                                  {section.notice.title}
                                </p>

                                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                                  {section.notice.text}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {section.contactItems &&
                          section.contactItems.length > 0 && (
                            <div className="mt-6 grid gap-3 rounded-3xl border border-glass-border bg-background/45 p-5">
                              {section.contactItems.map((item) => (
                                <div
                                  key={`${item.label}-${item.value}`}
                                  className="flex flex-col gap-1 rounded-2xl bg-background/50 p-4 sm:flex-row sm:items-center sm:justify-between"
                                >
                                  <span className="text-sm font-semibold text-foreground">
                                    {item.label}
                                  </span>

                                  {item.href ? (
                                    <Link
                                      href={item.href}
                                      className="text-sm font-medium text-primary hover:underline"
                                    >
                                      {item.value}
                                    </Link>
                                  ) : (
                                    <span className="text-sm text-muted-foreground">
                                      {item.value}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                      </div>
                    </GlassCard>
                  </RevealOnScroll>
                );
              })}
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <section className="px-4 pb-28">
        <div className="mx-auto max-w-7xl">
          <RevealOnScroll direction="up">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-primary/20 bg-slate-600 p-8 text-white shadow-2xl md:p-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.35),transparent_34%),radial-gradient(circle_at_bottom_right,hsl(var(--accent)/0.25),transparent_30%)]" />

              <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white/80 backdrop-blur-xl">
                    <L.Scale className="h-4 w-4" />
                    {t("termsPage.cta.eyebrow")}
                  </div>

                  <h2 className="text-3xl font-medium md:text-4xl">
                    {t("termsPage.cta.title")}
                  </h2>

                  <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-300">
                    {t("termsPage.cta.description")}
                  </p>
                </div>

                <Button
                  asChild
                  size="lg"
                  radius="xl"
                  variant="brand"
                  className="w-full lg:w-auto"
                >
                  <Link href="/contact">
                    {t("termsPage.cta.button")}
                    <L.ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>
    </main>
  );
};

export default TermsPage;
