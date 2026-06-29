import { useOrganizationAssignmentsTab } from "@/hooks/useOrgDashboardAssignmentTab";
import { useOrganizationMembersTab } from "@/hooks/useOrgMemberTab";
import { useOrgCpdCategoriesTab } from "@/hooks/useCPDCategoryTab";
import { TCpdCategoryFormValues } from "@/lib/validations/org-dashboard.schema";
import { TCpdCategoryFormInput } from "@/lib/validations/org-dashboard.schema";
import { useOrgEventCatalogTab } from "@/hooks/useOrgEventCatalogTab";
import { UseFormReturn } from "react-hook-form";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

import * as API from "@/lib/graphql/generated";
import { useOrgReportsTab } from "@/hooks/useOrgReportTab";

export type TOrgDashboardTab =
  | "members"
  | "reports"
  | "overview"
  | "settings"
  | "assignments"
  | "event-catalog"
  | "cpd-categories";

export type TOrganizationMembersTabFilter = {
  search: string;
  departmentId: string;
  status: "ALL" | "ACTIVE" | "INACTIVE";
};

export type TOrganizationBulkMemberRow = {
  email: string;
  jobRole?: string;
  fullName: string;
  departmentId?: string;
  departmentTitle?: string;
};

export type TOrganizationMember = API.OrganizationMemberFieldsFragment;

export type TOrganizationMemberDetail =
  API.OrganizationMemberDetailQuery["organizationMemberDetail"];

export type TOrganizationDepartment = API.OrganizationDepartmentFieldsFragment;

export type TOrgAssignmentInfo = {
  label: string;
  value?: string | number | null;
};

export type TSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type TOrganizationAssignmentFormValues = {
  title: string;
  eventId: string;
  dueDate?: string;
  description?: string;
  departmentId?: string;
  targetMemberId?: string;
  type: API.AssignmentType;
  targetRole?: API.Role | "";
  targetKind: API.AssignmentTargetKind;
};

export type TOrgAssignmentFormProps = {
  isLoading: boolean;
  submitText: string;
  onSubmit: () => void;
  onCancel?: () => void;
  t: (key: string) => string;
  eventOptions: TSelectOption[];
  memberOptions: TSelectOption[];
  departmentOptions: TSelectOption[];
  form: UseFormReturn<TOrganizationAssignmentFormValues>;
};

export type TOrgReportStatCardProps = {
  label: string;
  icon: LucideIcon;
  value: string | number;
};

export type TCpdCategoryItem = API.OrganizationCpdCategoryFieldsFragment;

export type TCpdCategoryFormProps = {
  isLoading: boolean;
  isEditMode: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  t: (key: string, values?: Record<string, string | number>) => string;
  form: UseFormReturn<TCpdCategoryFormInput, unknown, TCpdCategoryFormValues>;
};

export type TCpdCategoryCardProps = {
  isLoading: boolean;
  item: TCpdCategoryItem;
  onDelete: (categoryId: string) => void;
  onEdit: (item: TCpdCategoryItem) => void;
  onToggle: (item: TCpdCategoryItem) => void;
  t: (key: string, values?: Record<string, string | number>) => string;
};

export type TCpdYearOption = {
  value: string;
  label: string;
};

export type TOverviewStatCardProps = {
  title: string;
  hint?: string;
  icon: ReactNode;
  value: string | number;
};

export type TOverviewProgressRowProps = {
  title: string;
  value: number;
  meta?: string;
};

type TMembersTabReturn = ReturnType<typeof useOrganizationMembersTab>;
type TAssignmentTabReturn = ReturnType<typeof useOrganizationAssignmentsTab>;
type TEventCatalogReturn = ReturnType<typeof useOrgEventCatalogTab>;
type TCPDCategoryReturn = ReturnType<typeof useOrgCpdCategoriesTab>;
type TOrgReportsReturn = ReturnType<typeof useOrgReportsTab>;

export type TOrgMembersStats = {
  t: TMembersTabReturn["t"];
  stats: TMembersTabReturn["stats"];
  totalCount: TMembersTabReturn["totalCount"];
};

export type TOrgMembersAddCard = {
  t: TMembersTabReturn["t"];
  isLoading: TMembersTabReturn["isLoading"];
  addMemberForm: TMembersTabReturn["addMemberForm"];
  departmentOptions: TMembersTabReturn["departmentOptions"];
  submitSingleMember: TMembersTabReturn["submitSingleMember"];
};

