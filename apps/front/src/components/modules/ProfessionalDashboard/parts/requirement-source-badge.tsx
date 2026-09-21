"use client";

import { Badge } from "@ui/badge";

import type { I18nContextValue } from "@/types/providers.types";
import type { TRequirementSource } from "@/types/professional-requirement.types";

import * as L from "lucide-react";

export const RequirementSourceBadge = ({
  t,
  source,
}: {
  t: I18nContextValue["t"];
  source: TRequirementSource;
}) => (
  <Badge variant={source === "ASSOCIATION" ? "default" : "secondary"}>
    {source === "ASSOCIATION" ? (
      <L.Building2 aria-hidden />
    ) : (
      <L.UserRound aria-hidden />
    )}
    {t(`cpdProgress.requirements.source.${source}`)}
  </Badge>
);
