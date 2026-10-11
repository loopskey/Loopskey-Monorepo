"use client";

import { TEmptyStateProps } from "@/types/content-module.types";
import { buttonVariants } from "@ui/button";
import { LinkPending } from "@elements/link-pending";
import { GlassCard } from "@elements/glass-card";
import { SearchX } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

import Link from "@elements/localized-link";

const EmptyState = ({ resetHref }: TEmptyStateProps) => {
  const { t } = useI18n();

  return (
    <GlassCard className="p-10 text-center" glow={false}>
      <div className="relative z-10 mx-auto flex max-w-md flex-col items-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <SearchX className="h-8 w-8" aria-hidden />
        </div>
        <h3 className="text-xl font-extrabold">{t("content.empty.title")}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {t("content.empty.description")}
        </p>
        {resetHref ? (
          <Link
            href={resetHref}
            className={buttonVariants({ className: "mt-6" })}
          >
            {t("content.filters.reset")}
            <LinkPending />
          </Link>
        ) : null}
      </div>
    </GlassCard>
  );
};

export default EmptyState;
