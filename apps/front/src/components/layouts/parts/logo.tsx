import { cn } from "@/lib/utils";

import Image from "next/image";
import Link from "@elements/localized-link";

type LogoProps = {
  variant?: "default" | "onPrimary";
  className?: string;
  label?: string;
};

export const Logo = ({
  variant = "default",
  className,
  label = "LoopsKey",
}: LogoProps) => {
  const isOnPrimary = variant === "onPrimary";

  return (
    <Link href="/" className={cn("flex flex-shrink-0 items-center", className)}>
      <Image
        width={205}
        height={54}
        alt={label}
        className="h-8 w-auto"
        src={isOnPrimary ? "/Loopskey.svg" : "/Loopskey-light.svg"}
      />
    </Link>
  );
};
