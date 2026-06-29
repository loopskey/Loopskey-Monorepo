"use client";

import { TOrgAssignmentCard } from "@/types/org-dashboard.types";
import { ConfirmDialog } from "@elements/confirm-dialog";
import { Progress } from "@ui/progress";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import * as L from "lucide-react";

export const OrgAssignmentCard = ({ hook, assignment }: TOrgAssignmentCard) => {
  const { t, isLoading, startEdit, removeAssignment, openAssignmentDetail } =
    hook;

  return (
    <div className="rounded-3xl border border-glass-border bg-background/45 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-medium">{assignment.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {assignment.eventTitle ??
              assignment.courseTitle ??
              t("organizationDashboard.assignments.card.noContent")}
          </p>
        </div>
        <Badge variant="secondary">{assignment.status}</Badge>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-background/60 p-3">
          <p className="text-muted-foreground">
            {t("organizationDashboard.assignments.card.members")}
          </p>
          <p className="mt-1 font-semibold">{assignment.members}</p>
        </div>
        <div className="rounded-2xl bg-background/60 p-3">
          <p className="text-muted-foreground">
            {t("organizationDashboard.assignments.card.target")}
          </p>
          <p className="mt-1 font-semibold">{assignment.targetKind}</p>
        </div>
      </div>
      <div className="mt-4">
        <div className="mb-2 flex justify-between text-xs text-muted-foreground">
          <span>{t("organizationDashboard.assignments.card.progress")}</span>
          <span>{Math.round(assignment.progress ?? 0)}%</span>
        </div>
        <Progress value={assignment.progress ?? 0} />
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button
          size="sm"
          radius="xl"
          type="button"
          variant="glass"
          onClick={() => openAssignmentDetail(assignment.id)}
        >
          <L.Eye className="h-4 w-4" />
          {t("common.view")}
        </Button>

        <Button
          size="sm"
          radius="xl"
          type="button"
          variant="glass"
          onClick={() => startEdit(assignment.id)}
        >
          <L.Pencil className="h-4 w-4" />
          {t("common.edit")}
        </Button>

        <ConfirmDialog
          isLoading={isLoading}
          confirmVariant="destructive"
          cancelText={t("common.cancel")}
          confirmText={t("common.delete")}
          onConfirm={() => removeAssignment(assignment.id)}
          title={t("organizationDashboard.assignments.delete.title")}
          description={t(
            "organizationDashboard.assignments.delete.description",
          )}
          trigger={
            <Button size="sm" radius="xl" type="button" variant="cancel">
              <L.Trash2 className="h-4 w-4" />
              {t("common.delete")}
            </Button>
          }
        />
      </div>
    </div>
  );
};
