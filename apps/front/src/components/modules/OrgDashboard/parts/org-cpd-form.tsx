"use client";

import { FloatingTextareaField } from "@elements/floating-textarea";
import { TCpdCategoryFormProps } from "@/types/org-dashboard.types";
import { FloatingSelectField } from "@elements/floating-select";
import { FloatingInputField } from "@elements/floating-input";
import { PduCategory } from "@/lib/graphql/generated";
import { Button } from "@ui/button";
import { Switch } from "@ui/switch";
import { Form } from "@ui/form";

import * as L from "lucide-react";

export const OrgCpdCategoryForm = ({
  t,
  form,
  onSubmit,
  onCancel,
  isLoading,
  isEditMode,
}: TCpdCategoryFormProps) => {
  const isActive = form.watch("isActive");

  return (
    <Form {...form}>
      <form
        className="grid items-center gap-5 md:grid-cols-2"
        onSubmit={onSubmit}
      >
        <FloatingInputField
          name="title"
          control={form.control}
          leftIcon={<L.BookOpen className="h-4 w-4" />}
          label={t("organizationDashboard.cpd.form.fields.title")}
        />

        <FloatingSelectField
          name="category"
          control={form.control}
          label={t("organizationDashboard.cpd.form.fields.category")}
          options={Object.values(PduCategory).map((item) => ({
            value: item,
            label: item,
          }))}
        />

        <FloatingInputField
          type="number"
          name="requiredHours"
          control={form.control}
          leftIcon={<L.Clock className="h-4 w-4" />}
          label={t("organizationDashboard.cpd.form.fields.requiredHours")}
        />

        <div className="flex h-14 items-center justify-between rounded-2xl border border-border/70 bg-background/55 px-4">
          <div>
            <p className="text-sm font-medium">
              {t("organizationDashboard.cpd.form.fields.active")}
            </p>
          </div>

          <Switch
            checked={isActive}
            onCheckedChange={(value) =>
              form.setValue("isActive", value, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              })
            }
          />
        </div>

        <FloatingTextareaField
          name="description"
          control={form.control}
          className="md:col-span-2"
          label={t("organizationDashboard.cpd.form.fields.description")}
        />

        <div className="flex flex-col-reverse gap-2 md:col-span-2 md:flex-row md:justify-end">
          <Button
            radius="xl"
            type="button"
            variant="glass"
            onClick={onCancel}
            disabled={isLoading}
          >
            {t("common.cancel")}
          </Button>

          <Button
            radius="xl"
            type="submit"
            variant="brand"
            disabled={isLoading}
          >
            <L.Save className="h-4 w-4" />
            {isEditMode
              ? t("organizationDashboard.cpd.form.saveChanges")
              : t("organizationDashboard.cpd.form.create")}
          </Button>
        </div>
      </form>
    </Form>
  );
};
