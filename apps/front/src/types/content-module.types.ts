import type { Control, FieldValues, Path } from "react-hook-form";
import type { TAddCalendarEventPrefill } from "@/types/professional-dashboard.types";
import type { TRequirementOption } from "@/types/professional-requirement.types";
import type { I18nContextValue } from "@/types/providers.types";
import type { TPduActivity } from "@/types/professional-dashboard.types";
import type { ContentType } from "@/lib/graphql/base";
import type { ReactNode } from "react";

import type { PublicCourse, PublicEvent } from "@/lib/server/public-content";
import type { PublicPodcastEpisode } from "@/lib/server/public-content";
import type { PublicYouTubeChannel } from "@/lib/server/public-content";
import type { PublicYouTubeVideo } from "@/lib/server/public-content";
import type { CatalogPageData } from "@/lib/server/catalog-reader";
import type { CatalogFacets } from "@/lib/server/catalog-reader";
import type { PublicPodcast } from "@/lib/server/public-content";

import type * as API from "@/lib/graphql/generated";

export type TContentTab = "courses" | "events" | "podcasts" | "youtube";

export type TContentCardKind = "course" | "event" | "podcast" | "youtube";

export type TContentCardDateBadge = {
  day: string;
  month: string;
};

export type TContentCardItem = {
  id: string;
  href: string;
  title: string;
  slug?: string | null;
  status?: string | null;
  byline?: string | null;
  rating?: number | null;
  kind: TContentCardKind;
  levelKey?: string | null;
  category?: string | null;
  originalLanguage?: boolean;
  categoryKey?: string | null;
  ratingCount?: string | null;
  metaPrimary?: string | null;
  contentLang?: string | null;
  metaSecondary?: string | null;
  dateBadge?: TContentCardDateBadge | null;
};

export type TContentCardLabels = {
  originalLanguage: string;
  cta: Record<TContentCardKind, string>;
  kind: Record<TContentCardKind, string>;
};

export type TSelectOption = {
  value: string;
  label: string;
};

export type TContentCardProps = {
  className?: string;
  overlay?: ReactNode;
  footerNote?: ReactNode;
  item: TContentCardItem;
};

export type TContentTabsProps = {
  activeTab: TContentTab;
};

export type TContentSearchHeroProps = {
  totalCount?: number;
  activeTab: TContentTab;
};

export type TFilterOption = {
  value: string;
  label: string;
};

export type TFilterField = {
  name: string;
  label: string;
  value: string;
  options: TFilterOption[];
};

export type TContentFilterValues = {
  q: string;
  level: string;
  rating: string;
  category: string;
  eventType: string;
};

export type TContentFilterFormProps = {
  tab: TContentTab;
  resetHref: string;
  retryHref: string;
  hasActiveFilters: boolean;
  values: TContentFilterValues;
  facets: CatalogFacets | null;
};

export type TContentResultsProps = {
  page: CatalogPageData;
};

export type TContentCatalogPaginationProps = {
  totalCount: number;
  nextHref: string | null;
  previousHref: string | null;
};

export type TCatalogNoticeProps = {
  restartHref: string;
  variant: "invalid" | "expired";
};

export type TEmptyStateProps = {
  resetHref?: string;
};

// ============== Details ================
export type TDetailBase = {
  id: string;
  slug: string;
  title: string;
  rating?: number | null;
  isFree?: boolean | null;
  currency?: string | null;
  category?: string | null;
  description?: string | null;
  ratingCount?: number | null;
  price?: number | string | null;
};

export type TContentActionInput = {
  contentId: string;
  contentType: API.ContentType;
};

export type TDetailMetaPillProps = {
  label: string;
  icon?: ReactNode;
  className?: string;
  multiline?: boolean;
  value?: string | number | null;
};

export type TDetailFact = {
  key: string;
  label: string;
  icon: ReactNode;
  value?: string | number | null;
};

export type TDetailSummaryItem = {
  key: string;
  label: string;
  value: string;
  hint?: string | null;
};

export type TDetailSummaryProps = {
  items: TDetailSummaryItem[];
};

export type TDetailLayoutProps = {
  header: ReactNode;
  sidebar: ReactNode;
  children?: ReactNode;
  breadcrumbs?: ReactNode;
};

export type TDetailPageHeaderProps = {
  title: string;
  badge: string;
  byline?: string | null;
  rating?: number | null;
  category?: string | null;
  ratingCount?: number | null;
  chips?: Array<string | null | undefined>;
  contentLanguage?: API.AppLanguage | null;
  availableLocales?: API.AppLanguage[] | null;
};

