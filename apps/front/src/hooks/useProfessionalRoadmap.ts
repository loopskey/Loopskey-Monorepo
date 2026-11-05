"use client";

import { ProfessionalMyRoadmapsQueryVariables } from "@/lib/graphql/operations/professional";
import { ROADMAP_NEXT_STEP_ELEMENT_ID } from "@/utils/roadmap-navigation.util";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { useCallback, useEffect } from "react";
import { useRoadmapStepProgress } from "@/hooks/useRoadmapStepProgress";
import { RoadmapDraftStatus } from "@/lib/graphql/base";
import { ROADMAP_LIST_TAKE } from "@/utils/roadmap-library.util";
import { useRoadmapEdit } from "@/hooks/useRoadmapEdit";
import { roadmapState } from "@/utils/roadmap-library.util";
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

  const defaultOpenId =
    requestedRoadmapId ??
    (
      myRoadmaps.find((roadmap) => roadmapState(roadmap) === "inProgress") ??
      myRoadmaps[0]
    )?.id ??
    null;
  const [openChoice, setOpenChoice] = useState<{
    requested?: string;
    id: string | null;
  } | null>(null);
  const openRoadmapId =
    openChoice && openChoice.requested === requestedRoadmapId
      ? openChoice.id
      : defaultOpenId;
  const openRoadmap = myRoadmaps.find(
    (roadmap) => roadmap.id === openRoadmapId,
  );

  const showRoadmap = useCallback(
    (roadmapId: string | null) => {
      setOpenChoice({ requested: roadmapId ?? undefined, id: roadmapId });
      const params = new URLSearchParams(searchParams.toString());
      if (roadmapId) params.set("roadmapId", roadmapId);
      else params.delete("roadmapId");
      router.replace(`${ROADMAP_TAB_PATH}?${params.toString()}`, {
        scroll: false,
      });
    },
    [router, searchParams],
  );

  const toggleRoadmap = (roadmapId: string) =>
    showRoadmap(openRoadmapId === roadmapId ? null : roadmapId);

  const [pendingContinueId, setPendingContinueId] = useState<string | null>(
    null,
  );

  const continueRoadmap = (roadmapId: string) => {
    setPendingContinueId(roadmapId);
    if (openRoadmapId !== roadmapId) showRoadmap(roadmapId);
  };

  useEffect(() => {
    if (!pendingContinueId || openRoadmap?.id !== pendingContinueId) return;
    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById(ROADMAP_NEXT_STEP_ELEMENT_ID);
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      target?.scrollIntoView({
        block: "center",
        behavior: reduceMotion ? "auto" : "smooth",
      });
      target?.focus({ preventScroll: true });
      setPendingContinueId(null);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pendingContinueId, openRoadmap?.id]);

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
      openRoadmap ? { enrollmentId: openRoadmap.id } : undefined,
      { skip: !openRoadmap },
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
    openRoadmap,
    isGenerating,
    stepProgress,
    unenrollingId,
    justCompleted,
    toggleRoadmap,
    handleUnenroll,
    myRoadmapsData,
    hasFailedDraft,
    continueRoadmap,
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
