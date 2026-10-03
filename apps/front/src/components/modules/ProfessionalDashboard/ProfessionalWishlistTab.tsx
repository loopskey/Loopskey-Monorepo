"use client";

import { contentTypeOptions, sortOptions } from "@/utils/constant";
import { ContentType, WishlistSortBy } from "@/lib/graphql/base";
import { useProfessionalWishlistTab } from "@/hooks/useProfessionalWishlistTab";
import { ContentPagination } from "@elements/pagination";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";
import { Input } from "@ui/input";
import { Label } from "@ui/label";

import type { TContentThumbnailKind } from "@/types/element.types";

import ContentCard from "@elements/content-card";
import Link from "next/link";

import * as L from "lucide-react";

const THUMBNAIL_KIND: Record<ContentType, TContentThumbnailKind> = {
  [ContentType.Course]: "course",
  [ContentType.Event]: "event",
  [ContentType.Podcast]: "podcast",
  [ContentType.Youtube]: "youtube",
};

const ProfessionalWishlistTab = () => {
  const {
    t,
    page,
    goNext,
    filters,
    isEmpty,
    totalPages,
    totalCount,
    isFetching,
    goPrevious,
    isRemoving,
    hasNextPage,
    canPrevious,
    updateFilter,
    resetFilters,
    handleRemove,
    wishlistItems,
    isFilteredEmpty,
    hasActiveFilters,
  } = useProfessionalWishlistTab();

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-primary">
            {t("professionalDashboard.wishlist.eyebrow")}
          </p>

          <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
            {t("professionalDashboard.wishlist.title")}
          </h1>

          <p className="mt-2 max-w-3xl text-muted-foreground">
            {t("professionalDashboard.wishlist.description")}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {hasActiveFilters ? (
            <Button
              radius="xl"
              type="button"
              variant="outline"
              onClick={resetFilters}
              disabled={isFetching}
            >
              <L.RotateCcw className="h-4 w-4" />
              {t("common.reset")}
            </Button>
          ) : null}
        </div>
      </div>

      <GlassCard className="space-y-5">
        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-lg font-medium">
              {t("professionalDashboard.wishlist.filtersTitle")}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {t("professionalDashboard.wishlist.filtersDescription")}
            </p>
          </div>

          <Badge variant="secondary" className="w-fit rounded-full">
            {totalCount} {t("professionalDashboard.wishlist.items")}
          </Badge>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-2">
            <Label>{t("professionalDashboard.wishlist.searchLabel")}</Label>

            <div className="relative">
              <L.Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={filters.search}
                className="h-12 rounded-md pl-10"
                onChange={(event) => updateFilter("search", event.target.value)}
                placeholder={t("professionalDashboard.wishlist.search")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("professionalDashboard.wishlist.sortBy")}</Label>

            <select
              value={filters.sortBy}
              onChange={(event) =>
                updateFilter("sortBy", event.target.value as WishlistSortBy)
              }
              className="h-12 w-full rounded-md border border-input bg-background px-4 text-sm outline-none transition-colors focus:border-primary/55 focus:ring-2 focus:ring-primary/20"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {contentTypeOptions.map((option) => {
            const Icon = option.icon;
            const isActive = filters.contentType === option.value;

            return (
              <Button
                radius="xl"
                type="button"
                key={option.value}
                variant={isActive ? "default" : "outline"}
                onClick={() =>
                  updateFilter(
                    "contentType",
                    option.value as "ALL" | ContentType,
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {option.label}
              </Button>
            );
          })}
        </div>
      </GlassCard>

      {isEmpty ? (
        <GlassCard>
          <div className="flex min-h-72 flex-col items-center justify-center text-center">
            <div className="rounded-full bg-primary/10 p-4 text-primary">
              <L.Heart className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-xl font-medium">
              {t("professionalDashboard.wishlist.emptyTitle")}
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              {t("professionalDashboard.wishlist.emptyDescription")}
            </p>
          </div>
        </GlassCard>
      ) : isFilteredEmpty ? (
        <GlassCard>
          <div className="flex min-h-72 flex-col items-center justify-center text-center">
            <div className="rounded-full bg-primary/10 p-4 text-primary">
              <L.FilterX className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-xl font-medium">
              {t("professionalDashboard.wishlist.noResultsTitle")}
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              {t("professionalDashboard.wishlist.noResultsDescription")}
            </p>
            <Button
              radius="xl"
              type="button"
              className="mt-5"
              onClick={resetFilters}
            >
              <L.RotateCcw className="h-4 w-4" />
              {t("common.reset")}
            </Button>
          </div>
        </GlassCard>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {wishlistItems.map((item) => {
              const content = item.content;
              const href = content?.url ?? "#";
              const title =
                content?.title ??
                t("professionalDashboard.wishlist.contentTitle", {
                  type: item.contentType,
                  id: item.contentId.slice(0, 8),
                });

              return (
                <ContentCard
                  key={item.id}
                  item={{
                    id: item.contentId,
                    href,
                    kind: THUMBNAIL_KIND[item.contentType],
                    title,
                    status: item.contentType,
                    rating: content?.rating,
                    imageUrl: content?.imageUrl,
                    category: content?.category,
                    categoryCode: content?.category,
                    description: content?.description,
                    metaPrimary:
                      content?.providerName ??
                      t("professionalDashboard.wishlist.unknownProvider"),
                    metaSecondary: content?.isFree
                      ? t("common.free")
                      : `${content?.price ?? 0} ${content?.currency ?? "USD"}`,
                  }}
                  footerNote={
                    <>
                      {t("professionalDashboard.wishlist.savedAt")}{" "}
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString()
                        : "-"}
                    </>
                  }
                  overlay={
                    <Button
                      radius="full"
                      size="iconSm"
                      type="button"
                      variant="outline"
                      aria-label={t("common.remove")}
                      disabled={isRemoving}
                      onClick={() =>
                        handleRemove(item.contentType, item.contentId)
                      }
                      className="absolute right-2.5 top-2.5"
                    >
                      <L.Trash2 className="h-4 w-4" />
                    </Button>
                  }
                  action={
                    content?.url ? (
                      <Button
                        asChild
                        radius="lg"
                        type="button"
                        className="w-full"
                      >
                        <Link href={href}>
                          {t("professionalDashboard.wishlist.viewDetails")}
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        radius="lg"
                        type="button"
                        variant="outline"
                        className="w-full"
                        disabled
                      >
                        {t("professionalDashboard.wishlist.viewDetails")}
                      </Button>
                    )
                  }
                />
              );
            })}
          </div>

          <ContentPagination
            page={page}
            onNext={goNext}
            isLoading={isFetching}
            onPrevious={goPrevious}
            totalCount={totalCount}
            hasNextPage={hasNextPage}
            canPrevious={canPrevious}
          />

          <p className="text-center text-xs text-muted-foreground">
            {t("professionalDashboard.wishlist.pageSummary", {
              page,
              totalPages,
            })}
          </p>
        </>
      )}
    </div>
  );
};

export default ProfessionalWishlistTab;
