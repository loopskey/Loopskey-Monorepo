"use client";

import { STATIC_INFO_EMAIL, type PageKey } from "@utils/static-info-page.utils";
import { TStaticInfoBodyProps } from "@/types/pages.types";
import { useStaticInfoPage } from "@hooks/useStaticInfoPage";
import { RevealOnScroll } from "@elements/reveal-scroll";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

import Link from "next/link";

import * as L from "lucide-react";

const FOCUS_RING =
  "outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/35";

const renderText = (text: string) => {
  const index = text.indexOf(STATIC_INFO_EMAIL);
  if (index === -1) return text;
  return (
    <>
      {text.slice(0, index)}
      <a
        href={`mailto:${STATIC_INFO_EMAIL}`}
        className={cn(
          "rounded-sm font-medium text-primary hover:underline",
          FOCUS_RING,
        )}
      >
        {STATIC_INFO_EMAIL}
      </a>
      {text.slice(index + STATIC_INFO_EMAIL.length)}
    </>
  );
};

const StaticInfoBody = ({ blocks, className }: TStaticInfoBodyProps) => (
  <div
    className={cn(
      "space-y-4 text-sm leading-7 text-muted-foreground md:text-base md:leading-8",
      className,
    )}
  >
    {blocks.map((block, index) =>
      block.type === "list" ? (
        <ul key={`list-${index}`} className="grid gap-3 pt-1">
          {block.items.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <L.Check className="h-3.5 w-3.5" />
              </span>

              <span>{renderText(item)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p key={`paragraph-${index}`}>{renderText(block.text)}</p>
      ),
    )}
  </div>
);

export const StaticInfoPage = ({ pageKey }: { pageKey: PageKey }) => {
  const { t, outline, activeSectionId, setActiveSectionId } = useStaticInfoPage(
    pageKey,
    true,
  );
  const { title, lead, sections, cta } = outline;
  const showNav = sections.length > 1;
  const titleId = `static-info-${pageKey}-title`;

  const sectionCards = (
    <div className="grid items-start gap-5">
      {sections.map((section, index) => (
        <RevealOnScroll
          key={section.id}
          delay={Math.min(index * 45, 260)}
          direction={index % 2 === 0 ? "right" : "left"}
        >
          <GlassCard id={section.id} className="scroll-mt-28 p-6 md:p-8">
            <div className="mb-5">
              <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <L.FileText className="h-3.5 w-3.5" />
                {t("staticInfoPage.sectionLabel", {
                  number: String(index + 1).padStart(2, "0"),
                })}
              </span>

              <h2 className="text-2xl font-medium text-foreground md:text-3xl">
                {section.title}
              </h2>
            </div>

            <StaticInfoBody blocks={section.blocks} />
          </GlassCard>
        </RevealOnScroll>
      ))}
    </div>
  );

  const header = (
    <div className="mx-auto max-w-3xl text-center">
      <span className="inline-flex w-fit items-center gap-2 rounded-full border border-glass-border bg-background/55 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-primary shadow-sm ring-1 ring-white/40 backdrop-blur-xl dark:ring-white/5">
        <L.Sparkles className="h-4 w-4" />
        {t("staticInfoPage.eyebrow")}
      </span>

      <h1
        id={titleId}
        className="mt-6 scroll-mt-28 text-4xl font-medium leading-tight tracking-tight text-foreground md:text-6xl"
      >
        {title}
      </h1>

      {lead.length > 0 && (
        <StaticInfoBody
          blocks={lead}
          className="mx-auto mt-6 max-w-2xl text-center text-base leading-relaxed md:text-lg md:leading-relaxed"
        />
      )}
    </div>
  );

  return (
    <main className="relative overflow-x-clip">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_34%),radial-gradient(circle_at_bottom_right,color-mix(in_oklab,var(--accent)_14%,transparent),transparent_32%)]" />

      <section className="px-4 py-10 sm:px-6 md:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <RevealOnScroll direction="up">{header}</RevealOnScroll>
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div
          className={cn(
            "mx-auto grid max-w-7xl items-start gap-8",
            showNav && "xl:grid-cols-[330px_1fr]",
          )}
        >
          {showNav && (
            <aside className="xl:sticky xl:top-24 xl:self-start">
              <GlassCard className="p-5">
                <div className="mb-5">
                  <p className="text-sm font-semibold text-foreground">
                    {t("staticInfoPage.nav.title")}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("staticInfoPage.nav.description")}
                  </p>
                </div>

                <nav
                  aria-label={t("staticInfoPage.nav.label", { page: title })}
                >
                  <ul className="flex flex-wrap gap-2 xl:max-h-[calc(100vh-20rem)] xl:flex-col xl:flex-nowrap xl:overflow-y-auto xl:pr-1">
                    {sections.map((section, index) => {
                      const isActive = activeSectionId === section.id;

                      return (
                        <li key={section.id} className="xl:w-full">
                          <a
                            href={`#${section.id}`}
                            aria-current={isActive ? "location" : undefined}
                            onClick={() => setActiveSectionId(section.id)}
                            className={cn(
                              "group flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-all duration-300",
                              "xl:w-full xl:gap-3 xl:rounded-2xl xl:px-4 xl:py-3 xl:text-sm",
                              FOCUS_RING,
                              isActive
                                ? "border-primary/30 bg-primary/10 text-primary shadow-sm"
                                : "border-glass-border bg-background/35 text-muted-foreground hover:border-primary/25 hover:bg-primary/5 hover:text-foreground",
                            )}
                          >
                            <span
                              aria-hidden="true"
                              className={cn(
                                "hidden h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-bold xl:flex",
                                isActive
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
                              )}
                            >
                              {index + 1}
                            </span>

                            <span className="xl:line-clamp-1">
                              {section.title}
                            </span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </GlassCard>
            </aside>
          )}

          <div className="space-y-5">
            {sections.length > 0 ? (
              sectionCards
            ) : (
              <GlassCard className="p-6 md:p-8">
                <StaticInfoBody blocks={lead} />
              </GlassCard>
            )}

            {cta && (
              <RevealOnScroll direction="up">
                <div className="flex justify-center pt-2">
                  <Button asChild size="lg" radius="xl" variant="brand">
                    <Link href={cta.href}>
                      {cta.label}
                      <L.ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </RevealOnScroll>
            )}

            {showNav && (
              <div className="flex justify-end">
                <a
                  href={`#${titleId}`}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border border-glass-border bg-background/45 px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/25 hover:text-primary",
                    FOCUS_RING,
                  )}
                >
                  <L.ArrowUp className="h-4 w-4" />
                  {t("staticInfoPage.backToTop")}
                </a>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export type { PageKey };
