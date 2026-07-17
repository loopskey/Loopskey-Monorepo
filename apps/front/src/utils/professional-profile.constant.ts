import { TProfessionalProfileTab } from "@/types/professional-profile.types";
import { API_ORIGIN } from "@/utils/avatar.util";
import { TSelectOption } from "@/types/element.types";

import * as GQL from "@/lib/graphql/generated";
import * as L from "lucide-react";
import * as countries from "i18n-iso-countries";

import enCountries from "i18n-iso-countries/langs/en.json";
import frCountries from "i18n-iso-countries/langs/fr.json";

// ================= Tabs =================
export const PROFILE_TABS: TProfessionalProfileTab[] = [
  "basic",
  "details",
  "skills",
  "certifications",
  "preferences",
];

/**
 * Maps each backend completion section onto the tab that owns it, so an
 * incomplete section can activate the right tab.
 */
export const SECTION_TAB_MAP: Record<
  GQL.ProfileSectionKey,
  TProfessionalProfileTab
> = {
  [GQL.ProfileSectionKey.BasicProfile]: "basic",
  [GQL.ProfileSectionKey.ProfessionalDetails]: "details",
  [GQL.ProfileSectionKey.SkillsInterests]: "skills",
  [GQL.ProfileSectionKey.Certifications]: "certifications",
  [GQL.ProfileSectionKey.Preferences]: "preferences",
};

export const PROFILE_TAB_I18N_KEY: Record<TProfessionalProfileTab, string> = {
  basic: "professionalDashboard.profile.tabs.basic",
  details: "professionalDashboard.profile.tabs.details",
  skills: "professionalDashboard.profile.tabs.skills",
  certifications: "professionalDashboard.profile.tabs.certifications",
  preferences: "professionalDashboard.profile.tabs.preferences",
};

// ================= Option values =================
export const INDUSTRIES = [
  GQL.ProfessionalIndustry.Technology,
  GQL.ProfessionalIndustry.Healthcare,
  GQL.ProfessionalIndustry.Finance,
  GQL.ProfessionalIndustry.Education,
  GQL.ProfessionalIndustry.Engineering,
  GQL.ProfessionalIndustry.Construction,
  GQL.ProfessionalIndustry.Legal,
  GQL.ProfessionalIndustry.Marketing,
  GQL.ProfessionalIndustry.Manufacturing,
  GQL.ProfessionalIndustry.PublicSector,
  GQL.ProfessionalIndustry.NonProfit,
  GQL.ProfessionalIndustry.Other,
] as const;

export const EXPERIENCE_RANGES = [
  GQL.ExperienceRange.LessThanOneYear,
  GQL.ExperienceRange.OneToTwoYears,
  GQL.ExperienceRange.ThreeToFiveYears,
  GQL.ExperienceRange.SixToTenYears,
  GQL.ExperienceRange.ElevenToFifteenYears,
  GQL.ExperienceRange.SixteenPlusYears,
] as const;

export const SKILL_LEVELS = [
  GQL.SkillLevel.Beginner,
  GQL.SkillLevel.Intermediate,
  GQL.SkillLevel.Advanced,
  GQL.SkillLevel.Expert,
] as const;

export const LEARNING_FORMATS = [
  GQL.LearningFormat.Course,
  GQL.LearningFormat.Webinar,
  GQL.LearningFormat.Workshop,
  GQL.LearningFormat.Video,
  GQL.LearningFormat.Podcast,
  GQL.LearningFormat.Article,
] as const;

export const LEARNING_TIME_COMMITMENTS = [
  GQL.LearningTimeCommitment.LessThanOneHour,
  GQL.LearningTimeCommitment.OneToThreeHours,
  GQL.LearningTimeCommitment.FourToSixHours,
  GQL.LearningTimeCommitment.SevenToTenHours,
  GQL.LearningTimeCommitment.MoreThanTenHours,
] as const;

export const LEARNING_BUDGET_PREFERENCES = [
  GQL.LearningBudgetPreference.FreeOnly,
  GQL.LearningBudgetPreference.MixedFreeAndPaid,
  GQL.LearningBudgetPreference.Premium,
  GQL.LearningBudgetPreference.EmployerSponsored,
] as const;

export const PROFILE_LANGUAGES = [GQL.AppLanguage.En, GQL.AppLanguage.Fr] as const;

export const LEARNING_FORMAT_ICONS: Record<GQL.LearningFormat, L.LucideIcon> = {
  [GQL.LearningFormat.Course]: L.BookOpen,
  [GQL.LearningFormat.Webinar]: L.MonitorPlay,
  [GQL.LearningFormat.Workshop]: L.Wrench,
  [GQL.LearningFormat.Video]: L.Video,
  [GQL.LearningFormat.Podcast]: L.Mic,
  [GQL.LearningFormat.Article]: L.FileText,
};

// Translated labels are resolved from these key suffixes at render time.
export const enumI18nKey = (group: string, value: string) =>
  `professionalDashboard.profile.options.${group}.${value}`;

// ================= Text limits =================
export const PROFESSIONAL_SUMMARY_MAX_LENGTH = 1000;
export const LICENCE_NUMBER_MAX_LENGTH = 100;
export const MAX_SELECTED_TERMS = 20;

// ================= Avatar upload =================
export const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;

export const ACCEPTED_AVATAR_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const ACCEPTED_AVATAR_ACCEPT_ATTRIBUTE = ".jpg,.jpeg,.png,.webp";

export const AVATAR_ENDPOINT = `${API_ORIGIN}/professional/profile/avatar`;

// ================= Countries =================
countries.registerLocale(enCountries);
countries.registerLocale(frCountries);

export const getCountryOptions = (locale: string): TSelectOption[] => {
  const language = locale.toLowerCase().startsWith("fr") ? "fr" : "en";
  const names = countries.getNames(language, { select: "official" });
  return Object.entries(names)
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, language));
};

export const getCountryName = (code: string | null | undefined, locale: string) => {
  if (!code) return null;
  const language = locale.toLowerCase().startsWith("fr") ? "fr" : "en";
  return countries.getName(code, language, { select: "official" }) ?? code;
};

export const isSupportedCountryCode = (code: string) =>
  countries.isValid(code);

// ================= Time zones =================
const FALLBACK_TIME_ZONES = [
  "UTC",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "America/New_York",
  "America/Toronto",
  "America/Los_Angeles",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

type TIntlWithSupportedValues = typeof Intl & {
  supportedValuesOf?: (key: "timeZone") => string[];
};

export const getTimeZones = (): string[] => {
  const intl = Intl as TIntlWithSupportedValues;
  if (typeof intl.supportedValuesOf === "function")
    return intl.supportedValuesOf("timeZone");
  return FALLBACK_TIME_ZONES;
};

const formatTimeZoneOffset = (timeZone: string) => {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "shortOffset",
    }).formatToParts(new Date());
    return parts.find((part) => part.type === "timeZoneName")?.value ?? "";
  } catch {
    return "";
  }
};

export const getTimeZoneOptions = (): TSelectOption[] =>
  getTimeZones().map((timeZone) => {
    const offset = formatTimeZoneOffset(timeZone);
    return {
      value: timeZone,
      label: offset ? `${timeZone.replace(/_/g, " ")} (${offset})` : timeZone,
    };
  });

export const getBrowserTimeZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
};

// ================= Routes =================
export const CERTIFICATES_TAB_HREF = "/dashboard/professional?tab=certificates";
export const SECURITY_SETTINGS_HREF = "/dashboard/professional?tab=settings";
