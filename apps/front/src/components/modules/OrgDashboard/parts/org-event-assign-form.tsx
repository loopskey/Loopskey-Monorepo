"use client";

import { AssignmentTargetKind, Role } from "@/lib/graphql/generated";
import { FloatingTextareaField } from "@elements/floating-textarea";
import { FloatingSelectField } from "@elements/floating-select";
import { FloatingInputField } from "@elements/floating-input";
import { TEventCatalogForm } from "@/types/org-dashboard.types";
import { Button } from "@ui/button";
import { Form } from "@ui/form";

import * as L from "lucide-react";

export const OrgEventAssignForm = ({ hook }: TEventCatalogForm) => {
  const {
    t,
    form,
    isLoading,
    memberOptions,
    closeAssignView,
    submitAssignment,
    departmentOptions,
  } = hook;

  const targetKind = form.watch("targetKind");

  return (
    <Form {...form}>
      <form className="grid gap-5 md:grid-cols-2" onSubmit={submitAssignment}>
        <FloatingInputField
          name="title"
          control={form.control}
          leftIcon={<L.Text className="h-4 w-4" />}
          label={t("organizationDashboard.eventCatalog.assign.fields.title")}
        />

        <FloatingInputField
          type="date"
          name="dueDate"
          control={form.control}
          label={t("organizationDashboard.eventCatalog.assign.fields.dueDate")}
        />

        <FloatingSelectField
          name="targetKind"
          control={form.control}
          label={t(
            "organizationDashboard.eventCatalog.assign.fields.targetKind",
          )}
          options={Object.values(AssignmentTargetKind).map((item) => ({
            value: item,
            label: item,
          }))}
        />

        {targetKind === AssignmentTargetKind.Role && (
          <FloatingSelectField
            name="targetRole"
            control={form.control}
            label={t(
              "organizationDashboard.eventCatalog.assign.fields.targetRole",
            )}
            options={[
              { value: Role.Professional, label: "PROFESSIONAL" },
              { value: Role.Provider, label: "PROVIDER" },
            ]}
          />
        )}

        {targetKind === AssignmentTargetKind.Department && (
          <FloatingSelectField
            name="departmentId"
            control={form.control}
            label={t(
              "organizationDashboard.eventCatalog.assign.fields.department",
            )}
            options={departmentOptions}
          />
        )}

        {targetKind === AssignmentTargetKind.Member && (
          <FloatingSelectField
            name="targetMemberId"
            control={form.control}
            options={memberOptions}
            label={t("organizationDashboard.eventCatalog.assign.fields.member")}
          />
        )}

        <FloatingTextareaField
          name="description"
          control={form.control}
          className="md:col-span-2"
          label={t(
            "organizationDashboard.eventCatalog.assign.fields.description",
          )}
        />

        <div className="flex flex-col-reverse gap-3 md:col-span-2 md:flex-row md:justify-end">
          <Button
            radius="xl"
            type="button"
            variant="glass"
            onClick={closeAssignView}
          >
            {t("common.cancel")}
          </Button>

          <Button
            radius="xl"
            type="submit"
            variant="brand"
            disabled={isLoading}
          >
            <L.Send className="h-4 w-4" />
            {t("organizationDashboard.eventCatalog.assign.submit")}
          </Button>
        </div>
      </form>
    </Form>
  );
};
