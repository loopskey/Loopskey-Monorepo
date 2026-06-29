"use client";

import { AssignmentType, EventCategory } from "@/lib/graphql/generated";
import { EventDeliveryMode, EventType } from "@/lib/graphql/generated";
import { assignmentEventCatalogSchema } from "@/lib/validations/org-dashboard.schema";
import { TEventCatalogAssignForm } from "@/lib/validations/org-dashboard.schema";
import { AssignmentTargetKind } from "@/lib/graphql/generated";
import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ALL_VALUE } from "@/utils/constant";
import { useForm } from "react-hook-form";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";

import * as API from "@/lib/rtk/endpoints/org-dashboard.api";

const defaultAssignValues: TEventCatalogAssignForm = {
  title: "",
  eventId: "",
  dueDate: "",
  description: "",
  targetRole: undefined,
  departmentId: undefined,
  targetMemberId: undefined,
  targetKind: AssignmentTargetKind.All,
};

export const useOrgEventCatalogTab = () => {
  const { t } = useI18n();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>(ALL_VALUE);
  const [type, setType] = useState<string>(ALL_VALUE);
  const [deliveryMode, setDeliveryMode] = useState<string>(ALL_VALUE);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const cursor = cursorStack.at(-1);
  const form = useForm<TEventCatalogAssignForm>({
    resolver: zodResolver(assignmentEventCatalogSchema),
    defaultValues: defaultAssignValues,
  });

  const variables = useMemo(
    () => ({
      filter: {
        search: search.trim() || undefined,
        category:
          category === ALL_VALUE ? undefined : (category as EventCategory),
        type: type === ALL_VALUE ? undefined : (type as EventType),
        deliveryMode:
          deliveryMode === ALL_VALUE
            ? undefined
            : (deliveryMode as EventDeliveryMode),
      },
      pagination: {
        take: 9,
        cursor,
      },
    }),
    [search, category, type, deliveryMode, cursor],
  );

  const catalogQuery = API.useOrganizationEventCatalogQuery(variables);
  const departmentsQuery = API.useOrganizationDepartmentsQuery();
  const membersQuery = API.useOrganizationMembersQuery({
    pagination: { take: 100 },
  });

  const [createAssignment, createAssignmentState] =
    API.useCreateOrganizationAssignmentMutation();

  const events = useMemo(
    () => catalogQuery.data?.items ?? [],
    [catalogQuery.data?.items],
  );

  const selectedEvent = useMemo(
    () => events.find((item) => item.id === selectedEventId) ?? null,
    [events, selectedEventId],
  );

  const departmentOptions = useMemo(
    () =>
      (departmentsQuery.data ?? []).map((item) => ({
        value: item.id,
        label: item.title,
      })),
    [departmentsQuery.data],
  );

  const memberOptions = useMemo(
    () =>
      (membersQuery.data?.items ?? []).map((item) => ({
        value: item.id,
        label: item.fullName ?? item.email ?? item.id,
      })),
    [membersQuery.data?.items],
  );

  const openAssignView = (eventId: string) => {
    const event = events.find((item) => item.id === eventId);
    if (!event) return;
    setSelectedEventId(eventId);
    form.reset({
      eventId,
      dueDate: "",
      targetRole: undefined,
      departmentId: undefined,
      targetMemberId: undefined,
      targetKind: AssignmentTargetKind.All,
      title: `Assigned Event: ${event.title}`,
      description: `Please complete ${event.title} as part of your CPD plan.`,
    });
  };

  const closeAssignView = () => {
    setSelectedEventId(null);
    form.reset(defaultAssignValues);
  };

  const submitAssignment = form.handleSubmit(async (values) => {
    try {
      await createAssignment({
        title: values.title.trim(),
        description: values.description?.trim() || undefined,
        eventId: values.eventId,
        type: AssignmentType.Soft,
        targetKind: values.targetKind,
        targetRole:
          values.targetKind === AssignmentTargetKind.Role
            ? values.targetRole
            : undefined,
        targetMemberId:
          values.targetKind === AssignmentTargetKind.Member
            ? values.targetMemberId
            : undefined,
        departmentId:
          values.targetKind === AssignmentTargetKind.Department
            ? values.departmentId
            : undefined,
        dueDate: values.dueDate || undefined,
      }).unwrap();
      notify.success(t("organizationDashboard.eventCatalog.messages.assigned"));
      closeAssignView();
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  });

  const nextPage = () => {
    const nextCursor = catalogQuery.data?.pageInfo?.nextCursor;
    if (nextCursor) setCursorStack((prev) => [...prev, nextCursor]);
  };

  const previousPage = () => setCursorStack((prev) => prev.slice(0, -1));

  const resetFilters = () => {
    setSearch("");
    setCategory(ALL_VALUE);
    setType(ALL_VALUE);
    setDeliveryMode(ALL_VALUE);
    setCursorStack([]);
  };

  return {
    t,
    form,
    type,
    events,
    search,
    setType,
    category,
    nextPage,
    setSearch,
    setCategory,
    deliveryMode,
    resetFilters,
    previousPage,
    selectedEvent,
    memberOptions,
    openAssignView,
    setDeliveryMode,
    selectedEventId,
    closeAssignView,
    submitAssignment,
    departmentOptions,
    page: cursorStack.length + 1,
    canPrevious: cursorStack.length > 0,
    isAssignViewOpen: Boolean(selectedEventId),
    totalCount: catalogQuery.data?.totalCount ?? 0,
    hasNextPage: Boolean(catalogQuery.data?.pageInfo?.hasNextPage),
    isLoading:
      catalogQuery.isFetching ||
      membersQuery.isFetching ||
      departmentsQuery.isFetching ||
      createAssignmentState.isLoading,
  };
};
