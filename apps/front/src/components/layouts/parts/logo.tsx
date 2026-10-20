import { cn } from "@/lib/utils";

import Image from "next/image";
import Link from "@elements/localized-link";

type LogoProps = {
  variant?: "default" | "onPrimary";
  className?: string;
};

export const Logo = ({ variant = "default", className }: LogoProps) => {
  const isOnPrimary = variant === "onPrimary";

  return (
    <Link href="/" className={cn("flex flex-shrink-0 items-center", className)}>
      <Image
        width={567}
        height={193}
        alt="Loopskey-logo"
        className="h-10 w-auto md:h-11"
        src={isOnPrimary ? "/Loopskey.svg" : "/Loopskey-light.svg"}
      />
    </Link>
  );
};
