"use client";

import { AssignmentTargetKind, AssignmentType } from "@/lib/graphql/generated";
import { TOrganizationAssignmentFormValues } from "@/types/org-dashboard.types";
import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { toDateInput } from "@/utils/function-helper";
import { useForm } from "react-hook-form";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";

import * as API from "@/lib/rtk/endpoints/org-dashboard.api";
import * as SC from "@/lib/validations/org-dashboard.schema";

const defaultValues: TOrganizationAssignmentFormValues = {
  title: "",
  eventId: "",
  dueDate: "",
  targetRole: "",
  description: "",
  departmentId: "",
  targetMemberId: "",
  type: AssignmentType.Soft,
  targetKind: AssignmentTargetKind.All,
};

export const useOrganizationAssignmentsTab = () => {
  const { t } = useI18n();

  const [search, setSearch] = useState("");
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<
    string | null
  >(null);
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(
    null,
  );
  const cursor = cursorStack.at(-1);
  const createForm = useForm<TOrganizationAssignmentFormValues>({
    resolver: zodResolver(SC.orgAssignmentSchema),
    defaultValues,
  });

  const editForm = useForm<TOrganizationAssignmentFormValues>({
    resolver: zodResolver(SC.orgAssignmentSchema),
    defaultValues,
  });

  const variables = useMemo(
    () => ({
      filter: {
        search: search.trim() || undefined,
      },
      pagination: {
        take: 8,
        cursor,
      },
    }),
    [search, cursor],
  );

  const assignmentsQuery = API.useOrganizationAssignmentsQuery(variables);
  const statsQuery = API.useOrganizationAssignmentStatsQuery();

  const eventsQuery = API.useOrganizationEventCatalogQuery({
    pagination: { take: 50 },
  });

  const membersQuery = API.useOrganizationMembersQuery({
    pagination: { take: 100 },
  });

  const departmentsQuery = API.useOrganizationDepartmentsQuery();

  const [createAssignment, createState] =
    API.useCreateOrganizationAssignmentMutation();
  const [updateAssignment, updateState] =
    API.useUpdateOrganizationAssignmentMutation();
  const [deleteAssignment, deleteState] =
    API.useDeleteOrganizationAssignmentMutation();

  const assignments = useMemo(
    () => assignmentsQuery.data?.items ?? [],
    [assignmentsQuery.data?.items],
  );

  const selectedAssignment = useMemo(
    () => assignments.find((item) => item.id === selectedAssignmentId) ?? null,
    [assignments, selectedAssignmentId],
  );

  const editingAssignment = useMemo(
    () => assignments.find((item) => item.id === editingAssignmentId) ?? null,
    [assignments, editingAssignmentId],
  );

  const eventOptions = useMemo(
    () =>
      (eventsQuery.data?.items ?? []).map((item) => ({
        value: item.id,
        label: item.title,
      })),
    [eventsQuery.data?.items],
  );

  const memberOptions = useMemo(
    () =>
      (membersQuery.data?.items ?? []).map((item) => ({
        value: item.id,
        label: `${item.fullName ?? item.email ?? "-"} · ${item.email ?? "-"}`,
      })),
    [membersQuery.data?.items],
  );

  const departmentOptions = useMemo(
    () =>
      (departmentsQuery.data ?? []).map((item) => ({
        value: item.id,
        label: item.title,
      })),
    [departmentsQuery.data],
  );

  const buildInput = (values: TOrganizationAssignmentFormValues) => ({
    title: values.title.trim(),
    type: values.type,
    eventId: values.eventId || undefined,
    targetKind: values.targetKind,
    targetRole:
      values.targetKind === AssignmentTargetKind.Role && values.targetRole
        ? values.targetRole
        : undefined,
    departmentId:
      values.targetKind === AssignmentTargetKind.Department
        ? values.departmentId || undefined
        : undefined,
    targetMemberId:
      values.targetKind === AssignmentTargetKind.Member
        ? values.targetMemberId || undefined
        : undefined,
    dueDate: values.dueDate || undefined,
    description: values.description?.trim() || undefined,
  });

  const submitCreateAssignment = createForm.handleSubmit(async (values) => {
    try {
      await createAssignment(buildInput(values)).unwrap();
      createForm.reset(defaultValues);
      notify.success(t("organizationDashboard.assignments.messages.created"));
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  });

  const submitEditAssignment = editForm.handleSubmit(async (values) => {
    if (!editingAssignmentId) return;
    try {
      await updateAssignment({
        assignmentId: editingAssignmentId,
        ...buildInput(values),
      }).unwrap();
      setEditingAssignmentId(null);
      editForm.reset(defaultValues);
      notify.success(t("organizationDashboard.assignments.messages.updated"));
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  });

  const startEdit = (assignmentId: string) => {
    const item = assignments.find(
      (assignment) => assignment.id === assignmentId,
    );
    if (!item) return;
    setSelectedAssignmentId(null);
    setEditingAssignmentId(item.id);
    editForm.reset({
      type: item.type,
      title: item.title,
      eventId: item.eventId ?? "",
      targetKind: item.targetKind,
      targetRole: item.targetRole ?? "",
      dueDate: toDateInput(item.dueDate),
      description: item.description ?? "",
      departmentId: item.departmentId ?? "",
      targetMemberId: item.targetMemberId ?? "",
    });
  };

  const openAssignmentDetail = (assignmentId: string) => {
    setEditingAssignmentId(null);
    setSelectedAssignmentId(assignmentId);
  };

  const closeAssignmentDetail = () => setSelectedAssignmentId(null);

  const closeAssignmentEdit = () => {
    setEditingAssignmentId(null);
    editForm.reset(defaultValues);
  };

  const resetCreateForm = () => createForm.reset(defaultValues);
  const resetEditForm = () => closeAssignmentEdit();
  const removeAssignment = async (assignmentId: string) => {
    try {
      await deleteAssignment(assignmentId).unwrap();
      if (selectedAssignmentId === assignmentId) setSelectedAssignmentId(null);
      if (editingAssignmentId === assignmentId) setEditingAssignmentId(null);
      notify.success(t("organizationDashboard.assignments.messages.deleted"));
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };

  const nextPage = () => {
    const nextCursor = assignmentsQuery.data?.pageInfo?.nextCursor;
    if (nextCursor) setCursorStack((prev) => [...prev, nextCursor]);
  };

  const previousPage = () => setCursorStack((prev) => prev.slice(0, -1));

  return {
    t,
    search,
    editForm,
    nextPage,
    startEdit,
    setSearch,
    createForm,
    assignments,
    eventOptions,
    previousPage,
    resetEditForm,
    memberOptions,
    resetCreateForm,
    removeAssignment,
    editingAssignment,
    departmentOptions,
    selectedAssignment,
    editingAssignmentId,
    closeAssignmentEdit,
    selectedAssignmentId,
    submitEditAssignment,
    openAssignmentDetail,
    closeAssignmentDetail,
    stats: statsQuery.data,
    submitCreateAssignment,
    page: cursorStack.length + 1,
    canPrevious: cursorStack.length > 0,
    isEditViewOpen: Boolean(editingAssignmentId),
    isDetailViewOpen: Boolean(selectedAssignmentId),
    totalCount: assignmentsQuery.data?.totalCount ?? 0,
    hasNextPage: Boolean(assignmentsQuery.data?.pageInfo?.hasNextPage),
    isLoading:
      createState.isLoading ||
      updateState.isLoading ||
      statsQuery.isFetching ||
      eventsQuery.isFetching ||
      membersQuery.isFetching ||
      assignmentsQuery.isFetching ||
      departmentsQuery.isFetching ||
      deleteState.isLoading,
  };
};
