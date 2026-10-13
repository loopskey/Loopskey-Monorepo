"use client";

import { TContentCatalogPaginationProps } from "@/types/content-module.types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@ui/button";
import { LinkPending } from "@elements/link-pending";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/utils";

import Link from "@elements/localized-link";

const DISABLED_CLASS_NAME = "pointer-events-none opacity-50";

const ContentCatalogPagination = ({
  nextHref,
  totalCount,
  previousHref,
}: TContentCatalogPaginationProps) => {
  const { t, language } = useI18n();

  return (
    <nav
      aria-label={t("content.pagination.label")}
      className="flex flex-col items-center justify-between gap-4 border-t pt-4 sm:flex-row"
    >
      <p className="text-sm tabular-nums text-muted-foreground">
        {t("content.pagination.total", {
          total: new Intl.NumberFormat(language).format(totalCount),
        })}
      </p>

      <div className="flex items-center gap-3">
        {previousHref ? (
          <Link
            rel="prev"
            href={previousHref}
            className={buttonVariants({ variant: "outline" })}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            {t("content.pagination.previous")}
            <LinkPending />
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className={cn(
              buttonVariants({ variant: "outline" }),
              DISABLED_CLASS_NAME,
            )}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            {t("content.pagination.previous")}
          </span>
        )}

        {nextHref ? (
          <Link rel="next" href={nextHref} className={buttonVariants()}>
            {t("content.pagination.next")}
            <ChevronRight className="h-4 w-4" aria-hidden />
            <LinkPending />
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className={cn(buttonVariants(), DISABLED_CLASS_NAME)}
          >
            {t("content.pagination.next")}
            <ChevronRight className="h-4 w-4" aria-hidden />
          </span>
        )}
      </div>
    </nav>
  );
};

export default ContentCatalogPagination;
