"use client";

import { TOrgAssignmentFormProps } from "@/types/org-dashboard.types";
import { FloatingTextareaField } from "@elements/floating-textarea";
import { AssignmentTargetKind } from "@/lib/graphql/generated";
import { AssignmentType, Role } from "@/lib/graphql/generated";
import { FloatingSelectField } from "@elements/floating-select";
import { FloatingInputField } from "@elements/floating-input";
import { Button } from "@ui/button";
import { Form } from "@ui/form";

import * as L from "lucide-react";

export const OrgAssignmentForm = ({
  t,
  form,
  onSubmit,
  onCancel,
  isLoading,
  submitText,
  eventOptions,
  memberOptions,
  departmentOptions,
}: TOrgAssignmentFormProps) => {
  const targetKind = form.watch("targetKind");

  return (
    <Form {...form}>
      <form className="grid gap-5 md:grid-cols-2" onSubmit={onSubmit}>
        <FloatingInputField
          name="title"
          control={form.control}
          label={t("organizationDashboard.assignments.form.fields.title")}
          leftIcon={<L.Text className="h-4 w-4" />}
        />

        <FloatingSelectField
          name="type"
          control={form.control}
          label={t("organizationDashboard.assignments.form.fields.type")}
          options={Object.values(AssignmentType).map((item) => ({
            value: item,
            label: item,
          }))}
        />

        <FloatingSelectField
          name="eventId"
          control={form.control}
          options={eventOptions}
          className="md:col-span-2"
          label={t("organizationDashboard.assignments.form.fields.event")}
        />

        <FloatingSelectField
          name="targetKind"
          control={form.control}
          label={t("organizationDashboard.assignments.form.fields.targetKind")}
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
              "organizationDashboard.assignments.form.fields.targetRole",
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
              "organizationDashboard.assignments.form.fields.department",
            )}
            options={departmentOptions}
          />
        )}

        {targetKind === AssignmentTargetKind.Member && (
          <FloatingSelectField
            name="targetMemberId"
            control={form.control}
            label={t("organizationDashboard.assignments.form.fields.member")}
            options={memberOptions}
          />
        )}

        <FloatingInputField
          type="date"
          name="dueDate"
          control={form.control}
          label={t("organizationDashboard.assignments.form.fields.dueDate")}
        />

        <FloatingTextareaField
          name="description"
          control={form.control}
          className="md:col-span-2"
          label={t("organizationDashboard.assignments.form.fields.description")}
        />

        <div className="flex gap-2 md:col-span-2">
          {onCancel && (
            <Button
              radius="xl"
              type="button"
              variant="glass"
              onClick={onCancel}
            >
              {t("common.cancel")}
            </Button>
          )}

          <Button
            radius="xl"
            type="submit"
            variant="brand"
            disabled={isLoading}
          >
            <L.Save className="h-4 w-4" />
            {submitText}
          </Button>
        </div>
      </form>
    </Form>
  );
};
