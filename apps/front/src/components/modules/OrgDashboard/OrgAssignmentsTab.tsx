"use client";

import { useOrganizationAssignmentsTab } from "@/hooks/useOrgDashboardAssignmentTab";
import { OrgAssignmentsActiveView } from "@modules/OrgDashboard/parts/org-assignment-active-view";
import { OrgAssignmentDetailView } from "@modules/OrgDashboard/parts/org-assignment-detail-view";
import { OrgAssignmentCreateView } from "@modules/OrgDashboard/parts/org-assignment-create-view";
import { OrgAssignmentEditView } from "@modules/OrgDashboard/parts/org-assignment-edit-view";
import { OrgAssignmentsHeader } from "@modules/OrgDashboard/parts/org-assignment-header";

import * as T from "@ui/tabs";

const OrgAssignmentsTab = () => {
  const hook = useOrganizationAssignmentsTab();

  if (hook.isDetailViewOpen) return <OrgAssignmentDetailView hook={hook} />;
  if (hook.isEditViewOpen) return <OrgAssignmentEditView hook={hook} />;

  return (
    <div className="space-y-6">
      <OrgAssignmentsHeader t={hook.t} />
      <T.Tabs defaultValue="active" className="space-y-6">
        <T.TabsList className="grid w-full max-w-xl grid-cols-2 rounded-2xl">
          <T.TabsTrigger value="active">
            {hook.t("organizationDashboard.assignments.tabs.active")}
          </T.TabsTrigger>
          <T.TabsTrigger value="create">
            {hook.t("organizationDashboard.assignments.tabs.create")}
          </T.TabsTrigger>
        </T.TabsList>
        <T.TabsContent value="active">
          <OrgAssignmentsActiveView hook={hook} />
        </T.TabsContent>
        <T.TabsContent value="create">
          <OrgAssignmentCreateView hook={hook} />
        </T.TabsContent>
      </T.Tabs>
    </div>
  );
};

export default OrgAssignmentsTab;
