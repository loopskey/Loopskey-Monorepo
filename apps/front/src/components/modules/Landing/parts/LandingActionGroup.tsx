import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

import type { LandingSessionIntent } from "@/utils/landing-actions";

import Link from "@elements/localized-link";

import { landingActionClassName } from "./landing-action-variants";
import LandingSessionAction from "./LandingSessionAction";

import type { LandingActionVariant } from "./landing-action-variants";
import type { LandingActionSize } from "./landing-action-variants";

export type LandingAction =
  | {
      kind: "link";
      key: string;
      href: string;
      label: string;
      variant: LandingActionVariant;
      withArrow?: boolean;
    }
  | {
      kind: "session";
      key: string;
      intent: LandingSessionIntent;
      variant: LandingActionVariant;
      withArrow?: boolean;
    };

type LandingActionGroupProps = {
  actions: readonly LandingAction[];
  size?: LandingActionSize;
  align?: "start" | "center";
  className?: string;
};

const LandingActionGroup = ({
  actions,
  size = "lg",
  align = "start",
  className,
}: LandingActionGroupProps) => (
  <div
    className={cn(
      "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center",
      align === "center" && "sm:justify-center",
      className,
    )}
  >
    {actions.map((action) =>
      action.kind === "session" ? (
        <LandingSessionAction
          key={action.key}
          size={size}
          intent={action.intent}
          variant={action.variant}
          withArrow={action.withArrow}
        />
      ) : (
        <Link
          key={action.key}
          href={action.href}
          className={landingActionClassName(action.variant, size)}
        >
          {action.label}
          {action.withArrow ? <ArrowRight aria-hidden /> : null}
        </Link>
      ),
    )}
  </div>
);

export default LandingActionGroup;
