"use client";

import { TOrgAssignmentDetailView } from "@/types/org-dashboard.types";
import { AssignmentInfo } from "@modules/OrgDashboard/parts/org-assignment-info";
import { GlassCard } from "@elements/glass-card";
import { Progress } from "@ui/progress";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import * as L from "lucide-react";

export const OrgAssignmentDetailView = ({ hook }: TOrgAssignmentDetailView) => {
  const {
    t,
    startEdit,
    isLoading,
    removeAssignment,
    selectedAssignment,
    closeAssignmentDetail,
  } = hook;

  if (!selectedAssignment)
    return (
      <div className="space-y-6">
        <Button
          radius="xl"
          type="button"
          variant="glass"
          onClick={closeAssignmentDetail}
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

  const contentTitle =
    selectedAssignment.eventTitle ?? selectedAssignment.courseTitle ?? "-";

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <Button
            radius="xl"
            type="button"
            variant="glass"
            onClick={closeAssignmentDetail}
          >
            <L.ArrowLeft className="h-4 w-4" />
            {t("common.back")}
          </Button>
          <div className="mt-5">
            <p className="text-sm font-medium text-primary">
              {t("organizationDashboard.assignments.detail.title")}
            </p>
            <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
              {selectedAssignment.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="rounded-full">
                {selectedAssignment.status}
              </Badge>
              <Badge className="rounded-full">{selectedAssignment.type}</Badge>
              <span className="text-sm text-muted-foreground">
                {contentTitle}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            radius="xl"
            type="button"
            variant="glass"
            onClick={() => startEdit(selectedAssignment.id)}
          >
            <L.Pencil className="h-4 w-4" />
            {t("common.edit")}
          </Button>
          <Button
            radius="xl"
            type="button"
            variant="cancel"
            disabled={isLoading}
            onClick={() => removeAssignment(selectedAssignment.id)}
          >
            <L.Trash2 className="h-4 w-4" />
            {t("common.delete")}
          </Button>
        </div>
      </section>
      <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <GlassCard>
            <div className="relative z-10">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                  <L.BookOpenCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-medium">
                    {t("organizationDashboard.assignments.detail.content")}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedAssignment.description ?? "-"}
                  </p>
                </div>
              </div>
              <div className="mt-6 grid gap-3 text-sm md:grid-cols-2">
                <AssignmentInfo
                  value={selectedAssignment.status}
                  label={t("organizationDashboard.assignments.detail.status")}
                />
                <AssignmentInfo
                  value={selectedAssignment.type}
                  label={t("organizationDashboard.assignments.detail.type")}
                />
                <AssignmentInfo
                  value={selectedAssignment.targetKind}
                  label={t("organizationDashboard.assignments.detail.target")}
                />
                <AssignmentInfo
                  value={selectedAssignment.members}
                  label={t("organizationDashboard.assignments.detail.members")}
                />
                <AssignmentInfo
                  value={contentTitle}
                  label={t("organizationDashboard.assignments.detail.content")}
                />
                <AssignmentInfo
                  label={t("organizationDashboard.assignments.detail.dueDate")}
                  value={
                    selectedAssignment.dueDate
                      ? String(selectedAssignment.dueDate).slice(0, 10)
                      : "-"
                  }
                />
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="relative z-10">
              <h2 className="text-xl font-medium">
                {t("organizationDashboard.assignments.detail.progress")}
              </h2>
              <div className="mt-5">
                <div className="mb-2 flex justify-between text-sm text-muted-foreground">
                  <span>
                    {t("organizationDashboard.assignments.card.progress")}
                  </span>
                  <span>{Math.round(selectedAssignment.progress ?? 0)}%</span>
                </div>
                <Progress value={selectedAssignment.progress ?? 0} />
              </div>
            </div>
          </GlassCard>
        </div>
        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <GlassCard className="h-fit">
            <div className="relative z-10">
              <h2 className="text-lg font-medium">
                {t("organizationDashboard.assignments.detail.summary")}
              </h2>
              <div className="mt-5 grid gap-3 text-sm">
                <div className="rounded-2xl bg-background/45 p-4">
                  <p className="text-xs text-muted-foreground">
                    {t("organizationDashboard.assignments.detail.members")}
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {selectedAssignment.members}
                  </p>
                </div>
                <div className="rounded-2xl bg-background/45 p-4">
                  <p className="text-xs text-muted-foreground">
                    {t("organizationDashboard.assignments.detail.target")}
                  </p>
                  <p className="mt-1 font-semibold">
                    {selectedAssignment.targetKind}
                  </p>
                </div>
                <div className="rounded-2xl bg-background/45 p-4">
                  <p className="text-xs text-muted-foreground">
                    {t("organizationDashboard.assignments.detail.progress")}
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {Math.round(selectedAssignment.progress ?? 0)}%
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
