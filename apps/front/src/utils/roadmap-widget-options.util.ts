import { LEARNING_BUDGET_PREFERENCES } from "@/utils/professional-profile.constant";
import { LEARNING_TIME_COMMITMENTS } from "@/utils/professional-profile.constant";
import { RoadmapDraftFieldKey } from "@/lib/graphql/base";
import { ROADMAP_YES_VALUE } from "@/utils/roadmap-chat.constant";
import { LEARNING_FORMATS } from "@/utils/professional-profile.constant";
import { ROADMAP_NO_VALUE } from "@/utils/roadmap-chat.constant";
import { DELIVERY_FORMATS } from "@/utils/professional-profile.constant";
import { SKILL_LEVELS } from "@/utils/professional-profile.constant";

import type * as T from "@/types/professional-roadmap-chat.types";

const OPTION_NS = "professionalDashboard.profile.options";

const ENUM_FIELD_OPTIONS: Partial<
  Record<RoadmapDraftFieldKey, { values: readonly string[]; ns: string }>
> = {
  [RoadmapDraftFieldKey.SkillLevel]: {
    values: SKILL_LEVELS,
    ns: `${OPTION_NS}.skillLevel`,
  },
  [RoadmapDraftFieldKey.TimeCommitment]: {
    values: LEARNING_TIME_COMMITMENTS,
    ns: `${OPTION_NS}.learningTime`,
  },
  [RoadmapDraftFieldKey.BudgetPreference]: {
    values: LEARNING_BUDGET_PREFERENCES,
    ns: `${OPTION_NS}.budget`,
  },
  [RoadmapDraftFieldKey.PreferredFormats]: {
    values: LEARNING_FORMATS,
    ns: `${OPTION_NS}.learningFormat`,
  },
  [RoadmapDraftFieldKey.PreferredDeliveryFormats]: {
    values: DELIVERY_FORMATS,
    ns: `${OPTION_NS}.deliveryFormat`,
  },
};

export const resolveWidgetOptions = (
  widget: Pick<T.TRoadmapWidget, "field" | "options">,
  t: (key: string) => string,
): T.TRoadmapWidgetOption[] => {
  if (widget.options.length) return widget.options;
  if (widget.field === RoadmapDraftFieldKey.CpdEnabled)
    return [
      {
        value: ROADMAP_YES_VALUE,
        label: t("professionalRoadmapChat.widget.yes"),
      },
      {
        value: ROADMAP_NO_VALUE,
        label: t("professionalRoadmapChat.widget.no"),
      },
    ];
  const enumOptions = ENUM_FIELD_OPTIONS[widget.field];
  if (enumOptions)
    return enumOptions.values.map((value) => ({
      value,
      label: t(`${enumOptions.ns}.${value}`),
    }));
  return [];
};
