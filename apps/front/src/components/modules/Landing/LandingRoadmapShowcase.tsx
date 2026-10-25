import { ROADMAP_BENEFIT_KEYS } from "@/utils/landing-sections.constant";
import { ROADMAP_SAMPLE_HOURS } from "@/utils/landing-sections.constant";
import { ROADMAP_SAMPLE_STEPS } from "@/utils/landing-sections.constant";
import { loadTranslator } from "@/i18n/dictionaries";
import { siteLinks } from "@/utils/site-navigation";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

import type { RoadmapSampleStatus } from "@/utils/landing-sections.constant";
import type { RoadmapSampleStep } from "@/utils/landing-sections.constant";
import type { PublicLocale } from "@/lib/i18n/locale";

import { LandingSection, LandingSectionHeading } from "./parts/LandingSection";
import LandingActionGroup from "./parts/LandingActionGroup";
import LandingSamplePanel from "./parts/LandingSamplePanel";

const TITLE_ID = "landing-roadmap-title";
const PREVIEW_TITLE_ID = "landing-roadmap-preview-title";

const MARKER_CLASS_NAME: Record<RoadmapSampleStatus, string> = {
  done: "border-primary bg-primary text-primary-foreground",
  active: "border-primary/25 bg-card text-primary ring-4 ring-accent",
  upcoming: "border-border bg-card text-muted-foreground",
};

const BADGE_CLASS_NAME: Record<RoadmapSampleStatus, string> = {
  done: "bg-accent text-primary",
  active: "bg-brand-orange/15 text-brand-orange-text",
  upcoming: "bg-muted text-muted-foreground",
};

const DATE_FORMAT: Record<
  NonNullable<RoadmapSampleStep["date"]>["style"],
  Intl.DateTimeFormatOptions
> = {
  dayMonth: { month: "short", day: "numeric", timeZone: "UTC" },
  month: { month: "long", timeZone: "UTC" },
};

