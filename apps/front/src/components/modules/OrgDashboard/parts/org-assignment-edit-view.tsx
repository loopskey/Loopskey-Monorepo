"use client";

import { TOrgAssignmentEditView } from "@/types/org-dashboard.types";
import { OrgAssignmentForm } from "@modules/OrgDashboard/parts/org-assignment-form";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import * as L from "lucide-react";

export const OrgAssignmentEditView = ({ hook }: TOrgAssignmentEditView) => {
  const {
    t,
    editForm,
    isLoading,
    eventOptions,
    resetEditForm,
    memberOptions,
    editingAssignment,
    departmentOptions,
    closeAssignmentEdit,
    submitEditAssignment,
  } = hook;

  if (!editingAssignment)
    return (
      <div className="space-y-6">
        <Button
          radius="xl"
          type="button"
          variant="glass"
          onClick={closeAssignmentEdit}
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
            onClick={closeAssignmentEdit}
          >
            <L.ArrowLeft className="h-4 w-4" />
            {t("common.back")}
          </Button>

          <div className="mt-5">
            <p className="text-sm font-medium text-primary">
              {t("organizationDashboard.assignments.form.editTitle")}
            </p>

            <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
              {editingAssignment.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="rounded-full">
                {editingAssignment.status}
              </Badge>

              <span className="text-sm text-muted-foreground">
                {t("organizationDashboard.assignments.form.editDescription")}
              </span>
            </div>
          </div>
        </div>
      </section>

      <GlassCard>
        <div className="relative z-10">
          <OrgAssignmentForm
            t={t}
            form={editForm}
            isLoading={isLoading}
            eventOptions={eventOptions}
            submitText={t("common.save")}
            memberOptions={memberOptions}
            onSubmit={submitEditAssignment}
            departmentOptions={departmentOptions}
            onCancel={() => {
              resetEditForm();
              closeAssignmentEdit();
            }}
          />
        </div>
      </GlassCard>
    </div>
  );
};
