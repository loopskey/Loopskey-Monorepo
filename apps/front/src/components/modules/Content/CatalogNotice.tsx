"use client";

import { TCatalogNoticeProps } from "@/types/content-module.types";
import { LinkIcon, Hourglass } from "lucide-react";
import { buttonVariants } from "@ui/button";
import { LinkPending } from "@elements/link-pending";
import { GlassCard } from "@elements/glass-card";
import { useI18n } from "@/hooks/useI18n";

import Link from "next/link";

const NOTICE_ICON = {
  invalid: LinkIcon,
  expired: Hourglass,
} as const;

const CatalogNotice = ({ variant, restartHref }: TCatalogNoticeProps) => {
  const { t } = useI18n();
  const Icon = NOTICE_ICON[variant];

  return (
    <GlassCard className="p-10 text-center" glow={false}>
      <div
        role="status"
        className="relative z-10 mx-auto flex max-w-md flex-col items-center"
      >
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-8 w-8" aria-hidden />
        </div>
        <h2 className="text-xl font-extrabold">
          {t(`content.notice.${variant}.title`)}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {t(`content.notice.${variant}.description`)}
        </p>
        <Link
          href={restartHref}
          className={buttonVariants({ className: "mt-6" })}
        >
          {t("content.notice.restart")}
          <LinkPending />
        </Link>
      </div>
    </GlassCard>
  );
};

export default CatalogNotice;
