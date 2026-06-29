"use client";

import { TCpdCategoryCardProps } from "@/types/org-dashboard.types";
import { ConfirmDialog } from "@elements/confirm-dialog";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import * as L from "lucide-react";

export const OrgCpdCategoryCard = ({
  t,
  item,
  onEdit,
  onToggle,
  onDelete,
  isLoading,
}: TCpdCategoryCardProps) => {
  return (
    <GlassCard className="p-5">
      <div className="relative z-10 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {item.category}
            </p>
          </div>

          <Badge variant={item.isActive ? "secondary" : "outline"}>
            {item.isActive
              ? t("organizationDashboard.cpd.status.active")
              : t("organizationDashboard.cpd.status.inactive")}
          </Badge>
        </div>

        <p className="line-clamp-2 min-h-10 text-sm leading-6 text-muted-foreground">
          {item.description ??
            t("organizationDashboard.cpd.card.noDescription")}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-background/55 p-3">
            <p className="text-xs text-muted-foreground">
              {t("organizationDashboard.cpd.card.requiredHours")}
            </p>
            <p className="mt-1 text-lg font-semibold">{item.requiredHours}</p>
          </div>

          <div className="rounded-2xl bg-background/55 p-3">
            <p className="text-xs text-muted-foreground">
              {t("organizationDashboard.cpd.card.activeMembers")}
            </p>
            <p className="mt-1 text-lg font-semibold">
              {item.activeMembers ?? 0}
            </p>
          </div>
        </div>

        <div className="grid gap-2 text-xs text-muted-foreground">
          <p>
            {t("organizationDashboard.cpd.card.updated")}:{" "}
            {String(item.updatedAt).slice(0, 10)}
          </p>
          <p>
            {t("organizationDashboard.cpd.card.created")}:{" "}
            {String(item.createdAt).slice(0, 10)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            radius="xl"
            variant="glass"
            disabled={isLoading}
            onClick={() => onEdit(item)}
          >
            <L.Pencil className="h-4 w-4" />
            {t("common.edit")}
          </Button>

          <Button
            size="sm"
            radius="xl"
            variant="glass"
            disabled={isLoading}
            onClick={() => onToggle(item)}
          >
            {item.isActive ? (
              <L.ToggleLeft className="h-4 w-4" />
            ) : (
              <L.ToggleRight className="h-4 w-4" />
            )}
            {item.isActive
              ? t("organizationDashboard.cpd.actions.deactivate")
              : t("organizationDashboard.cpd.actions.activate")}
          </Button>

          <ConfirmDialog
            isLoading={isLoading}
            confirmVariant="destructive"
            cancelText={t("common.cancel")}
            confirmText={t("common.delete")}
            onConfirm={() => onDelete(item.id)}
            title={t("organizationDashboard.cpd.delete.title")}
            description={t("organizationDashboard.cpd.delete.description")}
            trigger={
              <Button size="sm" radius="xl" variant="cancel">
                <L.Trash2 className="h-4 w-4" />
                {t("common.delete")}
              </Button>
            }
          />
        </div>
      </div>
    </GlassCard>
  );
};
