import { ProfileSectionKey } from "@professional/enums/profile-section.enum";
import { ProfileTaxonomyKind, ProfileTermUsage } from "@prisma/client";
import { TAXONOMY_TERM_SELECT } from "@professional/utils/profile-taxonomy.util";
import { type TaxonomyTerm } from "@professional/utils/profile-taxonomy.util";
import { Prisma } from "@prisma/client";

export const professionalProfileArgs =
  Prisma.validator<Prisma.ProfessionalProfileDefaultArgs>()({
    include: {
      terms: {
        include: { term: { select: TAXONOMY_TERM_SELECT } },
        orderBy: { term: { sortOrder: "asc" } },
      },
    },
  });

export type TProfessionalProfileWithTerms =
  Prisma.ProfessionalProfileGetPayload<typeof professionalProfileArgs>;

export type TProfileSectionStatus = {
  key: ProfileSectionKey;
  isComplete: boolean;
  missingFields: string[];
};

export type TProfileCompletion = {
  percentage: number;
  completedCount: number;
  totalSections: number;
  sections: TProfileSectionStatus[];
};

export type TCompletionSource = {
  fullName: string | null;
  isEmailVerified: boolean;
  profile: TProfessionalProfileWithTerms | null;
  credentialCount: number;
};

export type TTaxonomyGroup = {
  kind: ProfileTaxonomyKind;
  groupKey: string;
  groupLabel: string;
  terms: TaxonomyTerm[];
};

export type TTermSelection = {
  ids: string[];
  usage: ProfileTermUsage;
};
