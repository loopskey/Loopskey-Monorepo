"use client";

import { TEventCatalogAssignView } from "@/types/org-dashboard.types";
import { OrgEventAssignForm } from "@modules/OrgDashboard/parts/org-event-assign-form";
import { isValidImageSrc } from "@utils/function-helper";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import Image from "next/image";

import * as L from "lucide-react";

export const OrgEventAssignView = ({ hook }: TEventCatalogAssignView) => {
  const { t, selectedEvent, closeAssignView } = hook;

  if (!selectedEvent)
    return (
      <div className="space-y-6">
        <Button
          radius="xl"
          type="button"
          variant="glass"
          onClick={closeAssignView}
        >
          <L.ArrowLeft className="h-4 w-4" />
          {t("common.back")}
        </Button>
        <GlassCard>
          <div className="flex min-h-72 items-center justify-center text-sm text-muted-foreground">
            {t("common.loading")}
          </div>
        </GlassCard>
      </div>
    );

  const imageSrc =
    typeof selectedEvent.imageUrl === "string" &&
    isValidImageSrc(selectedEvent.imageUrl)
      ? selectedEvent.imageUrl
      : null;

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <Button
            radius="xl"
            type="button"
            variant="glass"
            onClick={closeAssignView}
          >
            <L.ArrowLeft className="h-4 w-4" />
            {t("common.back")}
          </Button>

          <div className="mt-5">
            <p className="text-sm font-medium text-primary">
              {t("organizationDashboard.eventCatalog.assign.title")}
            </p>
            <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
              {selectedEvent.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="rounded-full">
                {selectedEvent.deliveryMode}
              </Badge>
              <Badge className="rounded-full">
                {selectedEvent.pdu}{" "}
                {t("organizationDashboard.eventCatalog.card.pdus")}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {String(selectedEvent.startDate).slice(0, 10)}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <GlassCard>
            <div className="relative z-10">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                  <L.Send className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-medium">
                    {t("organizationDashboard.eventCatalog.assign.title")}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedEvent.speaker ?? "-"}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <OrgEventAssignForm hook={hook} />
              </div>
            </div>
          </GlassCard>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <GlassCard className="overflow-hidden p-0">
            <div className="relative z-10">
              <div className="relative h-44 overflow-hidden rounded-t-[2rem] bg-muted">
                {imageSrc ? (
                  <Image
                    fill
                    src={imageSrc}
                    className="object-cover"
                    alt={selectedEvent.title}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <L.CalendarDays className="h-10 w-10" />
                  </div>
                )}
              </div>

              <div className="p-5">
                <h2 className="text-lg font-medium">
                  {t("organizationDashboard.eventCatalog.assign.eventSummary")}
                </h2>

                <div className="mt-5 grid gap-3 text-sm">
                  <div className="rounded-2xl bg-background/45 p-4">
                    <p className="text-xs text-muted-foreground">
                      {t("organizationDashboard.eventCatalog.card.rating")}
                    </p>
                    <p className="mt-1 font-semibold">
                      {selectedEvent.averageRating ?? selectedEvent.rating} /
                      5.0
                    </p>
                  </div>

                  <div className="rounded-2xl bg-background/45 p-4">
                    <p className="text-xs text-muted-foreground">
                      {t("organizationDashboard.eventCatalog.card.capacity")}
                    </p>
                    <p className="mt-1 font-semibold">
                      {selectedEvent.capacity ?? "-"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-background/45 p-4">
                    <p className="text-xs text-muted-foreground">
                      {t("organizationDashboard.eventCatalog.card.price")}
                    </p>
                    <p className="mt-1 font-semibold">
                      {selectedEvent.isFree
                        ? t("organizationDashboard.eventCatalog.card.free")
                        : `${selectedEvent.currency}${
                            selectedEvent.price ?? 0
                          }`}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-background/45 p-4">
                    <p className="text-xs text-muted-foreground">
                      {t("organizationDashboard.eventCatalog.card.location")}
                    </p>
                    <p className="mt-1 font-semibold">
                      {selectedEvent.location ?? selectedEvent.onlineUrl ?? "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </aside>
      </section>
    </div>
  );
};
