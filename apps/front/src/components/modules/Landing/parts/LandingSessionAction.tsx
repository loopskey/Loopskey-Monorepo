"use client";

import { anonymousLandingLabelKey } from "@/utils/landing-actions";
import { resolveLandingSessionAction } from "@/utils/landing-actions";
import { usePublicSession } from "@/hooks/usePublicSession";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/utils";

import type { LandingSessionIntent } from "@/utils/landing-actions";

import Link from "@elements/localized-link";

import { landingActionClassName } from "./landing-action-variants";

import type { LandingActionVariant } from "./landing-action-variants";
import type { LandingActionSize } from "./landing-action-variants";

type LandingSessionActionProps = {
  intent: LandingSessionIntent;
  variant: LandingActionVariant;
  size: LandingActionSize;
  withArrow?: boolean;
};

const LandingSessionAction = ({
  intent,
  variant,
  size,
  withArrow = false,
}: LandingSessionActionProps) => {
  const { t } = useI18n();
  const { user, isCheckingSession } = usePublicSession();
  const className = landingActionClassName(variant, size);

  if (isCheckingSession) {
    return (
      <span
        aria-hidden
        className={cn(
          className,
          "pointer-events-none animate-pulse opacity-40 motion-reduce:animate-none",
        )}
      >
        <span className="invisible">{t(anonymousLandingLabelKey(intent))}</span>
      </span>
    );
  }

  const action = resolveLandingSessionAction(intent, user?.role ?? null);

  return (
    <Link href={action.href} className={className}>
      {t(action.labelKey)}
      {withArrow ? <ArrowRight aria-hidden /> : null}
    </Link>
  );
};

export default LandingSessionAction;
