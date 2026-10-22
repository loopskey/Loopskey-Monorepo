"use client";

import { isLocalizablePath } from "@/lib/i18n/locale";
import { useLocalizedHref } from "@/hooks/useLocalizedHref";
import { useI18n } from "@/hooks/useI18n";

import type { ComponentProps } from "react";

import Link from "next/link";

const LocalizedLink = ({
  href,
  prefetch,
  ...props
}: ComponentProps<typeof Link>) => {
  const { isRouteLocked } = useI18n();
  const localize = useLocalizedHref();
  const leavesPublicSite =
    isRouteLocked && typeof href === "string" && !isLocalizablePath(href);
  return (
    <Link
      href={typeof href === "string" ? localize(href) : href}
      prefetch={prefetch ?? (leavesPublicSite ? false : undefined)}
      {...props}
    />
  );
};

export default LocalizedLink;
