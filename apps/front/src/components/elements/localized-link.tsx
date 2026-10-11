"use client";

import { useLocalizedHref } from "@/hooks/useLocalizedHref";

import type { ComponentProps } from "react";

import Link from "next/link";

const LocalizedLink = ({ href, ...props }: ComponentProps<typeof Link>) => {
  const localize = useLocalizedHref();
  return (
    <Link href={typeof href === "string" ? localize(href) : href} {...props} />
  );
};

export default LocalizedLink;
