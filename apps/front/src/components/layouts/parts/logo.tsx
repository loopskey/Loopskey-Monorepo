import { cn } from "@/lib/utils";

import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  variant?: "default" | "onPrimary";
  className?: string;
};

export const Logo = ({ variant = "default", className }: LogoProps) => {
  const isOnPrimary = variant === "onPrimary";

  return (
    <Link
      href="/"
      className={cn(
        "flex flex-shrink-0 items-center rounded-md outline-none",
        "focus-visible:ring-2 focus-visible:ring-offset-2",
        isOnPrimary
          ? "focus-visible:ring-ring-on-primary focus-visible:ring-offset-primary"
          : "focus-visible:ring-ring focus-visible:ring-offset-background",
        className,
      )}
    >
      <Image
        priority
        width={205}
        height={54}
        alt="Loopskey-logo"
        className="h-8 w-auto"
        src={isOnPrimary ? "/Loopskey.svg" : "/Loopskey-light.svg"}
      />
    </Link>
  );
};
