"use client";

import { useAuthStepHeight } from "@/hooks/useAuthStepHeight";
import { TAuthStepPanel } from "@/types/auth-module.types";
import { cn } from "@lib/utils";

const AuthStepPanel = ({
  children,
  stepKey,
  className,
  minHeight = 0,
}: TAuthStepPanel) => {
  const { height, contentRef } = useAuthStepHeight({ stepKey, minHeight });

  return (
    <div
      style={{ height }}
      className={cn(
        "relative w-full overflow-hidden transition-[height] duration-300 ease-out",
        className,
      )}
    >
      <div
        key={stepKey}
        ref={contentRef}
        className="animate-in fade-in-0 slide-in-from-top-2 w-full duration-300 ease-out"
      >
        {children}
      </div>
    </div>
  );
};

export default AuthStepPanel;
