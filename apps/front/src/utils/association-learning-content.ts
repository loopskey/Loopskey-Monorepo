import { AssociationAudienceKind } from "@/lib/graphql/base";
import { TParams } from "@/types/providers.types";

type TTarget = {
  groupId?: string | null;
  memberId?: string | null;
  label?: string | null;
};

export const audienceSummaryLabel = (
  audienceKind: AssociationAudienceKind,
  targets: TTarget[],
  t: (key: string, params?: TParams) => string,
) => {
  if (audienceKind === AssociationAudienceKind.AllMembers)
    return t("associationDashboard.requirements.audience.ALL_MEMBERS");

  if (audienceKind === AssociationAudienceKind.Group) {
    const names = targets
      .filter((target) => target.groupId)
      .map((target) => target.label)
      .filter((label): label is string => Boolean(label));
    return names.length
      ? names.join(", ")
      : t("associationDashboard.learningContent.assignment.noGroups");
  }

  const memberCount = targets.filter((target) => target.memberId).length;
  return t("associationDashboard.learningContent.assignment.membersCount", {
    count: memberCount,
  });
};
