import type { TAddCalendarEventPrefill } from "@/types/professional-dashboard.types";
import type { TRequirementOption } from "@/types/professional-requirement.types";
import type { TPduActivity } from "@/types/professional-dashboard.types";
import type { I18nContextValue } from "@/types/providers.types";
import type { Control, FieldValues, Path } from "react-hook-form";
import type { ContentType } from "@/lib/graphql/base";
import type { ReactNode } from "react";

import type * as API from "@/lib/graphql/generated";

export type TContentTab = "courses" | "events" | "podcasts" | "youtube";

export type TContentCardKind = "course" | "event" | "podcast" | "youtube";

export type TContentCardItem = {
  id: string;
  href: string;
  title: string;
  slug?: string | null;
  price?: number | null;
  status?: string | null;
  rating?: number | null;
  kind: TContentCardKind;
  isFree?: boolean | null;
  imageUrl?: string | null;
  category?: string | null;
  categoryCode?: string | null;
  description?: string | null;
  metaPrimary?: string | null;
  metaSecondary?: string | null;
};

export type TSelectOption = {
  value: string;
  label: string;
};

export type TFacetState = {
  isLoading: boolean;
  hasError: boolean;
  onRetry: () => void;
};

export type TEnumFacet = {
  value: string;
  count: number;
};

export type TRatingFacet = {
  minimum: number;
  count: number;
};

export type TCursorState = {
  page: number;
  cursor?: string;
  history: string[];
};

export type TCourseFilters = {
  minRating?: string;
  level?: API.CourseLevel | "";
  category?: API.CourseCategory | "";
};

export type TEventFilters = {
  type?: API.EventType | "";
  category?: API.EventCategory | "";
};

export type TPodcastFilters = {
  category?: API.PodcastCategory | "";
};

export type TYouTubeFilters = {
  category?: API.YouTubeCategory | "";
};

export type TContentCardProps = {
  className?: string;
  item: TContentCardItem;
};

export type TContentTabOption = {
  value: TContentTab;
  label: string;
};

export type TContentTabsProps = {
  label: string;
  activeTab: TContentTab;
  tabs: TContentTabOption[];
  onChange: (tab: TContentTab) => void;
};

export type TContentSearchHeroProps = {
  totalCount?: number;
  activeTab: TContentTab;
};

export type TFilterPanelProps = {
  title: string;
  search: string;
  filters: Array<{
    key: string;
    label: string;
    value?: string;
    placeholder: string;
    options: TSelectOption[];
    isLoading: boolean;
    hasError: boolean;
    onRetry: () => void;
    onChange: (value: string) => void;
  }>;
  onReset: () => void;
  onSearchChange: (value: string) => void;
};

// ============== Details ================
export type TDetailKind = "course" | "event" | "podcast" | "youtube";

export type TDetailBase = {
  id: string;
  slug: string;
  title: string;
  rating?: number | null;
  isFree?: boolean | null;
  imageUrl?: string | null;
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
};

export type TDetailPageHeaderProps = {
  title: string;
  badge: string;
  byline?: string | null;
  rating?: number | null;
  category?: string | null;
  ratingCount?: number | null;
  chips?: Array<string | null | undefined>;
};

export type TDetailSidebarProps = {
  id: string;
  title: string;
  kind: TDetailKind;
  actions: ReactNode;
  facts: TDetailFact[];
  summary?: ReactNode;
  imageUrl?: string | null;
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
  prefill: TAddCalendarEventPrefill;
  completed: TMarkCompletedPrefill;
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
  slug: string;
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
  contentId?: string | null;
  contentType?: API.ContentType | null;
  activityType: API.PduSource;
  level?: string | null;
  roadmapArea?: string | null;
  durationMinutes?: number | null;
  providerOrganizer?: string | null;
  category?: API.PduCategory | null;
  /** Identity of the assigned association-content row, independent of contentId/contentType
   * (which are null for external content). Sent as-is so the backend can match/dedupe this
   * specific assignment's completion regardless of which requirement ends up selected. */
  associationLearningContentId?: string | null;
  /** Preselects a requirement without going through the endorsement/URL inference — used when
   * the launching row already knows exactly which requirement this content counts toward. */
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
  description?: string | null;
  category?: string | null;
  indicativeCredits?: number | null;
  associationName?: string | null;
  externalUrl?: string | null;
  contentType?: ContentType | null;
  requirementLabel?: string | null;
};

export type TAssignedContentDetailDialogProps = {
  open: boolean;
  item: TAssignedContentDetailItem | null;
  onOpenChange: (open: boolean) => void;
};

export type TRequirementSelectFieldProps<T extends FieldValues> = {
  t: I18nContextValue["t"];
  name: Path<T>;
  label: string;
  control: Control<T>;
  options: TRequirementOption[];
  noneValue: string;
  noneLabel: string;
  disabled?: boolean;
  className?: string;
  description?: string | null;
  onValueChange?: (value: string) => void;
};
