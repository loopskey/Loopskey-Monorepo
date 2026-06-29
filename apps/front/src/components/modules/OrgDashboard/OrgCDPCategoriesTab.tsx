"use client";

import { OrgCpdCategoryCreateView } from "@modules/OrgDashboard/parts/org-cpd-create-view";
import { useOrgCpdCategoriesTab } from "@/hooks/useCPDCategoryTab";
import { OrgCpdCategoryEditView } from "@modules/OrgDashboard/parts/org-cpd-edit-view";
import { OrgCpdCategoryListView } from "@modules/OrgDashboard/parts/org-cpd-list-view";

const OrgCDPCategoriesTab = () => {
  const hook = useOrgCpdCategoriesTab();
  if (hook.isCreateViewOpen) return <OrgCpdCategoryCreateView hook={hook} />;
  if (hook.isEditViewOpen) return <OrgCpdCategoryEditView hook={hook} />;
  return <OrgCpdCategoryListView hook={hook} />;
};

export default OrgCDPCategoriesTab;
