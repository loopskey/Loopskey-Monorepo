"use client";

import { TOrgAssignmentCreate } from "@/types/org-dashboard.types";
import { OrgAssignmentForm } from "@modules/OrgDashboard/parts/org-assignment-form";
import { GlassCard } from "@elements/glass-card";

export const OrgAssignmentCreateView = ({ hook }: TOrgAssignmentCreate) => {
  const {
    t,
    createForm,
    isLoading,
    eventOptions,
    memberOptions,
    resetCreateForm,
    departmentOptions,
    submitCreateAssignment,
  } = hook;

  return (
    <GlassCard>
      <div className="relative z-10">
        <h2 className="text-xl font-medium">
          {t("organizationDashboard.assignments.form.title")}
        </h2>

        <div className="mt-6">
          <OrgAssignmentForm
            t={t}
            form={createForm}
            isLoading={isLoading}
            onCancel={resetCreateForm}
            eventOptions={eventOptions}
            memberOptions={memberOptions}
            onSubmit={submitCreateAssignment}
            departmentOptions={departmentOptions}
            submitText={t("organizationDashboard.assignments.form.submit")}
          />
        </div>
      </div>
    </GlassCard>
  );
};
