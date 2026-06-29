"use client";

import { useAdminOrganizationUsersTab } from "@/hooks/useAdminOrgUsersTab";
import { FloatingInputField } from "@elements/floating-input";
import { GlassCard } from "@elements/glass-card";

import * as F from "@ui/form";
import * as L from "lucide-react";

type Props = {
  hook: ReturnType<typeof useAdminOrganizationUsersTab>;
};

export const AdminOrganizationUsersFilters = ({ hook }: Props) => {
  const { t, orgFilterRhf } = hook;

  return (
    <GlassCard className="space-y-4">
      <div>
        <h2 className="text-lg font-medium">
          {t("adminDashboard.organizationUsers.filters.title")}
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {t("adminDashboard.organizationUsers.filters.description")}
        </p>
      </div>

      <F.Form {...orgFilterRhf}>
        <form className="grid gap-4 lg:grid-cols-3">
          <FloatingInputField
            name="search"
            control={orgFilterRhf.control}
            leftIcon={<L.Search className="h-4 w-4" />}
            label={t("adminDashboard.organizationUsers.search")}
          />

          <FloatingInputField
            name="country"
            control={orgFilterRhf.control}
            leftIcon={<L.MapPin className="h-4 w-4" />}
            label={t("adminDashboard.organizationUsers.filters.country")}
          />

          <FloatingInputField
            name="industry"
            control={orgFilterRhf.control}
            leftIcon={<L.Building2 className="h-4 w-4" />}
            label={t("adminDashboard.organizationUsers.filters.industry")}
          />
        </form>
      </F.Form>
    </GlassCard>
  );
};