export type TDetailSidebarProps = {
  actions: ReactNode;
  summary?: ReactNode;
  facts: TDetailFact[];
  category?: string | null;
};

export type TDetailSectionProps = {
  title: string;
  children: ReactNode;
};

export type TDetailGoToContentProps = {
  url?: string | null;
  contentType: ContentType;
};

export type TDetailSidebarActionsProps = {
  contentType: ContentType;
  contentUrl: string | null;
  wishlist: TDetailHeroWishlist;
  completed: TMarkCompletedPrefill;
  prefill: TAddCalendarEventPrefill;
  register?: TDetailHeroPrimary | null;
};

export type TDetailPrimaryActionProps = {
  className?: string;
  contentType: ContentType;
  primary: TDetailHeroPrimary;
};

export type TDetailWishlistButtonProps = {
  className?: string;
  wishlist: TDetailHeroWishlist;
};

export type TDetailHeroWishlist = {
  loading?: boolean;
  onToggle: () => void;
  isWishlisted?: boolean;
};

export type TDetailHeroPrimary = {
  label: string;
  href?: string;
  done?: boolean;
  icon?: ReactNode;
  loading?: boolean;
  doneLabel?: string;
  onClick?: () => void;
};

export type TScheduleItem = {
  id: string;
  title: string;
  endTime: string;
  startTime: string;
  dayNumber: number;
  speaker?: string | null;
  description?: string | null;
};

export type TEventScheduleProps = {
  timeZone?: string | null;
  items?: TScheduleItem[] | null;
};

export type TEpisode = {
  id: string;
  title: string;
  episodeNumber: number;
  audioUrl?: string | null;
  description?: string | null;
  durationMinutes?: number | null;
};

export type TPodcastEpisodesProps = {
  episodes?: TEpisode[] | null;
};

export type TVideo = {
  id: string;
  title: string;
  views?: number | null;
  videoUrl?: string | null;
  description?: string | null;
  thumbnailUrl?: string | null;
  durationMinutes?: number | null;
};

export type TYouTubeVideosProps = {
  videos?: TVideo[] | null;
};

export type TCourseDetailPageProps = {
  course: PublicCourse;
  breadcrumbs?: ReactNode;
};

export type TEventDetailPageProps = {
  event: PublicEvent;
  breadcrumbs?: ReactNode;
};

export type TPodcastDetailPageProps = {
  podcast: PublicPodcast;
  breadcrumbs?: ReactNode;
  episodes: PublicPodcastEpisode[];
};

export type TYouTubeDetailPageProps = {
  breadcrumbs?: ReactNode;
  videos: PublicYouTubeVideo[];
  channel: PublicYouTubeChannel;
};

export type TAddToCalendarButtonProps = {
  className?: string;
  prefill: TAddCalendarEventPrefill;
  contentType?: API.ContentType | null;
};

export type TMarkCompletedRequirementLink = {
  key: string;
};

export type TMarkCompletedPrefill = {
  title: string;
  level?: string | null;
  contentId?: string | null;
  activityType: API.PduSource;
  roadmapArea?: string | null;
  creditValue?: number | null;
  durationMinutes?: number | null;
  associationName?: string | null;
  providerOrganizer?: string | null;
  category?: API.PduCategory | null;
  contentType?: API.ContentType | null;
  associationLearningContentId?: string | null;
  requirementLink?: TMarkCompletedRequirementLink | null;
};

export type TMarkAsCompletedButtonProps = {
  className?: string;
  prefill: TMarkCompletedPrefill;
};

export type TMarkAsCompletedDialogProps = {
  open: boolean;
  prefill: TMarkCompletedPrefill;
  existing?: TPduActivity | null;
  onOpenChange: (open: boolean) => void;
};

// ============ Assigned content detail interstitial ============
export type TAssignedContentDetailItem = {
  title: string;
  provider?: string | null;
  category?: string | null;
  externalUrl?: string | null;
  description?: string | null;
  associationName?: string | null;
  contentType?: ContentType | null;
  requirementLabel?: string | null;
  indicativeCredits?: number | null;
};

export type TAssignedContentDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: TAssignedContentDetailItem | null;
};

export type TRequirementSelectFieldProps<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  noneValue: string;
  noneLabel: string;
  disabled?: boolean;
  className?: string;
  control: Control<T>;
  t: I18nContextValue["t"];
  description?: string | null;
  options: TRequirementOption[];
  onValueChange?: (value: string) => void;
};
