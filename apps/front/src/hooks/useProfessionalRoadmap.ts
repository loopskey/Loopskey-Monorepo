"use client";

import { ProfessionalExploreRoadmapsQueryVariables } from "@/lib/graphql/operations/professional";
import { ProfessionalMyRoadmapsQueryVariables } from "@/lib/graphql/operations/professional";
import { ChangeEvent, useCallback, useEffect } from "react";
import { RoadmapDraftStatus, RoadmapSource } from "@/lib/graphql/base";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { useRoadmapStepProgress } from "@/hooks/useRoadmapStepProgress";
import { useDispatch } from "react-redux";
import { PAGE_SIZE } from "@/utils/constant";
import { useI18n } from "@/hooks/useI18n";

import * as API from "@/lib/rtk/endpoints/professional.api";
import * as T from "@/types/professional-dashboard.types";

import type { TAppDispatch } from "@/lib/rtk/store";

const DRAFT_POLL_INTERVAL_MS = 5000;

const ROADMAP_TAB_PATH = "/dashboard/professional";

export const useProfessionalRoadmaps = () => {
  const { t, language } = useI18n();
  const dispatch = useDispatch<TAppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const generationDraftId =
    searchParams.get("generationDraftId")?.trim() || undefined;

  // ============= States ===============
  const [justCompleted, setJustCompleted] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [exploreSearch, setExploreSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [explorePage, setExplorePage] = useState<number>(1);
  const [exploreCursorStack, setExploreCursorStack] = useState<string[]>([]);

  const currentCursor = cursorStack.at(-1);
  const currentExploreCursor = exploreCursorStack.at(-1);

  // =============== Use Memo =============
  const myRoadmapsVariables = useMemo<ProfessionalMyRoadmapsQueryVariables>(
    () => ({
      filter: {
        search: search.trim() || undefined,
      },
      pagination: {
        take: PAGE_SIZE,
        cursor: currentCursor,
      },
    }),
    [search, currentCursor],
  );

  const exploreRoadmapsVariables =
    useMemo<ProfessionalExploreRoadmapsQueryVariables>(
      () => ({
        filter: {
          search: exploreSearch.trim() || undefined,
        },
        pagination: {
          take: PAGE_SIZE,
          cursor: currentExploreCursor,
        },
      }),
      [exploreSearch, currentExploreCursor],
    );

  const {
    data: myRoadmapsData,
    isLoading: isMyRoadmapsLoading,
    isFetching: isMyRoadmapsFetching,
  } = API.useProfessionalMyRoadmapsQuery(myRoadmapsVariables, {
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  const {
    data: exploreRoadmapsData,
    isLoading: isExploreRoadmapsLoading,
    isFetching: isExploreRoadmapsFetching,
  } = API.useProfessionalExploreRoadmapsQuery(exploreRoadmapsVariables, {
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  const myRoadmaps = useMemo<T.TProfessionalRoadmap[]>(() => {
    return myRoadmapsData?.items ?? [];
  }, [myRoadmapsData?.items]);

  const exploreRoadmaps = useMemo<T.TProfessionalExploreRoadmap[]>(() => {
    return exploreRoadmapsData?.items ?? [];
  }, [exploreRoadmapsData?.items]);

  const myPageInfo = myRoadmapsData?.pageInfo;
  const explorePageInfo = exploreRoadmapsData?.pageInfo;

  const {
    data: statsData,
    isLoading: isStatsLoading,
    isError: isStatsError,
  } = API.useProfessionalRoadmapStatsQuery(undefined, {
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  const stats = useMemo<T.TRoadmapStats>(
    () => ({
      enrolled: statsData?.enrolledCount ?? 0,
      averageProgress: statsData?.averageProgress ?? 0,
      completedPhases: statsData?.completedPhaseCount ?? 0,
      totalPhases: statsData?.totalPhaseCount ?? 0,
      nextMilestone: statsData?.nextMilestone ?? null,
      totalEarnedCredits: statsData?.totalEarnedCredits ?? 0,
      totalRequiredCredits: statsData?.totalRequiredCredits ?? null,
    }),
    [statsData],
  );

  const generatedRoadmap = useMemo(
    () =>
      myRoadmaps.find((roadmap) => roadmap.source === RoadmapSource.Generated),
    [myRoadmaps],
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
    dispatch(
      API.professionalApi.util.invalidateTags([
        "ProfessionalRoadmaps",
        "ProfessionalRoadmapStats",
      ]),
    );

    if (completed) {
      setJustCompleted(true);
      router.replace(`${ROADMAP_TAB_PATH}?tab=roadmap`);
    }
  }, [draft, dispatch, router]);

  const isGenerating = draft?.status === RoadmapDraftStatus.Generating;
  const hasFailedDraft = draft?.status === RoadmapDraftStatus.Failed;

  const { data: recommendations } =
    API.useProfessionalRoadmapRecommendationsQuery(
      generatedRoadmap ? { enrollmentId: generatedRoadmap.id } : undefined,
    );

  const stepProgress = useRoadmapStepProgress(myRoadmapsVariables);

  const [unenrollRoadmap] = API.useUnenrollRoadmapMutation();
  const [unenrollingId, setUnenrollingId] = useState<string | null>(null);

  const [retryGeneration, { isLoading: isRetryingGeneration }] =
    API.useRetryRoadmapGenerationMutation();
  const handleRetryGeneration = useCallback(async () => {
    if (!draft) return;
    try {
      await retryGeneration(draft.id).unwrap();
    } catch {
      // The generation card surfaces `status`/`failure` from the poll, so a
      // rejected retry just leaves the failed card in place to try again.
    }
  }, [draft, retryGeneration]);

  const handleUnenroll = useCallback(
    async (enrollmentId: string) => {
      setUnenrollingId(enrollmentId);
      try {
        await unenrollRoadmap({ enrollmentId }).unwrap();
      } catch {
        // The tag invalidation still runs on rejection because RTK Query
        // only skips it for aborted requests; nothing further to do here.
      } finally {
        setUnenrollingId(null);
      }
    },
    [unenrollRoadmap],
  );

  const otherRoadmaps = useMemo(
    () => myRoadmaps.filter((roadmap) => roadmap.id !== generatedRoadmap?.id),
    [myRoadmaps, generatedRoadmap],
  );

  const isLoading = isMyRoadmapsLoading || isExploreRoadmapsLoading;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
    setCursorStack([]);
  };

  const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleSearchChange(event.target.value);
  };

  const handleExploreSearchChange = (value: string) => {
    setExploreSearch(value);
    setExplorePage(1);
    setExploreCursorStack([]);
  };

  const handleExploreSearchInputChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    handleExploreSearchChange(event.target.value);
  };

  const handleNext = () => {
    if (!myPageInfo?.hasNextPage || !myPageInfo.nextCursor) return;
    setCursorStack((previousStack) => [
      ...previousStack,
      myPageInfo.nextCursor!,
    ]);
    setPage((previousPage) => previousPage + 1);
  };

  const handlePrevious = () => {
    setCursorStack((previousStack) => previousStack.slice(0, -1));
    setPage((previousPage) => Math.max(1, previousPage - 1));
  };

  const handleExploreNext = () => {
    if (!explorePageInfo?.hasNextPage || !explorePageInfo.nextCursor) return;
    setExploreCursorStack((previousStack) => [
      ...previousStack,
      explorePageInfo.nextCursor!,
    ]);
    setExplorePage((previousPage) => previousPage + 1);
  };

  const handleExplorePrevious = () => {
    setExploreCursorStack((previousStack) => previousStack.slice(0, -1));
    setExplorePage((previousPage) => Math.max(1, previousPage - 1));
  };

  const formatWeeks = (weeks?: number | null) => {
    return `${Number(weeks ?? 0)} ${t("professionalDashboard.roadmap.weeks")}`;
  };

  const getRoadmapHref = (roadmap: { slug?: string | null; id: string }) => {
    return roadmap.slug
      ? `/roadmaps/${roadmap.slug}`
      : `/roadmaps/${roadmap.id}`;
  };

  const getProgressValue = (progress?: number | null) => {
    return Math.min(Math.max(Number(progress ?? 0), 0), 100);
  };

  const acknowledgeCompletion = useCallback(() => setJustCompleted(false), []);

  return {
    t,
    page,
    stats,
    draft,
    search,
    isLoading,
    myRoadmaps,
    myPageInfo,
    handleNext,
    formatWeeks,
    explorePage,
    isGenerating,
    stepProgress,
    isStatsError,
    otherRoadmaps,
    unenrollingId,
    justCompleted,
    handleUnenroll,
    exploreSearch,
    myRoadmapsData,
    getRoadmapHref,
    handlePrevious,
    hasFailedDraft,
    isStatsLoading,
    exploreRoadmaps,
    explorePageInfo,
    locale: language,
    getProgressValue,
    generatedRoadmap,
    handleExploreNext,
    handleSearchChange,
    exploreRoadmapsData,
    isMyRoadmapsLoading,
    isMyRoadmapsFetching,
    isRetryingGeneration,
    handleRetryGeneration,
    handleExplorePrevious,
    acknowledgeCompletion,
    handleSearchInputChange,
    isExploreRoadmapsLoading,
    isExploreRoadmapsFetching,
    handleExploreSearchChange,
    handleExploreSearchInputChange,
    recommendations: recommendations ?? [],
  };
};
