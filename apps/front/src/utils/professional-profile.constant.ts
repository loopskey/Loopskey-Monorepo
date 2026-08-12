import { TProfessionalProfileTab } from "@/types/professional-profile.types";
import { TSelectOption } from "@/types/element.types";
import { API_ORIGIN } from "@/utils/avatar.util";

import * as countries from "i18n-iso-countries";
import * as API from "@/lib/graphql/base";
import * as L from "lucide-react";

import enCountries from "i18n-iso-countries/langs/en.json";
import frCountries from "i18n-iso-countries/langs/fr.json";

// ================= Tabs =================
export const PROFILE_TABS: TProfessionalProfileTab[] = [
  "basic",
  "skills",
  "details",
  "preferences",
  "certifications",
];

export const SECTION_TAB_MAP: Record<
  API.ProfileSectionKey,
  TProfessionalProfileTab
> = {
  [API.ProfileSectionKey.BasicProfile]: "basic",
  [API.ProfileSectionKey.ProfessionalDetails]: "details",
  [API.ProfileSectionKey.SkillsInterests]: "skills",
  [API.ProfileSectionKey.Certifications]: "certifications",
  [API.ProfileSectionKey.Preferences]: "preferences",
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
  API.ProfessionalIndustry.Technology,
  API.ProfessionalIndustry.Healthcare,
  API.ProfessionalIndustry.Finance,
  API.ProfessionalIndustry.Education,
  API.ProfessionalIndustry.Engineering,
  API.ProfessionalIndustry.Construction,
  API.ProfessionalIndustry.Legal,
  API.ProfessionalIndustry.Marketing,
  API.ProfessionalIndustry.Manufacturing,
  API.ProfessionalIndustry.PublicSector,
  API.ProfessionalIndustry.NonProfit,
  API.ProfessionalIndustry.Other,
] as const;

export const EXPERIENCE_RANGES = [
  API.ExperienceRange.LessThanOneYear,
  API.ExperienceRange.OneToTwoYears,
  API.ExperienceRange.ThreeToFiveYears,
  API.ExperienceRange.SixToTenYears,
  API.ExperienceRange.ElevenToFifteenYears,
  API.ExperienceRange.SixteenPlusYears,
] as const;

export const SKILL_LEVELS = [
  API.SkillLevel.Beginner,
  API.SkillLevel.Intermediate,
  API.SkillLevel.Advanced,
  API.SkillLevel.Expert,
] as const;

export const LEARNING_FORMATS = [
  API.LearningFormat.Course,
  API.LearningFormat.Webinar,
  API.LearningFormat.Workshop,
  API.LearningFormat.Video,
  API.LearningFormat.Podcast,
  API.LearningFormat.Article,
] as const;

export const LEARNING_TIME_COMMITMENTS = [
  API.LearningTimeCommitment.LessThanOneHour,
  API.LearningTimeCommitment.OneToThreeHours,
  API.LearningTimeCommitment.FourToSixHours,
  API.LearningTimeCommitment.SevenToTenHours,
  API.LearningTimeCommitment.MoreThanTenHours,
] as const;

export const LEARNING_BUDGET_PREFERENCES = [
  API.LearningBudgetPreference.FreeOnly,
  API.LearningBudgetPreference.MixedFreeAndPaid,
  API.LearningBudgetPreference.Premium,
  API.LearningBudgetPreference.EmployerSponsored,
] as const;

export const PROFILE_LANGUAGES = [
  API.AppLanguage.En,
  API.AppLanguage.Fr,
] as const;

export const LEARNING_FORMAT_ICONS: Record<API.LearningFormat, L.LucideIcon> = {
  [API.LearningFormat.Course]: L.BookOpen,
  [API.LearningFormat.Webinar]: L.MonitorPlay,
  [API.LearningFormat.Workshop]: L.Wrench,
  [API.LearningFormat.Video]: L.Video,
  [API.LearningFormat.Podcast]: L.Mic,
  [API.LearningFormat.Article]: L.FileText,
};

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

export const getCountryName = (
  code: string | null | undefined,
  locale: string,
) => {
  if (!code) return null;
  const language = locale.toLowerCase().startsWith("fr") ? "fr" : "en";
  return countries.getName(code, language, { select: "official" }) ?? code;
};

export const isSupportedCountryCode = (code: string) => countries.isValid(code);

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
