import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";
import { ProfessionalTaxonomyTermEntity } from "@professional/entities/professional-profile-taxonomy.entity";
import { ProfessionalCredentialEntity } from "@professional/entities/professional-credential.entity";
import { ProfessionalGqlObjectNames } from "@professional/enums/gql-names.enum";
import { ProfileSectionKey } from "@professional/enums/profile-section.enum";

import * as P from "@prisma/client";

@ObjectType(ProfessionalGqlObjectNames.PROFESSIONAL_PROFILE_SECTION)
export class ProfessionalProfileSectionEntity {
  @Field(() => Boolean) isComplete: boolean;
  @Field(() => [String]) missingFields: string[];
  @Field(() => ProfileSectionKey) key: ProfileSectionKey;
}

@ObjectType(ProfessionalGqlObjectNames.PROFESSIONAL_PROFILE_COMPLETION)
export class ProfessionalProfileCompletionEntity {
  @Field(() => Int) percentage: number;
  @Field(() => Int) totalSections: number;
  @Field(() => Int) completedCount: number;
  @Field(() => [ProfessionalProfileSectionEntity])
  sections: ProfessionalProfileSectionEntity[];
}

@ObjectType(ProfessionalGqlObjectNames.PROFESSIONAL_DASHBOARD_PROFILE)
export class ProfessionalDashboardProfileEntity {
  @Field(() => ID) id: string;
  @Field(() => P.Role) role: P.Role;
  @Field(() => Float) learningHours: number;
  @Field(() => Int) coursesEnrolled: number;
  @Field(() => Int) certificatesEarned: number;
  @Field(() => Boolean) isEmailVerified: boolean;
  @Field(() => P.UserStatus) status: P.UserStatus;

  @Field(() => String, { nullable: true }) bio?: string | null;
  @Field(() => String, { nullable: true }) email?: string | null;
  @Field(() => String, { nullable: true }) phone?: string | null;
  @Field(() => String, { nullable: true }) fullName?: string | null;
  @Field(() => String, { nullable: true }) avatarUrl?: string | null;

  // Basic profile
  @Field(() => String, { nullable: true }) timeZone?: string | null;
  @Field(() => String, { nullable: true }) linkedInUrl?: string | null;
  @Field(() => String, { nullable: true }) countryCode?: string | null;
  @Field(() => P.AppLanguage, { nullable: true })
  language?: P.AppLanguage | null;

  // Professional details
  @Field(() => String, { nullable: true }) profession?: string | null;
  @Field(() => String, { nullable: true }) currentRole?: string | null;
  @Field(() => String, { nullable: true }) workLocation?: string | null;
  @Field(() => String, { nullable: true }) professionalSummary?: string | null;
  @Field(() => P.ProfessionalIndustry, { nullable: true })
  industry?: P.ProfessionalIndustry | null;
  @Field(() => P.ExperienceRange, { nullable: true })
  experienceRange?: P.ExperienceRange | null;

  // Skills and interests
  @Field(() => P.SkillLevel, { nullable: true })
  currentSkillLevel?: P.SkillLevel | null;
  @Field(() => P.SkillLevel, { nullable: true })
  targetSkillLevel?: P.SkillLevel | null;
  @Field(() => [ProfessionalTaxonomyTermEntity])
  mainSkillAreas: ProfessionalTaxonomyTermEntity[];
  @Field(() => [ProfessionalTaxonomyTermEntity])
  favoriteSubjects: ProfessionalTaxonomyTermEntity[];
  @Field(() => [ProfessionalTaxonomyTermEntity])
  skillsToImprove: ProfessionalTaxonomyTermEntity[];

  // Learning preferences
  @Field(() => [P.LearningFormat])
  preferredLearningFormats: P.LearningFormat[];
  @Field(() => P.LearningTimeCommitment, { nullable: true })
  learningTimeCommitment?: P.LearningTimeCommitment | null;
  @Field(() => P.LearningBudgetPreference, { nullable: true })
  learningBudgetPreference?: P.LearningBudgetPreference | null;

  @Field(() => [ProfessionalCredentialEntity])
  credentials: ProfessionalCredentialEntity[];

  @Field(() => ProfessionalProfileCompletionEntity)
  completion: ProfessionalProfileCompletionEntity;
}
