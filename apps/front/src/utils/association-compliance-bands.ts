import { AssociationComplianceBand } from "@/lib/graphql/base";
import { semanticChartColor } from "@hooks/useChartPalette";

import type { TChartSemantic } from "@hooks/useChartPalette";

export const ASSOCIATION_BAND_ORDER = [
  AssociationComplianceBand.RenewalReady,
  AssociationComplianceBand.OnTrack,
  AssociationComplianceBand.AtRisk,
  AssociationComplianceBand.NotStarted,
] as const;

export const ASSOCIATION_BAND_SEMANTICS: Record<
  AssociationComplianceBand,
  TChartSemantic
> = {
  [AssociationComplianceBand.RenewalReady]: "renewalReady",
  [AssociationComplianceBand.OnTrack]: "onTrack",
  [AssociationComplianceBand.AtRisk]: "atRisk",
  [AssociationComplianceBand.NotStarted]: "notStarted",
};

export const ASSOCIATION_BAND_VARIANTS = {
  [AssociationComplianceBand.RenewalReady]: "default",
  [AssociationComplianceBand.OnTrack]: "default",
  [AssociationComplianceBand.AtRisk]: "orange",
  [AssociationComplianceBand.NotStarted]: "secondary",
} as const;

export const NEUTRAL_CHART_SLOT = 1;

export const bandChartColor = (
  palette: string[],
  band: AssociationComplianceBand,
) => semanticChartColor(palette, ASSOCIATION_BAND_SEMANTICS[band]);
