"use client";

import { ProfessionalExploreRoadmapsQueryVariables } from "@/lib/graphql/operations/professional";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { ProfessionalMyRoadmapsQueryVariables } from "@/lib/graphql/operations/professional";
import { RoadmapDraftStatus, RoadmapSource } from "@/lib/graphql/base";
import { useRoadmapStepProgress } from "@/hooks/useRoadmapStepProgress";
import { skipToken } from "@reduxjs/toolkit/query";
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
    refetch: refetchMyRoadmaps,
  } = API.useProfessionalMyRoadmapsQuery(myRoadmapsVariables);

  const {
    data: exploreRoadmapsData,
    isLoading: isExploreRoadmapsLoading,
    isFetching: isExploreRoadmapsFetching,
    refetch: refetchExploreRoadmaps,
  } = API.useProfessionalExploreRoadmapsQuery(exploreRoadmapsVariables);

  const myRoadmaps = useMemo<T.TProfessionalRoadmap[]>(() => {
    return myRoadmapsData?.items ?? [];
  }, [myRoadmapsData?.items]);

  const exploreRoadmaps = useMemo<T.TProfessionalExploreRoadmap[]>(() => {
    return exploreRoadmapsData?.items ?? [];
  }, [exploreRoadmapsData?.items]);

  const myPageInfo = myRoadmapsData?.pageInfo;
  const explorePageInfo = exploreRoadmapsData?.pageInfo;

  const stats = useMemo<T.TRoadmapStats>(() => {
    const enrolled = myRoadmapsData?.totalCount ?? 0;
    const averageProgress =
      myRoadmaps.length > 0
        ? Math.round(
            myRoadmaps.reduce((sum, roadmap) => {
              return sum + Number(roadmap.progress ?? 0);
            }, 0) / myRoadmaps.length,
          )
        : 0;
    const completedPhases = myRoadmaps.reduce((sum, roadmap) => {
      return sum + Number(roadmap.completedPhases ?? 0);
    }, 0);

    const nextMilestone =
      averageProgress >= 100
        ? 100
        : Math.min(Math.ceil((averageProgress + 1) / 25) * 25, 100);
    return {
      enrolled,
      nextMilestone,
      averageProgress,
      completedPhases,
    };
  }, [myRoadmaps, myRoadmapsData?.totalCount]);

  const learningSteps = useMemo(() => {
    const selectedRoadmap = myRoadmaps[0];
    return selectedRoadmap?.phases ?? [];
  }, [myRoadmaps]);

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
      generatedRoadmap ? { enrollmentId: generatedRoadmap.id } : skipToken,
    );

  const stepProgress = useRoadmapStepProgress(myRoadmapsVariables);

  const featuredRoadmap = myRoadmaps[0];
  const isLoading = isMyRoadmapsLoading || isExploreRoadmapsLoading;
  const isFetching = isMyRoadmapsFetching || isExploreRoadmapsFetching;

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

  const refetchAll = () => {
    refetchMyRoadmaps();
    refetchExploreRoadmaps();
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
    myPageInfo,
    isFetching,
    refetchAll,
    handleNext,
    formatWeeks,
    explorePage,
    isGenerating,
    stepProgress,
    learningSteps,
    exploreSearch,
    myRoadmapsData,
    getRoadmapHref,
    handlePrevious,
    hasFailedDraft,
    featuredRoadmap,
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
    handleExplorePrevious,
    handleSearchInputChange,
    isExploreRoadmapsLoading,
    isExploreRoadmapsFetching,
    handleExploreSearchChange,
    handleExploreSearchInputChange,
    recommendations: recommendations ?? [],
  };
};
