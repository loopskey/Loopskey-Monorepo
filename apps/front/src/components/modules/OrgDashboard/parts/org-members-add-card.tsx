"use client";

import { FloatingSelectField } from "@elements/floating-select";
import { TOrgMembersAddCard } from "@/types/org-dashboard.types";
import { FloatingInputField } from "@elements/floating-input";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { Form } from "@ui/form";

import * as L from "lucide-react";

export const OrgMembersAddCard = ({
  t,
  isLoading,
  addMemberForm,
  departmentOptions,
  submitSingleMember,
}: TOrgMembersAddCard) => {
  return (
    <GlassCard>
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
          <L.UserPlus className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-xl font-medium">
            {t("organizationDashboard.members.addSingle.title")}
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {t("organizationDashboard.members.addSingle.description")}
          </p>
        </div>
      </div>

      <Form {...addMemberForm}>
        <form className="mt-6 space-y-4" onSubmit={submitSingleMember}>
          <FloatingInputField
            name="fullName"
            control={addMemberForm.control}
            leftIcon={<L.UserRound className="h-4 w-4" />}
            label={t("organizationDashboard.members.fields.fullName")}
          />

          <FloatingInputField
            name="email"
            type="email"
            control={addMemberForm.control}
            leftIcon={<L.Mail className="h-4 w-4" />}
            label={t("organizationDashboard.members.fields.email")}
          />

          <FloatingSelectField
            name="departmentId"
            control={addMemberForm.control}
            options={[
              {
                value: "NO_DEPARTMENT",
                label: t("organizationDashboard.members.fields.noDepartment"),
              },
              ...departmentOptions,
            ]}
            label={t("organizationDashboard.members.fields.department")}
          />

          <FloatingInputField
            name="jobRole"
            control={addMemberForm.control}
            leftIcon={<L.Briefcase className="h-4 w-4" />}
            label={t("organizationDashboard.members.fields.role")}
          />

          <Button
            radius="xl"
            type="submit"
            variant="brand"
            className="w-full"
            disabled={isLoading}
          >
            <L.UserPlus className="h-4 w-4" />
            {t("organizationDashboard.members.addSingle.submit")}
          </Button>
        </form>
      </Form>
    </GlassCard>
  );
};
