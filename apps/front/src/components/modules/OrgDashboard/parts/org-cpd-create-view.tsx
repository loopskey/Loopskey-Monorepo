"use client";

import { OrgCpdCategoryForm } from "@modules/OrgDashboard/parts/org-cpd-form";
import { TCPDCreateView } from "@/types/org-dashboard.types";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";

import * as L from "lucide-react";

export const OrgCpdCategoryCreateView = ({ hook }: TCPDCreateView) => {
  const { t, form, isLoading, submitCategory, closeCreateView } = hook;

  return (
    <div className="space-y-6">
      <section>
        <Button
          radius="xl"
          type="button"
          variant="glass"
          onClick={closeCreateView}
        >
          <L.ArrowLeft className="h-4 w-4" />
          {t("common.back")}
        </Button>

        <div className="mt-5">
          <p className="text-sm font-medium text-primary">
            {t("organizationDashboard.cpd.form.createTitle")}
          </p>

          <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
            {t("organizationDashboard.cpd.actions.addCategory")}
          </h1>

          <p className="mt-2 max-w-3xl text-muted-foreground">
            {t("organizationDashboard.cpd.form.description")}
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <GlassCard>
          <div className="relative z-10">
            <OrgCpdCategoryForm
              t={t}
              form={form}
              isEditMode={false}
              isLoading={isLoading}
              onSubmit={submitCategory}
              onCancel={closeCreateView}
            />
          </div>
        </GlassCard>

        <GlassCard className="h-fit">
          <div className="relative z-10">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary w-fit">
              <L.BookOpenCheck className="h-5 w-5" />
            </div>

            <h2 className="mt-4 text-lg font-medium">
              {t("organizationDashboard.cpd.form.createTitle")}
            </h2>

            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              {t("organizationDashboard.cpd.form.description")}
            </p>
          </div>
        </GlassCard>
      </section>
    </div>
  );
};
