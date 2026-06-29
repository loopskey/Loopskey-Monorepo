"use client";

import { TOrgMembersBulkCard } from "@/types/org-dashboard.types";
import { GlassCard } from "@elements/glass-card";
import { Input } from "@ui/input";

import * as L from "lucide-react";

export const OrgMembersBulkCard = ({
  t,
  isLoading,
  uploadBulkMembers,
}: TOrgMembersBulkCard) => {
  return (
    <GlassCard>
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
          <L.FileSpreadsheet className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-xl font-medium">
            {t("organizationDashboard.members.bulk.title")}
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {t("organizationDashboard.members.bulk.description")}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-3xl border border-dashed border-primary/30 bg-primary/5 p-4 text-sm leading-7">
        <p className="font-medium">
          {t("organizationDashboard.members.bulk.templateTitle")}
        </p>
        <p className="text-muted-foreground">
          email, fullName, departmentTitle, jobRole
        </p>
      </div>

      <Input
        type="file"
        disabled={isLoading}
        accept=".xlsx,.xls,.csv"
        className="mt-5 rounded-2xl"
        onChange={(event) => uploadBulkMembers(event.target.files?.[0])}
      />
    </GlassCard>
  );
};
