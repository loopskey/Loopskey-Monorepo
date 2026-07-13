import { ProfileSectionKey } from "@professional/enums/profile-section.enum";
import { ProfileTaxonomyKind, ProfileTermUsage } from "@prisma/client";
import { Prisma, ProfileTaxonomyTerm } from "@prisma/client";

export const professionalProfileArgs =
  Prisma.validator<Prisma.ProfessionalProfileDefaultArgs>()({
    include: {
      terms: {
        include: { term: true },
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
  terms: ProfileTaxonomyTerm[];
};

export type TTermSelection = {
  ids: string[];
  usage: ProfileTermUsage;
};
