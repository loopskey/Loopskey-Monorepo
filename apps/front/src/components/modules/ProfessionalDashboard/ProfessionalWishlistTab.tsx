"use client";

import { contentTypeIcon, contentTypeOptions } from "@/utils/constant";
import { ContentType, WishlistSortBy } from "@/lib/graphql/generated";
import { useProfessionalWishlistTab } from "@/hooks/useProfessionalWishlistTab";
import { ContentPagination } from "@elements/pagination";
import { sortOptions } from "@/utils/constant";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import { cn } from "@/lib/utils";

import Image from "next/image";
import Link from "next/link";

import * as L from "lucide-react";

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
    handleRefresh,
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
          {hasActiveFilters && (
            <Button
              radius="xl"
              type="button"
              variant="glass"
              onClick={resetFilters}
              disabled={isFetching}
            >
              <L.RotateCcw className="h-4 w-4" />
              {t("common.reset")}
            </Button>
          )}

          <Button
            radius="xl"
            type="button"
            variant="brand"
            disabled={isFetching}
            onClick={handleRefresh}
          >
            <L.RefreshCcw
              className={cn("h-4 w-4", isFetching && "animate-spin")}
            />
            {t("common.refresh")}
          </Button>
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
                className="h-12 rounded-2xl pl-10"
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
              className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none transition-colors focus:border-primary/55 focus:ring-2 focus:ring-primary/20"
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
                variant={isActive ? "brand" : "glass"}
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
              variant="brand"
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
              const Icon =
                contentTypeIcon[
                  item.contentType as keyof typeof contentTypeIcon
                ] ?? L.Heart;
              const href = content?.url ?? "#";
              const title =
                content?.title ??
                t("professionalDashboard.wishlist.contentTitle", {
                  type: item.contentType,
                  id: item.contentId.slice(0, 8),
                });

              return (
                <GlassCard
                  glow={false}
                  key={item.id}
                  className="overflow-hidden p-0"
                >
                  <div className="relative aspect-video rounded-t-[2rem] bg-muted">
                    {content?.imageUrl ? (
                      <Image
                        fill
                        alt={title}
                        src={content.imageUrl}
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                        <Icon className="h-10 w-10" />
                      </div>
                    )}
                    <Badge className="absolute left-4 top-4 rounded-full">
                      {item.contentType}
                    </Badge>
                    <Button
                      radius="full"
                      size="iconSm"
                      type="button"
                      variant="brandSoft"
                      disabled={isRemoving}
                      onClick={() =>
                        handleRemove(item.contentType, item.contentId)
                      }
                      className="absolute right-4 top-4"
                    >
                      <L.Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-4 p-5">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="line-clamp-2 text-base font-medium">
                          {title}
                        </h3>
                        <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                          <Icon className="h-4 w-4" />
                        </div>
                      </div>
                      {content?.description ? (
                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                          {content.description}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {content?.category ? (
                        <Badge variant="secondary" className="rounded-full">
                          {content.category}
                        </Badge>
                      ) : null}

                      {typeof content?.rating === "number" ? (
                        <Badge variant="secondary" className="rounded-full">
                          <L.Star className="mr-1 h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          {content.rating}
                        </Badge>
                      ) : null}
                    </div>

                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="line-clamp-1 text-muted-foreground">
                        {content?.providerName ??
                          t("professionalDashboard.wishlist.unknownProvider")}
                      </span>

                      <span className="shrink-0 font-medium text-primary">
                        {content?.isFree
                          ? t("common.free")
                          : `${content?.price ?? 0} ${
                              content?.currency ?? "USD"
                            }`}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {t("professionalDashboard.wishlist.savedAt")}{" "}
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString()
                        : "-"}
                    </p>

                    {content?.url ? (
                      <Button
                        asChild
                        radius="xl"
                        type="button"
                        variant="brand"
                        className="w-full"
                      >
                        <Link href={href}>
                          {t("professionalDashboard.wishlist.viewDetails")}
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        radius="xl"
                        type="button"
                        variant="glass"
                        className="w-full"
                        disabled
                      >
                        {t("professionalDashboard.wishlist.viewDetails")}
                      </Button>
                    )}
                  </div>
                </GlassCard>
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
