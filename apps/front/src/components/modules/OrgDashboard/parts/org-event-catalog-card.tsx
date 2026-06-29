"use client";

import { TEventCatalogCard } from "@/types/org-dashboard.types";
import { isValidImageSrc } from "@/utils/function-helper";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import Image from "next/image";

import * as L from "lucide-react";

export const OrgEventCatalogCard = ({
  t,
  event,
  isLoading,
  openAssignView,
}: TEventCatalogCard) => {
  const imageSrc =
    typeof event.imageUrl === "string" && isValidImageSrc(event.imageUrl)
      ? event.imageUrl
      : null;

  return (
    <GlassCard className="overflow-hidden p-0">
      <div className="relative z-10">
        <div className="relative h-44 overflow-hidden rounded-t-[2rem] bg-muted">
          {imageSrc ? (
            <Image
              fill
              src={imageSrc}
              alt={event.title}
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <L.CalendarDays className="h-10 w-10" />
            </div>
          )}
          <Badge className="absolute left-4 top-4">{event.deliveryMode}</Badge>
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="line-clamp-2 text-lg font-semibold">
                {event.title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {event.speaker ?? "-"}
              </p>
            </div>
            <div className="rounded-2xl bg-primary/10 px-3 py-2 text-sm font-bold text-primary">
              {event.pdu} {t("organizationDashboard.eventCatalog.card.pdus")}
            </div>
          </div>

          <div className="mt-5 grid gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <L.Calendar className="h-4 w-4" />
              {String(event.startDate).slice(0, 10)}
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <L.MapPin className="h-4 w-4" />
              {event.location ?? event.onlineUrl ?? "-"}
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <L.Tag className="h-4 w-4" />
              {event.category}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 text-sm">
            <div className="rounded-2xl bg-background/55 p-3">
              <p className="text-xs text-muted-foreground">
                {t("organizationDashboard.eventCatalog.card.rating")}
              </p>
              <p className="font-semibold">
                {event.averageRating ?? event.rating} / 5.0
              </p>
            </div>

            <div className="rounded-2xl bg-background/55 p-3">
              <p className="text-xs text-muted-foreground">
                {t("organizationDashboard.eventCatalog.card.capacity")}
              </p>
              <p className="font-semibold">{event.capacity ?? "-"}</p>
            </div>

            <div className="rounded-2xl bg-background/55 p-3">
              <p className="text-xs text-muted-foreground">
                {t("organizationDashboard.eventCatalog.card.price")}
              </p>
              <p className="font-semibold">
                {event.isFree
                  ? t("organizationDashboard.eventCatalog.card.free")
                  : `${event.currency}${event.price ?? 0}`}
              </p>
            </div>
          </div>

          <Button
            radius="xl"
            type="button"
            variant="brand"
            disabled={isLoading}
            className="mt-6 w-full"
            onClick={() => openAssignView(event.id)}
          >
            <L.Send className="h-4 w-4" />
            {t("organizationDashboard.eventCatalog.card.assign")}
          </Button>
        </div>
      </div>
    </GlassCard>
  );
};
