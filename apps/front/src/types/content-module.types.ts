import type { TAddCalendarEventPrefill } from "@/types/professional-dashboard.types";
import type { TPduActivity } from "@/types/professional-dashboard.types";
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

export type TMarkCompletedPrefill = {
  title: string;
  contentId: string;
  contentType: API.ContentType;
  activityType: API.PduSource;
  level?: string | null;
  roadmapArea?: string | null;
  durationMinutes?: number | null;
  providerOrganizer?: string | null;
  category?: API.PduCategory | null;
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
