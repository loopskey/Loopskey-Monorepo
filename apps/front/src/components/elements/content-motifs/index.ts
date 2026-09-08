import type { ReactElement } from "react";

import { AiMotif } from "./ai";
import { BusinessMotif } from "./business";
import { CareerMotif } from "./career";
import { ComplianceMotif } from "./compliance";
import { CpdMotif } from "./cpd";
import { DataMotif } from "./data";
import { DesignMotif } from "./design";
import { EducationMotif } from "./education";
import { EngineeringMotif } from "./engineering";
import { FinanceMotif } from "./finance";
import { HealthcareMotif } from "./healthcare";
import { LeadershipMotif } from "./leadership";
import { MarketingMotif } from "./marketing";
import { TechnologyMotif } from "./technology";
import { OtherMotif } from "./other";

export type ContentMotif = () => ReactElement;

export const CONTENT_MOTIFS = {
  AI: AiMotif,
  BUSINESS: BusinessMotif,
  CAREER: CareerMotif,
  COMPLIANCE: ComplianceMotif,
  CPD: CpdMotif,
  DATA: DataMotif,
  DESIGN: DesignMotif,
  EDUCATION: EducationMotif,
  ENGINEERING: EngineeringMotif,
  FINANCE: FinanceMotif,
  HEALTHCARE: HealthcareMotif,
  LEADERSHIP: LeadershipMotif,
  MARKETING: MarketingMotif,
  TECHNOLOGY: TechnologyMotif,
  OTHER: OtherMotif,
} as const satisfies Record<string, ContentMotif>;

export type ContentMotifKey = keyof typeof CONTENT_MOTIFS;

export const CONTENT_MOTIF_VIEW_BOX = "0 0 160 120";

export const resolveContentMotif = (category?: string | null) => {
  const key = category?.trim().toUpperCase();
  if (key && key in CONTENT_MOTIFS)
    return CONTENT_MOTIFS[key as ContentMotifKey];
  return CONTENT_MOTIFS.OTHER;
};
