"use client";

import { AssignmentTargetKind, AssignmentType } from "@/lib/graphql/generated";
import { OrganizationMemberStatus, Role } from "@/lib/graphql/generated";
import { TOrganizationBulkMemberRow } from "@/types/org-dashboard.types";
import { useMemo, useState } from "react";
import { normalizeText } from "@/utils/constant";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";

import * as XLSX from "xlsx";
import * as API from "@/lib/rtk/endpoints/org-dashboard.api";
import * as SC from "@/lib/validations/org-dashboard.schema";

export const useOrganizationMembersTab = () => {
  const { t } = useI18n();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | OrganizationMemberStatus>("ALL");
  const [departmentId, setDepartmentId] = useState("ALL");
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const cursor = cursorStack.at(-1);

  const addMemberForm = useForm<SC.TAddMemberForm>({
    resolver: zodResolver(SC.addMemberSchema),
    defaultValues: {
      email: "",
      jobRole: "",
      fullName: "",
      departmentId: "",
    },
  });

  const assignmentForm = useForm<SC.TAssignMemberForm>({
    resolver: zodResolver(SC.assignmentSchema),
    defaultValues: {
      eventId: "",
      dueDate: "",
      description: "",
    },
  });

  const variables = useMemo(
    () => ({
      filter: {
        search: search.trim() || undefined,
        status: status === "ALL" ? undefined : status,
        departmentId: departmentId === "ALL" ? undefined : departmentId,
      },
      pagination: {
        take: 10,
        cursor,
      },
    }),
    [search, status, departmentId, cursor],
  );

  const membersQuery = API.useOrganizationMembersQuery(variables);
  const statsQuery = API.useOrganizationMembersStatsQuery();
  const departmentsQuery = API.useOrganizationDepartmentsQuery();
  const eventsQuery = API.useOrganizationEventCatalogQuery({
    pagination: { take: 50 },
  });

  const [loadMemberDetail, memberDetailQuery] =
    API.useLazyOrganizationMemberDetailQuery();

  const [addMember, addMemberState] = API.useAddOrganizationMemberMutation();
  const [bulkAddMembers, bulkAddMembersState] =
    API.useBulkAddOrganizationMembersMutation();
  const [updateMember, updateMemberState] =
    API.useUpdateOrganizationMemberMutation();
  const [updateNotes, updateNotesState] =
    API.useUpdateOrganizationMemberNotesMutation();
  const [createAssignment, createAssignmentState] =
    API.useCreateOrganizationAssignmentMutation();

  const members = useMemo(
    () => membersQuery.data?.items ?? [],
    [membersQuery.data?.items],
  );

  const departments = useMemo(
    () => departmentsQuery.data ?? [],
    [departmentsQuery.data],
  );

  const events = useMemo(
    () => eventsQuery.data?.items ?? [],
    [eventsQuery.data?.items],
  );

  const stats = statsQuery.data;

  const selectedMember = memberDetailQuery.data;

  const departmentOptions = useMemo(
    () =>
      departments.map((item) => ({
        value: item.id,
        label: item.title,
      })),
    [departments],
  );

  const eventOptions = useMemo(
    () =>
      events.map((item) => ({
        value: item.id,
        label: item.title,
      })),
    [events],
  );

  const openMemberDetail = async (memberId: string) => {
    setSelectedMemberId(memberId);
    const detail = await loadMemberDetail(memberId).unwrap();
    setNotes(detail?.notes ?? "");
  };

  const closeMemberDetail = () => {
    setSelectedMemberId(null);
    setNotes("");
  };

  const submitSingleMember = addMemberForm.handleSubmit(async (values) => {
    try {
      await addMember({
        email: values.email.trim().toLowerCase(),
        fullName: values.fullName.trim(),
        departmentId: values.departmentId || undefined,
        jobRole: values.jobRole?.trim() || undefined,
      }).unwrap();

      addMemberForm.reset();
      notify.success(t("organizationDashboard.members.messages.memberAdded"));
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  });

  const parseExcelFile = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet);

    return rows.map<TOrganizationBulkMemberRow>((row) => ({
      email: normalizeText(row.email || row.Email),
      fullName: normalizeText(row.fullName || row["Full Name"] || row.name),
      departmentTitle: normalizeText(
        row.departmentTitle || row["Department Title"] || row.department,
      ),
      jobRole: normalizeText(row.jobRole || row["Job Role"] || row.role),
    }));
  };

  const uploadBulkMembers = async (file?: File | null) => {
    if (!file) return;
    try {
      const rows = await parseExcelFile(file);
      const validRows = rows.filter((row) => row.email && row.fullName);
      if (!validRows.length) {
        notify.error(t("organizationDashboard.members.messages.invalidExcel"));
        return;
      }
      const result = await bulkAddMembers({ rows: validRows }).unwrap();
      notify.success(
        t("organizationDashboard.members.messages.bulkImported", {
          created: result.created,
          updated: result.updated,
          failed: result.failed,
        }),
      );
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };

  const updateMemberStatus = async (
    memberId: string,
    nextStatus: OrganizationMemberStatus,
  ) => {
    try {
      await updateMember({
        memberId,
        status: nextStatus,
      }).unwrap();
      if (selectedMemberId) await loadMemberDetail(selectedMemberId).unwrap();
      notify.success(t("organizationDashboard.members.messages.memberUpdated"));
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };

  const updateMemberRole = async (memberId: string, role: Role) => {
    try {
      await updateMember({
        memberId,
        role,
      }).unwrap();
      if (selectedMemberId) await loadMemberDetail(selectedMemberId).unwrap();
      notify.success(t("organizationDashboard.members.messages.memberUpdated"));
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };

  const saveNotes = async () => {
    if (!selectedMemberId) return;
    try {
      await updateNotes({
        memberId: selectedMemberId,
        notes: notes.trim(),
      }).unwrap();
      notify.success(t("organizationDashboard.members.messages.notesSaved"));
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };

  const assignLearning = assignmentForm.handleSubmit(async (values) => {
    if (!selectedMemberId) return;
    try {
      const selectedEvent = events.find((event) => event.id === values.eventId);
      await createAssignment({
        eventId: values.eventId,
        type: AssignmentType.Soft,
        targetMemberId: selectedMemberId,
        dueDate: values.dueDate || undefined,
        targetKind: AssignmentTargetKind.Member,
        description: values.description?.trim() || undefined,
        title: selectedEvent?.title ?? "Member learning assignment",
      }).unwrap();
      assignmentForm.reset();
      notify.success(
        t("organizationDashboard.members.messages.assignmentSent"),
      );
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  });

  const nextPage = () => {
    const nextCursor = membersQuery.data?.pageInfo?.nextCursor;
    if (nextCursor) setCursorStack((prev) => [...prev, nextCursor]);
  };

  const previousPage = () => setCursorStack((prev) => prev.slice(0, -1));

  const resetFilters = () => {
    setSearch("");
    setStatus("ALL");
    setDepartmentId("ALL");
    setCursorStack([]);
  };

  return {
    t,
    stats,
    notes,
    search,
    status,
    events,
    members,
    nextPage,
    setNotes,
    setSearch,
    saveNotes,
    setStatus,
    departments,
    eventOptions,
    resetFilters,
    previousPage,
    departmentId,
    addMemberForm,
    selectedMember,
    assignLearning,
    assignmentForm,
    setDepartmentId,
    updateMemberRole,
    openMemberDetail,
    closeMemberDetail,
    departmentOptions,
    uploadBulkMembers,
    submitSingleMember,
    updateMemberStatus,
    page: cursorStack.length + 1,
    canPrevious: cursorStack.length > 0,
    isDetailOpen: Boolean(selectedMemberId),
    totalCount: membersQuery.data?.totalCount ?? 0,
    hasNextPage: Boolean(membersQuery.data?.pageInfo?.hasNextPage),
    isLoading:
      statsQuery.isFetching ||
      eventsQuery.isFetching ||
      membersQuery.isFetching ||
      addMemberState.isLoading ||
      updateNotesState.isLoading ||
      departmentsQuery.isFetching ||
      updateMemberState.isLoading ||
      memberDetailQuery.isFetching ||
      bulkAddMembersState.isLoading ||
      createAssignmentState.isLoading,
  };
};
