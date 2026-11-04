"use client";

import { ProfessionalMyRoadmapsQueryVariables } from "@/lib/graphql/operations/professional";
import { RoadmapDraftStatus, RoadmapSource } from "@/lib/graphql/base";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { useCallback, useEffect } from "react";
import { useRoadmapStepProgress } from "@/hooks/useRoadmapStepProgress";
import { ROADMAP_LIBRARY_VIEW } from "@/utils/roadmap-navigation.util";
import { ROADMAP_LIST_TAKE } from "@/utils/roadmap-library.util";
import { useRoadmapEdit } from "@/hooks/useRoadmapEdit";
import { useDispatch } from "react-redux";
import { useI18n } from "@/hooks/useI18n";

import * as API from "@/lib/rtk/endpoints/professional.api";
import * as T from "@/types/professional-dashboard.types";

import type { TAppDispatch } from "@/lib/rtk/store";

const DRAFT_POLL_INTERVAL_MS = 5000;

const ROADMAP_TAB_PATH = "/dashboard/professional";

export const MY_ROADMAPS_VARIABLES: ProfessionalMyRoadmapsQueryVariables = {
  pagination: { take: ROADMAP_LIST_TAKE },
};

export const useProfessionalRoadmaps = () => {
  const { t, language } = useI18n();
  const dispatch = useDispatch<TAppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const generationDraftId =
    searchParams.get("generationDraftId")?.trim() || undefined;
  const requestedRoadmapId = searchParams.get("roadmapId")?.trim() || undefined;
  const isLibraryView = searchParams.get("view") === ROADMAP_LIBRARY_VIEW;

  const [justCompleted, setJustCompleted] = useState<boolean>(false);

  const {
    data: myRoadmapsData,
    isError: isMyRoadmapsError,
    refetch: refetchMyRoadmaps,
    isLoading: isMyRoadmapsLoading,
    isFetching: isMyRoadmapsFetching,
  } = API.useProfessionalMyRoadmapsQuery(MY_ROADMAPS_VARIABLES, {
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  const myRoadmaps = useMemo<T.TProfessionalRoadmap[]>(
    () => myRoadmapsData?.items ?? [],
    [myRoadmapsData?.items],
  );

  const activeRoadmap = useMemo(
    () =>
      myRoadmaps.find((roadmap) => roadmap.id === requestedRoadmapId) ??
      myRoadmaps.find(
        (roadmap) => roadmap.source === RoadmapSource.Generated,
      ) ??
      myRoadmaps[0],
    [myRoadmaps, requestedRoadmapId],
  );

  const [draftPollMs, setDraftPollMs] = useState(0);
  const { data: draft } = API.useProfessionalRoadmapGenerationStatusQuery(
    generationDraftId ? { draftId: generationDraftId } : undefined,
    {
      pollingInterval: draftPollMs,
    },
  );

  useEffect(() => {
    const generating = draft?.status === RoadmapDraftStatus.Generating;
    setDraftPollMs(generating ? DRAFT_POLL_INTERVAL_MS : 0);
  }, [draft?.status]);

  const handledTerminalDraftIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!draft) return;
    const completed = draft.status === RoadmapDraftStatus.Completed;
    const terminal = completed || draft.status === RoadmapDraftStatus.Failed;
    if (!terminal || handledTerminalDraftIdRef.current === draft.id) return;

    handledTerminalDraftIdRef.current = draft.id;
    dispatch(API.professionalApi.util.invalidateTags(["ProfessionalRoadmaps"]));

    if (completed) {
      setJustCompleted(true);
      router.replace(`${ROADMAP_TAB_PATH}?tab=roadmap`);
    }
  }, [draft, dispatch, router]);

  const isGenerating = draft?.status === RoadmapDraftStatus.Generating;
  const hasFailedDraft = draft?.status === RoadmapDraftStatus.Failed;

  const { data: recommendations } =
    API.useProfessionalRoadmapRecommendationsQuery(
      activeRoadmap ? { enrollmentId: activeRoadmap.id } : undefined,
      { skip: isLibraryView || !activeRoadmap },
    );

  const stepProgress = useRoadmapStepProgress(MY_ROADMAPS_VARIABLES);

  const { edit: handleEdit, editingRoadmapId } = useRoadmapEdit();

  const [unenrollRoadmap] = API.useUnenrollRoadmapMutation();
  const [unenrollingId, setUnenrollingId] = useState<string | null>(null);

  const [retryGeneration, { isLoading: isRetryingGeneration }] =
    API.useRetryRoadmapGenerationMutation();
  const handleRetryGeneration = useCallback(async () => {
    if (!draft) return;
    try {
      await retryGeneration(draft.id).unwrap();
    } catch {
      return;
    }
  }, [draft, retryGeneration]);

  const handleUnenroll = useCallback(
    async (enrollmentId: string) => {
      setUnenrollingId(enrollmentId);
      try {
        await unenrollRoadmap({ enrollmentId }).unwrap();
      } catch {
        return;
      } finally {
        setUnenrollingId(null);
      }
    },
    [unenrollRoadmap],
  );

  const acknowledgeCompletion = useCallback(() => setJustCompleted(false), []);

  return {
    t,
    draft,
    handleEdit,
    myRoadmaps,
    isGenerating,
    stepProgress,
    unenrollingId,
    justCompleted,
    activeRoadmap,
    isLibraryView,
    handleUnenroll,
    myRoadmapsData,
    hasFailedDraft,
    locale: language,
    editingRoadmapId,
    isMyRoadmapsError,
    refetchMyRoadmaps,
    isMyRoadmapsLoading,
    isMyRoadmapsFetching,
    isRetryingGeneration,
    handleRetryGeneration,
    acknowledgeCompletion,
    recommendations: recommendations ?? [],
  };
};
