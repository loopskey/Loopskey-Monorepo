import { z } from "zod";

import * as C from "@/utils/professional-profile.constant";
import * as GQL from "@/lib/graphql/generated";

const optionalText = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((value) => (value ? value : undefined));

// =============== Basic profile ===============
export const basicProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "professionalDashboard.profile.errors.fullNameMin")
    .max(120, "professionalDashboard.profile.errors.fullNameMax"),
  linkedInUrl: z
    .string()
    .trim()
    .regex(
      /^https:\/\/(www\.)?linkedin\.com\/.+$/i,
      "professionalDashboard.profile.errors.linkedInUrl",
    )
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
  countryCode: z
    .string()
    .trim()
    .refine(
      (value) => C.isSupportedCountryCode(value),
      "professionalDashboard.profile.errors.country",
    )
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
  language: z.nativeEnum(GQL.AppLanguage).optional(),
  timeZone: z
    .string()
    .trim()
    .refine(
      (value) => C.getTimeZones().includes(value),
      "professionalDashboard.profile.errors.timeZone",
    )
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
});

export type TBasicProfileFormInput = z.input<typeof basicProfileSchema>;
export type TBasicProfileFormValues = z.output<typeof basicProfileSchema>;

// =============== Professional details ===============
export const professionalDetailsSchema = z.object({
  profession: optionalText,
  industry: z.nativeEnum(GQL.ProfessionalIndustry).optional(),
  currentRole: optionalText,
  experienceRange: z.nativeEnum(GQL.ExperienceRange).optional(),
  workLocation: optionalText,
  professionalSummary: z
    .string()
    .trim()
    .max(
      C.PROFESSIONAL_SUMMARY_MAX_LENGTH,
      "professionalDashboard.profile.errors.summaryMax",
    )
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
});

export type TDetailsFormInput = z.input<typeof professionalDetailsSchema>;
export type TDetailsFormValues = z.output<typeof professionalDetailsSchema>;

// =============== Skills and interests ===============
const termIds = z
  .array(z.string())
  .max(
    C.MAX_SELECTED_TERMS,
    "professionalDashboard.profile.errors.tooManySelected",
  );

export const professionalSkillsSchema = z.object({
  mainSkillAreaIds: termIds,
  favoriteSubjectIds: termIds,
  skillsToImproveIds: termIds,
  currentSkillLevel: z.nativeEnum(GQL.SkillLevel).optional(),
  targetSkillLevel: z.nativeEnum(GQL.SkillLevel).optional(),
});

export type TSkillsFormInput = z.input<typeof professionalSkillsSchema>;
export type TSkillsFormValues = z.output<typeof professionalSkillsSchema>;

// =============== Preferences ===============
export const professionalPreferencesSchema = z.object({
  preferredLearningFormats: z.array(z.nativeEnum(GQL.LearningFormat)),
  learningTimeCommitment: z.nativeEnum(GQL.LearningTimeCommitment).optional(),
  learningBudgetPreference: z
    .nativeEnum(GQL.LearningBudgetPreference)
    .optional(),
});

export type TPreferencesFormInput = z.input<
  typeof professionalPreferencesSchema
>;
export type TPreferencesFormValues = z.output<
  typeof professionalPreferencesSchema
>;

// =============== Credentials ===============
export const credentialSchema = z
  .object({
    id: z.string().optional(),
    name: z
      .string()
      .trim()
      .min(2, "professionalDashboard.profile.errors.credentialName")
      .max(200, "professionalDashboard.profile.errors.credentialName"),
    issuingOrganization: z
      .string()
      .trim()
      .min(2, "professionalDashboard.profile.errors.issuingOrganization")
      .max(200, "professionalDashboard.profile.errors.issuingOrganization"),
    licenceNumber: z
      .string()
      .trim()
      .max(
        C.LICENCE_NUMBER_MAX_LENGTH,
        "professionalDashboard.profile.errors.licenceNumberMax",
      )
      .optional()
      .or(z.literal(""))
      .transform((value) => (value ? value : undefined)),
    issueDate: z
      .string()
      .min(1, "professionalDashboard.profile.errors.issueDateRequired"),
    expiryDate: z
      .string()
      .optional()
      .or(z.literal(""))
      .transform((value) => (value ? value : undefined)),
    annualCpdHours: z
      .union([z.string(), z.number()])
      .optional()
      .transform((value) => {
        if (value === undefined || value === "") return undefined;
        return Number(value);
      })
      .refine(
        (value) =>
          value === undefined || (Number.isFinite(value) && value >= 0),
        "professionalDashboard.profile.errors.annualCpdHours",
      ),
    pduTargetId: z
      .string()
      .optional()
      .or(z.literal(""))
      .transform((value) => (value ? value : undefined)),
  })
  .refine(
    (values) =>
      !values.expiryDate ||
      new Date(values.expiryDate).getTime() >=
        new Date(values.issueDate).getTime(),
    {
      path: ["expiryDate"],
      message: "professionalDashboard.profile.errors.expiryBeforeIssue",
    },
  );

export type TCredentialFormInput = z.input<typeof credentialSchema>;
export type TCredentialFormValues = z.output<typeof credentialSchema>;
