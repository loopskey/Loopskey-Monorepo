"use client";

import { OrgCpdCategoryForm } from "@modules/OrgDashboard/parts/org-cpd-form";
import { TCPDEditView } from "@/types/org-dashboard.types";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import * as L from "lucide-react";

export const OrgCpdCategoryEditView = ({ hook }: TCPDEditView) => {
  const {
    t,
    form,
    isLoading,
    editingItem,
    closeEditView,
    submitCategory,
    removeCategory,
    toggleCategoryStatus,
  } = hook;

  if (!editingItem)
    return (
      <div className="space-y-6">
        <Button
          radius="xl"
          type="button"
          variant="glass"
          onClick={closeEditView}
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

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <Button
            radius="xl"
            type="button"
            variant="glass"
            onClick={closeEditView}
          >
            <L.ArrowLeft className="h-4 w-4" />
            {t("common.back")}
          </Button>

          <div className="mt-5">
            <p className="text-sm font-medium text-primary">
              {t("organizationDashboard.cpd.form.editTitle")}
            </p>
            <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
              {editingItem.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant={editingItem.isActive ? "secondary" : "outline"}>
                {editingItem.isActive
                  ? t("organizationDashboard.cpd.status.active")
                  : t("organizationDashboard.cpd.status.inactive")}
              </Badge>
              <Badge className="rounded-full">{editingItem.category}</Badge>
              <span className="text-sm text-muted-foreground">
                {editingItem.requiredHours}{" "}
                {t("organizationDashboard.cpd.card.requiredHours")}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            radius="xl"
            type="button"
            variant="glass"
            disabled={isLoading}
            onClick={() => toggleCategoryStatus(editingItem)}
          >
            {editingItem.isActive ? (
              <L.ToggleLeft className="h-4 w-4" />
            ) : (
              <L.ToggleRight className="h-4 w-4" />
            )}
            {editingItem.isActive
              ? t("organizationDashboard.cpd.actions.deactivate")
              : t("organizationDashboard.cpd.actions.activate")}
          </Button>
          <Button
            radius="xl"
            type="button"
            variant="cancel"
            disabled={isLoading}
            onClick={() => removeCategory(editingItem.id)}
          >
            <L.Trash2 className="h-4 w-4" />
            {t("common.delete")}
          </Button>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <GlassCard>
          <div className="relative z-10">
            <OrgCpdCategoryForm
              t={t}
              isEditMode
              form={form}
              isLoading={isLoading}
              onCancel={closeEditView}
              onSubmit={submitCategory}
            />
          </div>
        </GlassCard>
        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <GlassCard className="h-fit">
            <div className="relative z-10">
              <h2 className="text-lg font-medium">
                {t("organizationDashboard.cpd.form.editTitle")}
              </h2>
              <div className="mt-5 grid gap-3 text-sm">
                <div className="rounded-2xl bg-background/45 p-4">
                  <p className="text-xs text-muted-foreground">
                    {t("organizationDashboard.cpd.card.requiredHours")}
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {editingItem.requiredHours}
                  </p>
                </div>
                <div className="rounded-2xl bg-background/45 p-4">
                  <p className="text-xs text-muted-foreground">
                    {t("organizationDashboard.cpd.card.activeMembers")}
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {editingItem.activeMembers ?? 0}
                  </p>
                </div>
                <div className="rounded-2xl bg-background/45 p-4">
                  <p className="text-xs text-muted-foreground">
                    {t("organizationDashboard.cpd.card.updated")}
                  </p>
                  <p className="mt-1 font-semibold">
                    {String(editingItem.updatedAt).slice(0, 10)}
                  </p>
                </div>
                <div className="rounded-2xl bg-background/45 p-4">
                  <p className="text-xs text-muted-foreground">
                    {t("organizationDashboard.cpd.card.created")}
                  </p>
                  <p className="mt-1 font-medium">
                    {String(editingItem.createdAt).slice(0, 10)}
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>
        </aside>
      </section>
    </div>
  );
};
