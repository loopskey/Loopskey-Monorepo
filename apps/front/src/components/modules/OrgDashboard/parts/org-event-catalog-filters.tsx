"use client";

import { EventDeliveryMode, EventType } from "@/lib/graphql/generated";
import { TEventCatalogFilter } from "@/types/org-dashboard.types";
import { EventCategory } from "@/lib/graphql/generated";
import { GlassCard } from "@elements/glass-card";
import { ALL_VALUE } from "@/utils/constant";
import { Button } from "@ui/button";
import { Input } from "@ui/input";

import * as L from "lucide-react";

export const OrgEventCatalogFilters = ({ hook }: TEventCatalogFilter) => {
  const {
    t,
    type,
    search,
    setType,
    category,
    setSearch,
    setCategory,
    resetFilters,
    deliveryMode,
    setDeliveryMode,
  } = hook;

  return (
    <GlassCard>
      <div className="relative z-10 grid gap-4 md:grid-cols-4">
        <div className="md:col-span-2">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("organizationDashboard.eventCatalog.filters.search")}
            className="h-14 rounded-2xl border-border/70 bg-background/70 px-4 shadow-sm backdrop-blur-xl"
          />
        </div>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="h-14 rounded-2xl border border-border/70 bg-background/70 px-4 text-sm"
        >
          <option value={ALL_VALUE}>
            {t("organizationDashboard.eventCatalog.filters.allCategories")}
          </option>
          {Object.values(EventCategory).map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          value={type}
          onChange={(event) => setType(event.target.value)}
          className="h-14 rounded-2xl border border-border/70 bg-background/70 px-4 text-sm"
        >
          <option value={ALL_VALUE}>
            {t("organizationDashboard.eventCatalog.filters.allTypes")}
          </option>
          {Object.values(EventType).map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          value={deliveryMode}
          onChange={(event) => setDeliveryMode(event.target.value)}
          className="h-14 rounded-2xl border border-border/70 bg-background/70 px-4 text-sm md:col-span-2"
        >
          <option value={ALL_VALUE}>
            {t("organizationDashboard.eventCatalog.filters.allDeliveryModes")}
          </option>
          {Object.values(EventDeliveryMode).map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <Button
          radius="xl"
          type="button"
          variant="glass"
          className="h-14"
          onClick={resetFilters}
        >
          <L.RotateCcw className="h-4 w-4" />
          {t("organizationDashboard.eventCatalog.filters.reset")}
        </Button>
      </div>
    </GlassCard>
  );
};
