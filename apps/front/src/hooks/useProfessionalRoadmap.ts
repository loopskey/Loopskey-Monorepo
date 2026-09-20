"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { ProfessionalExploreRoadmapsQueryVariables } from "@/lib/graphql/operations/professional";
import { ProfessionalMyRoadmapsQueryVariables } from "@/lib/graphql/operations/professional";
import { RoadmapDraftStatus, RoadmapSource } from "@/lib/graphql/base";
import { useRoadmapStepProgress } from "@/hooks/useRoadmapStepProgress";
import { PAGE_SIZE } from "@/utils/constant";
import { useI18n } from "@/hooks/useI18n";

import * as API from "@/lib/rtk/endpoints/professional.api";
import * as T from "@/types/professional-dashboard.types";

const DRAFT_POLL_INTERVAL_MS = 5000;

export const useProfessionalRoadmaps = () => {
  const { t, language } = useI18n();

  // ============= States ===============
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
  const { data: draft } = API.useProfessionalRoadmapDraftStatusQuery(
    undefined,
    {
      pollingInterval: draftPollMs,
    },
  );

  useEffect(() => {
    const generating =
      !generatedRoadmap && draft?.status === RoadmapDraftStatus.Generating;
    setDraftPollMs(generating ? DRAFT_POLL_INTERVAL_MS : 0);
  }, [draft?.status, generatedRoadmap]);

  const isGenerating =
    !generatedRoadmap && draft?.status === RoadmapDraftStatus.Generating;
  const hasFailedDraft =
    !generatedRoadmap && draft?.status === RoadmapDraftStatus.Failed;

  const { data: recommendations } =
    API.useProfessionalRoadmapRecommendationsQuery(
      generatedRoadmap ? { enrollmentId: generatedRoadmap.id } : undefined,
    );

  const stepProgress = useRoadmapStepProgress(myRoadmapsVariables);

  const [unenrollRoadmap] = API.useUnenrollRoadmapMutation();
  const [unenrollingId, setUnenrollingId] = useState<string | null>(null);

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

  // The active generated roadmap already has its own dedicated section
  // above; keep it out of the general "My roadmaps" grid so it is reachable
  // exactly one way, through Continue.
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

  return {
    t,
    page,
    stats,
    draft,
    search,
    isLoading,
    myRoadmaps,
    otherRoadmaps,
    myPageInfo,
    handleNext,
    formatWeeks,
    explorePage,
    isGenerating,
    stepProgress,
    isStatsError,
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
    handleUnenroll,
    unenrollingId,
    exploreRoadmapsData,
    isMyRoadmapsLoading,
    isMyRoadmapsFetching,
    handleExplorePrevious,
    handleSearchInputChange,
    isExploreRoadmapsLoading,
    isExploreRoadmapsFetching,
    handleExploreSearchChange,
    handleExploreSearchInputChange,
    recommendations: recommendations ?? [],
  };
};
