import { ORGANIZATION_BENEFIT_KEYS } from "@/utils/landing-sections.constant";
import { ORGANIZATION_SAMPLE } from "@/utils/landing-sections.constant";
import { loadDictionary } from "@/i18n/dictionaries";
import { siteLinks } from "@/utils/site-navigation";
import { cn } from "@/lib/utils";

import type { PublicLocale } from "@/lib/i18n/locale";

import { LandingSection, LandingSectionHeading } from "./parts/LandingSection";
import LandingActionGroup from "./parts/LandingActionGroup";
import LandingSamplePanel from "./parts/LandingSamplePanel";

const TITLE_ID = "landing-organization-title";
const PREVIEW_TITLE_ID = "landing-organization-preview-title";

const STATUS_BAR_CLASS_NAME: Record<
  (typeof ORGANIZATION_SAMPLE.status)[number]["key"],
  string
> = {
  onTrack: "bg-primary",
  atRisk: "bg-brand-orange/50",
  overdue: "bg-brand-orange",
};

const LandingOrganization = async ({ locale }: { locale: PublicLocale }) => {
  const { landing } = await loadDictionary(locale);
  const copy = landing.organization;
  const numbers = new Intl.NumberFormat(locale);
  const percent = new Intl.NumberFormat(locale, { style: "percent" });

  const onTrackShare =
    ORGANIZATION_SAMPLE.status.find((item) => item.key === "onTrack")?.share ??
    0;
  const stats = [
    {
      key: "members",
      label: copy.preview.stats.members,
      value: numbers.format(ORGANIZATION_SAMPLE.members),
    },
    {
      key: "onTrack",
      label: copy.preview.stats.onTrack,
      value: percent.format(onTrackShare),
    },
    {
      key: "published",
      label: copy.preview.stats.published,
      value: numbers.format(ORGANIZATION_SAMPLE.publishedContent),
    },
  ];

  return (
    <LandingSection labelledBy={TITLE_ID}>
      <LandingSectionHeading
        id={TITLE_ID}
        eyebrow={copy.badge}
        title={copy.title}
      />

      <div className="mt-12 grid items-center gap-10 rounded-3xl bg-primary p-6 text-primary-foreground shadow-lg sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:gap-14 lg:p-14">
        <div className="min-w-0">
          <h3 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
            {copy.panelTitle}
          </h3>
          <p className="mt-4 max-w-xl text-base leading-7 text-primary-foreground/85 sm:text-lg">
            {copy.description}
          </p>

          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {ORGANIZATION_BENEFIT_KEYS.map((key) => (
              <li
                key={key}
                className="flex items-center gap-3 rounded-xl border border-primary-foreground/30 bg-primary-foreground/5 px-4 py-3 text-sm font-semibold"
              >
                <span
                  aria-hidden
                  className="size-2 shrink-0 rounded-full bg-brand-orange"
                />
                {copy.benefits[key]}
              </li>
            ))}
          </ul>

          <LandingActionGroup
            className="mt-8"
            actions={[
              {
                kind: "link",
                key: "contact",
                href: siteLinks.contact,
                label: copy.contact,
                variant: "inverse",
              },
              {
                kind: "link",
                key: "associations",
                href: siteLinks.associations,
                label: copy.associations,
                variant: "inverseOutline",
              },
            ]}
          />
        </div>

        <LandingSamplePanel
          className="border-transparent"
          titleId={PREVIEW_TITLE_ID}
          eyebrow={copy.preview.eyebrow}
          title={copy.preview.title}
          sampleLabel={landing.sample.dataLabel}
        >
          <dl className="mt-5 grid gap-2 min-[375px]:grid-cols-3 sm:gap-3">
            {stats.map((stat) => (
              <div
                key={stat.key}
                className="min-w-0 rounded-xl border p-3 sm:p-4"
              >
                <dt className="text-xs text-muted-foreground">{stat.label}</dt>
                <dd className="mt-1 text-lg font-bold text-foreground sm:text-2xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-4 rounded-xl border p-4 sm:p-5">
            <p className="text-sm font-semibold text-foreground">
              {copy.preview.statusTitle}
            </p>
            <ul className="mt-3 space-y-3">
              {ORGANIZATION_SAMPLE.status.map((item) => (
                <li key={item.key}>
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-muted-foreground">
                      {copy.preview.status[item.key]}
                    </span>
                    <span className="font-semibold text-foreground">
                      {percent.format(item.share)}
                    </span>
                  </div>
                  <div
                    aria-hidden
                    className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted"
                  >
                    <div
                      className={cn(
                        "h-full rounded-full",
                        STATUS_BAR_CLASS_NAME[item.key],
                      )}
                      style={{ width: `${item.share * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-5 text-sm font-semibold text-foreground">
            {copy.preview.contentTitle}
          </p>
          <ul className="mt-2 divide-y rounded-xl border">
            {ORGANIZATION_SAMPLE.topContent.map((item) => (
              <li
                key={item.key}
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <span className="min-w-0 text-foreground">
                  {copy.preview.content[item.key]}
                </span>
                <span className="shrink-0 font-semibold text-primary">
                  {percent.format(item.completion)}
                </span>
              </li>
            ))}
          </ul>
        </LandingSamplePanel>
      </div>
    </LandingSection>
  );
};

export default LandingOrganization;
