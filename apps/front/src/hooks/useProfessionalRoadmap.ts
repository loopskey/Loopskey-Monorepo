"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { PAGE_SIZE } from "@/utils/constant";
import { useI18n } from "@/hooks/useI18n";

import * as API from "@/lib/rtk/endpoints/professional.api";
import * as GQL from "@/lib/graphql/generated";
import * as T from "@/types/professional-dashboard.types";

export const useProfessionalRoadmaps = () => {
  const { t } = useI18n();

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
  const myRoadmapsVariables = useMemo<GQL.ProfessionalMyRoadmapsQueryVariables>(
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
    useMemo<GQL.ProfessionalExploreRoadmapsQueryVariables>(
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
    search,
    isLoading,
    myRoadmaps,
    myPageInfo,
    isFetching,
    refetchAll,
    handleNext,
    formatWeeks,
    explorePage,
    learningSteps,
    exploreSearch,
    myRoadmapsData,
    getRoadmapHref,
    handlePrevious,
    featuredRoadmap,
    exploreRoadmaps,
    explorePageInfo,
    getProgressValue,
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
  };
};
