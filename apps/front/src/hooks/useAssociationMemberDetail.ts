"use client";

import { getAssociationErrorTranslationKey } from "@utils/association-error";
import { useCallback, useMemo, useState } from "react";
import { downloadAssociationMemberFile } from "@utils/association-member-files";
import { AssociationAttributionState } from "@/lib/graphql/base";
import { TAssociationDownloadKind } from "@utils/association-member-files";
import { AssociationMemberStatus } from "@/lib/graphql/base";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useI18n } from "@hooks/useI18n";
import { notify } from "@hooks/notify";

import * as API from "@lib/rtk/endpoints/association-dashboard.api";
import * as SC from "@lib/validations/association-dashboard.schema";
import * as T from "@/types/association-dashboard.types";

const PAGE_SIZE = 10;

const ALL = "ALL";

const NO_GROUP = "NONE";

export const useAssociationMemberDetail = (memberId: string) => {
  const { t, language } = useI18n();
  const router = useRouter();

  const [stateFilter, setStateFilter] = useState<string>(ALL);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [openActivityId, setOpenActivityId] = useState<string | null>(null);
  const [decision, setDecision] = useState<T.TAssociationDecision | null>(null);
  const [isEditOpen, setEditOpen] = useState(false);
  const [isRequirementsOpen, setRequirementsOpen] = useState(false);
  const [selectedRequirements, setSelectedRequirements] = useState<
    string[] | null
  >(null);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(
    null,
  );

  const profileQuery = API.useAssociationMemberProfileQuery({ memberId });

  const activitiesQuery = API.useAssociationMemberActivitiesQuery({
    memberId,
    filter:
      stateFilter === ALL
        ? undefined
        : { state: stateFilter as AssociationAttributionState },
    pagination: { take: PAGE_SIZE, cursor: cursorStack.at(-1) },
  });

  const optionsQuery = API.useAssociationMemberRequirementOptionsQuery(
    { memberId },
    { skip: !isRequirementsOpen },
  );

  const groupsQuery = API.useAssociationGroupsQuery(undefined, {
    skip: !isEditOpen,
  });

  const [review, reviewState] =
    API.useReviewAssociationLearningActivityMutation();
  const [updateMember, updateMemberState] =
    API.useUpdateAssociationMemberMutation();
  const [setMemberStatus, setMemberStatusState] =
    API.useSetAssociationMemberStatusMutation();
  const [setRequirements, setRequirementsState] =
    API.useSetAssociationMemberRequirementsMutation();

  const detailsForm = useForm<SC.TAssociationMemberDetailsForm>({
    resolver: zodResolver(SC.associationMemberDetailsSchema),
    defaultValues: { fullName: "", memberNumber: "", groupId: "" },
  });

  const rejectionForm = useForm<SC.TAssociationRejectionForm>({
    resolver: zodResolver(SC.associationRejectionSchema),
    defaultValues: { reason: "" },
  });

  const profile = profileQuery.data;
  const member = profile?.member;
  const summary = profile?.summary;

  const assignments = useMemo(
    () => profile?.assignments ?? [],
    [profile?.assignments],
  );

  const activities = useMemo(
    () => activitiesQuery.data?.items ?? [],
    [activitiesQuery.data?.items],
  );

  const openActivity = useMemo(
    () => activities.find((activity) => activity.id === openActivityId) ?? null,
    [activities, openActivityId],
  );

  const categoryRows = useMemo(
    () =>
      assignments.flatMap((assignment) =>
        assignment.categories.map((category) => ({
          id: `${assignment.id}:${category.id}`,
          name: category.name,
          requirementName: assignment.requirementName,
          completedCredits: category.completedCredits,
          requiredCredits: category.requiredCredits,
          percent: category.percent,
        })),
      ),
    [assignments],
  );

  const cycleAssignment = useMemo(
    () =>
      assignments.find(
        (assignment) =>
          assignment.requirementId === summary?.nearestRequirementId,
      ) ?? null,
    [assignments, summary?.nearestRequirementId],
  );

  const cumulativeRows = useMemo<T.TAssociationCumulativePoint[]>(() => {
    const points = profile?.cumulative ?? [];
    if (!cycleAssignment || !points.length) return [];

    const start = new Date(cycleAssignment.cycleStart as string).getTime();
    const due = cycleAssignment.dueDate
      ? new Date(cycleAssignment.dueDate as string).getTime()
      : null;
    const required = cycleAssignment.requiredCredits;

    const paceAt = (moment: number) => {
      if (!due || due <= start) return required;
      const elapsed = (moment - start) / (due - start);
      return Math.min(required, Math.max(0, elapsed * required));
    };

    const middle = points.map((point) => ({
      date: point.date as string,
      credits: point.credits,
      pace: paceAt(new Date(point.date as string).getTime()),
    }));

    return [
      { date: cycleAssignment.cycleStart as string, credits: 0, pace: 0 },
      ...middle,
      ...(due
        ? [
            {
              date: cycleAssignment.dueDate as string,
              credits: null,
              pace: required,
            },
          ]
        : []),
    ];
  }, [profile?.cumulative, cycleAssignment]);

  const groupOptions = useMemo(
    () => [
      {
        value: NO_GROUP,
        label: t("associationDashboard.memberDetail.noGroup"),
      },
      ...(groupsQuery.data ?? [])
        .filter((group) => group.isActive)
        .map((group) => ({ value: group.id, label: group.title })),
    ],
    [groupsQuery.data, t],
  );

  const requirementOptions = useMemo(
    () => optionsQuery.data ?? [],
    [optionsQuery.data],
  );

  const failWith = useCallback(
    (error: unknown) =>
      notify.error(t(getAssociationErrorTranslationKey(error))),
    [t],
  );

  const changeStateFilter = (value: string) => {
    setCursorStack([]);
    setStateFilter(value);
  };

  const nextPage = () => {
    const nextCursor = activitiesQuery.data?.pageInfo?.nextCursor;
    if (nextCursor) setCursorStack((previous) => [...previous, nextCursor]);
  };

  const previousPage = () =>
    setCursorStack((previous) => previous.slice(0, -1));

  const backToRoster = () => router.push("/dashboard/association?tab=members");

  const openEvidence = (activityId: string) => setOpenActivityId(activityId);

  const closeEvidence = () => setOpenActivityId(null);

  const openDecision = (activityId: string, approve: boolean) => {
    rejectionForm.reset({ reason: "" });
    setDecision({ activityId, approve });
  };

  const closeDecision = () => setDecision(null);

  const settle = async (activityId: string, approve: boolean, reason = "") => {
    await review({ activityId, approve, reason: reason || undefined }).unwrap();
    notify.success(
      t(
        approve
          ? "associationDashboard.memberDetail.messages.approved"
          : "associationDashboard.memberDetail.messages.rejected",
      ),
    );
    setDecision(null);
    setOpenActivityId(null);
  };

  const confirmApproval = async () => {
    if (!decision?.approve) return;
    try {
      await settle(decision.activityId, true);
    } catch (error) {
      failWith(error);
    }
  };

  const submitRejection = rejectionForm.handleSubmit(async (values) => {
    if (!decision) return;
    try {
      await settle(decision.activityId, false, values.reason.trim());
    } catch (error) {
      failWith(error);
    }
  });

  const openEdit = () => {
    detailsForm.reset({
      fullName: member?.fullName ?? "",
      memberNumber: member?.memberNumber ?? "",
      groupId: member?.group?.id ?? NO_GROUP,
    });
    setEditOpen(true);
  };

  const canRenameMember = !member?.activatedAt;

  const submitEdit = detailsForm.handleSubmit(async (values) => {
    const fullName = values.fullName.trim();

    try {
      await updateMember({
        memberId,
        memberNumber: values.memberNumber?.trim() ?? "",
        groupId: values.groupId === NO_GROUP ? "" : values.groupId,
        ...(canRenameMember && fullName !== member?.fullName
          ? { fullName }
          : {}),
      }).unwrap();
      notify.success(t("associationDashboard.memberDetail.messages.saved"));
      setEditOpen(false);
    } catch (error) {
      failWith(error);
    }
  });

  const openRequirements = () => {
    setSelectedRequirements(null);
    setRequirementsOpen(true);
  };

  const assignedRequirementIds = useMemo(
    () =>
      requirementOptions
        .filter((option) => option.isAssigned)
        .map((option) => option.id),
    [requirementOptions],
  );

  const selection = selectedRequirements ?? assignedRequirementIds;

  const toggleRequirement = (requirementId: string) =>
    setSelectedRequirements(
      selection.includes(requirementId)
        ? selection.filter((id) => id !== requirementId)
        : [...selection, requirementId],
    );

  const submitRequirements = async () => {
    try {
      const result = await setRequirements({
        memberId,
        requirementIds: selection,
      }).unwrap();

      notify.success(
        t("associationDashboard.memberDetail.messages.requirementsChanged", {
          added: result.added,
          removed: result.removed,
        }),
      );
      setRequirementsOpen(false);
      setSelectedRequirements(null);
    } catch (error) {
      failWith(error);
    }
  };

  const changeStatus = async (status: AssociationMemberStatus) => {
    try {
      await setMemberStatus({ memberId, status }).unwrap();
      notify.success(
        t(
          status === AssociationMemberStatus.Inactive
            ? "associationDashboard.members.messages.memberDeactivated"
            : "associationDashboard.members.messages.memberReactivated",
        ),
      );
    } catch (error) {
      failWith(error);
    }
  };

  const download = async (
    kind: TAssociationDownloadKind,
    file: { id: string; fileName: string },
  ) => {
    setDownloadingFileId(file.id);
    try {
      await downloadAssociationMemberFile(kind, memberId, file);
    } catch {
      notify.error(
        t("associationDashboard.memberDetail.errors.downloadFailed"),
      );
    } finally {
      setDownloadingFileId(null);
    }
  };

  const isMutating =
    reviewState.isLoading ||
    updateMemberState.isLoading ||
    setMemberStatusState.isLoading ||
    setRequirementsState.isLoading;

  return {
    t,
    member,
    summary,
    decision,
    download,
    nextPage,
    memberId,
    isMutating,
    openEdit,
    isEditOpen,
    setEditOpen,
    detailsForm,
    submitEdit,
    canRenameMember,
    groupOptions,
    activities,
    assignments,
    categoryRows,
    stateFilter,
    openActivity,
    openEvidence,
    closeEvidence,
    openDecision,
    closeDecision,
    rejectionForm,
    submitRejection,
    confirmApproval,
    previousPage,
    backToRoster,
    changeStatus,
    cumulativeRows,
    cycleAssignment,
    selection,
    toggleRequirement,
    openRequirements,
    isRequirementsOpen,
    setRequirementsOpen,
    requirementOptions,
    submitRequirements,
    downloadingFileId,
    changeStateFilter,
    certificates: profile?.certificates ?? [],
    counts: activitiesQuery.data?.counts,
    page: cursorStack.length + 1,
    canPrevious: cursorStack.length > 0,
    locale: language === "fr" ? "fr-FR" : "en-GB",
    totalCount: activitiesQuery.data?.totalCount ?? 0,
    hasNextPage: Boolean(activitiesQuery.data?.pageInfo?.hasNextPage),
    isSavingRequirements: setRequirementsState.isLoading,
    isOptionsLoading: optionsQuery.isLoading,
    isDeciding: reviewState.isLoading,
    isActivitiesLoading: activitiesQuery.isLoading,
    isActivitiesRefetching:
      activitiesQuery.isFetching && !activitiesQuery.isLoading,
    isActivitiesError: activitiesQuery.isError,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    retry: () => {
      void profileQuery.refetch();
      void activitiesQuery.refetch();
    },
  };
};

export type TUseAssociationMemberDetail = ReturnType<
  typeof useAssociationMemberDetail
>;
