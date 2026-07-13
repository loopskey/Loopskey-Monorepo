import { PROFILE_TOTAL_SECTIONS } from "@professional/enums/profile-section.enum";
import { ProfileSectionKey } from "@professional/enums/profile-section.enum";
import { ProfileTermUsage } from "@prisma/client";
import { Injectable } from "@nestjs/common";

import * as T from "@professional/types/professional-profile.types";

@Injectable()
export class ProfessionalProfileCompletionService {
  private hasText(value?: string | null) {
    return typeof value === "string" && value.trim().length > 0;
  }

  private countTerms(
    profile: T.TProfessionalProfileWithTerms | null,
    usage: ProfileTermUsage,
  ) {
    if (!profile) return 0;
    return profile.terms.filter((item) => item.usage === usage).length;
  }

  private basicProfile(source: T.TCompletionSource) {
    const { profile } = source;
    const missing: string[] = [];
    if (!this.hasText(source.fullName)) missing.push("fullName");
    if (!source.isEmailVerified) missing.push("email");
    if (!this.hasText(profile?.countryCode)) missing.push("countryCode");
    if (!profile?.language) missing.push("language");
    if (!this.hasText(profile?.timeZone)) missing.push("timeZone");
    return missing;
  }

  private professionalDetails(source: T.TCompletionSource) {
    const { profile } = source;
    const missing: string[] = [];
    if (!this.hasText(profile?.profession)) missing.push("profession");
    if (!profile?.industry) missing.push("industry");
    if (!this.hasText(profile?.currentRole)) missing.push("currentRole");
    if (!profile?.experienceRange) missing.push("experienceRange");
    if (!this.hasText(profile?.workLocation)) missing.push("workLocation");
    if (!this.hasText(profile?.professionalSummary))
      missing.push("professionalSummary");
    return missing;
  }

  private skillsAndInterests(source: T.TCompletionSource) {
    const { profile } = source;
    const missing: string[] = [];
    if (!this.countTerms(profile, ProfileTermUsage.MAIN_SKILL))
      missing.push("mainSkillAreaIds");
    if (!this.countTerms(profile, ProfileTermUsage.FAVORITE_SUBJECT))
      missing.push("favoriteSubjectIds");
    if (!profile?.currentSkillLevel) missing.push("currentSkillLevel");
    if (!profile?.targetSkillLevel) missing.push("targetSkillLevel");
    if (!this.countTerms(profile, ProfileTermUsage.SKILL_TO_IMPROVE))
      missing.push("skillsToImproveIds");
    return missing;
  }

  private certifications(source: T.TCompletionSource) {
    const missing: string[] = [];
    if (source.credentialCount < 1) missing.push("credentials");
    return missing;
  }

  private preferences(source: T.TCompletionSource) {
    const { profile } = source;
    const missing: string[] = [];
    if (!profile?.preferredLearningFormats.length)
      missing.push("preferredLearningFormats");
    if (!profile?.learningTimeCommitment)
      missing.push("learningTimeCommitment");
    if (!profile?.learningBudgetPreference)
      missing.push("learningBudgetPreference");
    return missing;
  }

  calculate(source: T.TCompletionSource): T.TProfileCompletion {
    const sections: T.TProfileSectionStatus[] = [
      {
        key: ProfileSectionKey.BASIC_PROFILE,
        missingFields: this.basicProfile(source),
        isComplete: false,
      },
      {
        key: ProfileSectionKey.PROFESSIONAL_DETAILS,
        missingFields: this.professionalDetails(source),
        isComplete: false,
      },
      {
        key: ProfileSectionKey.SKILLS_INTERESTS,
        missingFields: this.skillsAndInterests(source),
        isComplete: false,
      },
      {
        key: ProfileSectionKey.CERTIFICATIONS,
        missingFields: this.certifications(source),
        isComplete: false,
      },
      {
        key: ProfileSectionKey.PREFERENCES,
        missingFields: this.preferences(source),
        isComplete: false,
      },
    ].map((section) => ({
      ...section,
      isComplete: section.missingFields.length === 0,
    }));

    const completedCount = sections.filter(
      (section) => section.isComplete,
    ).length;

    return {
      sections,
      completedCount,
      totalSections: PROFILE_TOTAL_SECTIONS,
      percentage: Math.round((completedCount / PROFILE_TOTAL_SECTIONS) * 100),
    };
  }
}
