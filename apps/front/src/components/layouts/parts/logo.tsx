import type { TLogoProps } from "@/types/layouts.types";
import { cn } from "@/lib/utils";

import Image from "next/image";
import Link from "@elements/localized-link";

export const Logo = ({
  className,
  variant = "default",
  label = "LoopsKey",
}: TLogoProps) => {
  const isOnPrimary = variant === "onPrimary";

  return (
    <Link href="/" className={cn("flex flex-shrink-0 items-center", className)}>
      <Image
        width={567}
        alt={label}
        height={193}
        className="h-8 w-auto min-[380px]:h-10 md:h-11"
        src={isOnPrimary ? "/Loopskey.svg" : "/Loopskey-light.svg"}
      />
    </Link>
  );
};