const LandingRoadmapShowcase = async ({ locale }: { locale: PublicLocale }) => {
  const { t } = await loadTranslator(locale);
  const numbers = new Intl.NumberFormat(locale);
  const percent = new Intl.NumberFormat(locale, { style: "percent" });
  const formatDate = (date: NonNullable<RoadmapSampleStep["date"]>) =>
    new Intl.DateTimeFormat(locale, DATE_FORMAT[date.style]).format(date.value);

  const stepMeta = (step: RoadmapSampleStep) =>
    t(
      `landing.roadmapShowcase.preview.steps.${step.key}.meta`,
      step.date
        ? { date: formatDate(step.date) }
        : { count: numbers.format(step.hours ?? 0) },
    );

  const nextStep = ROADMAP_SAMPLE_STEPS.find(
    (step) => step.status === "active",
  );
  const summary = [
    {
      key: "hours",
      value: `${numbers.format(ROADMAP_SAMPLE_HOURS.completed)}/${numbers.format(ROADMAP_SAMPLE_HOURS.target)}`,
    },
    {
      key: "progress",
      value: percent.format(
        ROADMAP_SAMPLE_HOURS.completed / ROADMAP_SAMPLE_HOURS.target,
      ),
    },
    {
      key: "next",
      value: nextStep?.date ? formatDate(nextStep.date) : "",
    },
  ];

  const fromRole = t("landing.roadmapShowcase.preview.fromRole");
  const toRole = t("landing.roadmapShowcase.preview.toRole");

  return (
    <LandingSection labelledBy={TITLE_ID} tone="muted">
      <LandingSectionHeading
        id={TITLE_ID}
        eyebrow={t("landing.roadmapShowcase.badge")}
        title={t("landing.roadmapShowcase.title")}
      />

      <div className="mt-12 grid items-center gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-16">
        <div className="min-w-0">
          <h3 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t("landing.roadmapShowcase.headingLead")}{" "}
            <span className="text-primary">
              {t("landing.roadmapShowcase.headingHighlight")}
            </span>
          </h3>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {t("landing.roadmapShowcase.description")}
          </p>

          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {ROADMAP_BENEFIT_KEYS.map((key) => (
              <li
                key={key}
                className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 text-sm font-medium text-foreground shadow-sm"
              >
                <span
                  aria-hidden
                  className="size-2 shrink-0 rounded-full bg-brand-orange"
                />
                {t(`landing.roadmapShowcase.benefits.${key}`)}
              </li>
            ))}
          </ul>

          <LandingActionGroup
            className="mt-8"
            actions={[
              {
                kind: "session",
                key: "roadmap",
                intent: "roadmap",
                variant: "primary",
              },
              {
                kind: "link",
                key: "learn-more",
                href: siteLinks.professionals,
                label: t("landing.roadmapShowcase.learnMore"),
                variant: "outline",
              },
            ]}
          />
        </div>

        <LandingSamplePanel
          titleId={PREVIEW_TITLE_ID}
          eyebrow={t("landing.roadmapShowcase.preview.goalLabel")}
          title={t("landing.roadmapShowcase.preview.title")}
          sampleLabel={t("landing.sample.label")}
          subtitle={
            <p className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
              <span className="sr-only">
                {t("landing.roadmapShowcase.preview.careerPath", {
                  from: fromRole,
                  to: toRole,
                })}
              </span>
              <span aria-hidden>{fromRole}</span>
              <ArrowRight aria-hidden className="size-3.5" />
              <span aria-hidden className="font-medium text-foreground">
                {toRole}
              </span>
            </p>
          }
        >
          <ol
            aria-label={t("landing.roadmapShowcase.preview.stepsLabel")}
            className="mt-6 space-y-4 border-t pt-6"
          >
            {ROADMAP_SAMPLE_STEPS.map((step, index) => (
              <li
                key={step.key}
                className="relative grid grid-cols-[3rem_minmax(0,1fr)] gap-3 sm:grid-cols-[4rem_minmax(0,1fr)] sm:gap-4"
              >
                {index < ROADMAP_SAMPLE_STEPS.length - 1 ? (
                  <span
                    aria-hidden
                    className={cn(
                      "absolute -bottom-4 left-6 top-12 w-px sm:left-8 sm:top-16",
                      step.status === "upcoming"
                        ? "bg-border"
                        : "bg-primary/60",
                    )}
                  />
                ) : null}
                <span
                  aria-hidden
                  className={cn(
                    "relative flex size-12 items-center justify-center rounded-lg border text-base font-semibold sm:size-16",
                    MARKER_CLASS_NAME[step.status],
                  )}
                >
                  {index + 1}
                </span>
                <div
                  className={cn(
                    "flex min-w-0 flex-col gap-2 rounded-xl border p-4 shadow-sm sm:flex-row sm:items-start sm:justify-between",
                    step.status === "active" ? "bg-muted" : "bg-card",
                  )}
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">
                      {t(
                        `landing.roadmapShowcase.preview.steps.${step.key}.title`,
                      )}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {stepMeta(step)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "w-fit shrink-0 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider",
                      BADGE_CLASS_NAME[step.status],
                    )}
                  >
                    {t(`landing.roadmapShowcase.preview.status.${step.status}`)}
                  </span>
                </div>
              </li>
            ))}
          </ol>

          <dl className="mt-6 grid gap-4 rounded-xl bg-muted p-5 sm:grid-cols-3">
            {summary.map((item) => (
              <div key={item.key}>
                <dt className="text-xs text-muted-foreground">
                  {t(`landing.roadmapShowcase.preview.summary.${item.key}`)}
                </dt>
                <dd className="mt-1 text-2xl font-bold text-foreground">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </LandingSamplePanel>
      </div>
    </LandingSection>
  );
};

export default LandingRoadmapShowcase;