export type TOrgMembersBulkCard = {
  t: TMembersTabReturn["t"];
  isLoading: TMembersTabReturn["isLoading"];
  uploadBulkMembers: TMembersTabReturn["uploadBulkMembers"];
};

export type TOrgMembersFilters = {
  t: TMembersTabReturn["t"];
  search: TMembersTabReturn["search"];
  status: TMembersTabReturn["status"];
  setStatus: TMembersTabReturn["setStatus"];
  setSearch: TMembersTabReturn["setSearch"];
  departments: TMembersTabReturn["departments"];
  departmentId: TMembersTabReturn["departmentId"];
  setDepartmentId: TMembersTabReturn["setDepartmentId"];
};

export type TOrgMembersTable = {
  t: TMembersTabReturn["t"];
  members: TMembersTabReturn["members"];
  isLoading: TMembersTabReturn["isLoading"];
  openMemberDetail: TMembersTabReturn["openMemberDetail"];
};

export type TOrgMemberDetailDialog = {
  t: TMembersTabReturn["t"];
  notes: TMembersTabReturn["notes"];
  setNotes: TMembersTabReturn["setNotes"];
  saveNotes: TMembersTabReturn["saveNotes"];
  isLoading: TMembersTabReturn["isLoading"];
  isDetailOpen: TMembersTabReturn["isDetailOpen"];
  eventOptions: TMembersTabReturn["eventOptions"];
  selectedMember: TMembersTabReturn["selectedMember"];
  assignmentForm: TMembersTabReturn["assignmentForm"];
  assignLearning: TMembersTabReturn["assignLearning"];
  updateMemberRole: TMembersTabReturn["updateMemberRole"];
  closeMemberDetail: TMembersTabReturn["closeMemberDetail"];
  updateMemberStatus: TMembersTabReturn["updateMemberStatus"];
};

export type TOrgAssignmentStats = { hook: TAssignmentTabReturn };
export type TOrgAssignmentActive = { hook: TAssignmentTabReturn };
export type TOrgAssignmentCreate = { hook: TAssignmentTabReturn };
export type TOrgAssignmentDetailView = { hook: TAssignmentTabReturn };
export type TOrgAssignmentEditView = { hook: TAssignmentTabReturn };

type AssignmentItem = ReturnType<
  typeof useOrganizationAssignmentsTab
>["assignments"][number];

export type TOrgAssignmentCard = {
  hook: ReturnType<typeof useOrganizationAssignmentsTab>;
  assignment: AssignmentItem;
};

export type TEventCatalogFilter = {
  hook: TEventCatalogReturn;
};

export type TEventCatalogGrid = {
  t: TEventCatalogReturn["t"];
  events: TEventCatalogReturn["events"];
  isLoading: TEventCatalogReturn["isLoading"];
  openAssignView: TEventCatalogReturn["openAssignView"];
};

type EventItem = TEventCatalogReturn["events"][number];

export type TEventCatalogCard = {
  event: EventItem;
  t: TEventCatalogReturn["t"];
  isLoading: TEventCatalogReturn["isLoading"];
  openAssignView: TEventCatalogReturn["openAssignView"];
};

export type TEventCatalogAssignView = { hook: TEventCatalogReturn };
export type TEventCatalogForm = { hook: TEventCatalogReturn };

export type TCPDHeader = { hook: TCPDCategoryReturn };
export type TCPDStats = { hook: TCPDCategoryReturn };
export type TCPDFilters = { hook: TCPDCategoryReturn };
export type TCPDListView = { hook: TCPDCategoryReturn };
export type TCPDCreateView = { hook: TCPDCategoryReturn };
export type TCPDEditView = { hook: TCPDCategoryReturn };

export type TOrgReportHeader = { hook: TOrgReportsReturn };
export type TOrgReportFilters = { hook: TOrgReportsReturn };
export type TOrgReportCard = { hook: TOrgReportsReturn };
export type TOrgReportPieChart = { hook: TOrgReportsReturn };
export type TOrgReportTrendChart = { hook: TOrgReportsReturn };
export type TOrgReportBreakdownChart = { hook: TOrgReportsReturn };
export type TOrgReportTopMembersTable = { hook: TOrgReportsReturn };
