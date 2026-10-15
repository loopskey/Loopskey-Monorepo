import { AssociationComplianceBand } from "@/lib/graphql/base";
import { CHART_COLOR } from "@/utils/chart.util";

export const ASSOCIATION_BAND_ORDER = [
  AssociationComplianceBand.RenewalReady,
  AssociationComplianceBand.OnTrack,
  AssociationComplianceBand.AtRisk,
  AssociationComplianceBand.NotStarted,
] as const;

export const ASSOCIATION_BAND_COLORS: Record<AssociationComplianceBand, string> =
  {
    [AssociationComplianceBand.RenewalReady]: CHART_COLOR.good,
    [AssociationComplianceBand.OnTrack]: CHART_COLOR.onTrack,
    [AssociationComplianceBand.AtRisk]: CHART_COLOR.warning,
    [AssociationComplianceBand.NotStarted]: CHART_COLOR.track,
  };

export const isLightBand = (band: AssociationComplianceBand) =>
  band === AssociationComplianceBand.NotStarted;

export const ASSOCIATION_BAND_VARIANTS = {
  [AssociationComplianceBand.RenewalReady]: "default",
  [AssociationComplianceBand.OnTrack]: "default",
  [AssociationComplianceBand.AtRisk]: "orange",
  [AssociationComplianceBand.NotStarted]: "secondary",
} as const;
