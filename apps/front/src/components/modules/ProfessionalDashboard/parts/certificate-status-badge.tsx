"use client";

import { CertificateStatus } from "@/lib/graphql/generated";
import { I18nContextValue } from "@/types/providers.types";
import { Badge } from "@ui/badge";
import { cn } from "@/lib/utils";

import * as H from "@/utils/certificates.helper";
import * as L from "lucide-react";

const CERTIFICATES = "professionalDashboard.certificates";

/**
 * Status is never conveyed by colour alone: every badge carries an icon and the
 * translated status name, so it survives greyscale and screen readers.
 */
const TONE_CLASS: Record<
  (typeof H.CERTIFICATE_STATUS_TONE)[CertificateStatus],
  string
> = {
  active: "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  warning: "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-300",
  danger: "border-transparent bg-destructive/15 text-destructive",
  neutral: "border-transparent bg-muted text-muted-foreground",
};

const TONE_ICON: Record<
  (typeof H.CERTIFICATE_STATUS_TONE)[CertificateStatus],
  typeof L.BadgeCheck
> = {
  active: L.BadgeCheck,
  warning: L.CalendarClock,
  danger: L.CircleAlert,
  neutral: L.CircleSlash,
};

export const CertificateStatusBadge = ({
  t,
  status,
  className,
}: {
  status: CertificateStatus;
  className?: string;
  t: I18nContextValue["t"];
}) => {
  const tone = H.CERTIFICATE_STATUS_TONE[status] ?? "neutral";
  const Icon = TONE_ICON[tone];

  return (
    <Badge className={cn("gap-1.5", TONE_CLASS[tone], className)}>
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {t(`${CERTIFICATES}.statuses.${status}`)}
    </Badge>
  );
};
