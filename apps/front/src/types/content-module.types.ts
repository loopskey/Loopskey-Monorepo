import type * as API from "@/lib/graphql/generated";
import { ReactNode } from "react";

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

export type TContentSearchHeroProps = {
  value: string;
  onChange: (value: string) => void;
};

export type TFilterPanelProps = {
  title: string;
  totalCount?: number;
  filters: Array<{
    key: string;
    label: string;
    value?: string;
    placeholder: string;
    options: TSelectOption[];
    onChange: (value: string) => void;
  }>;
  onReset: () => void;
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

export type TReviewValues = {
  rating: number;
  comment: string;
};

export type TDetailMetaPillProps = {
  label: string;
  icon?: ReactNode;
  className?: string;
  value?: string | number | null;
};

export type TDetailHeroWishlist = {
  isWishlisted?: boolean;
  loading?: boolean;
  onToggle: () => void;
};

export type TDetailHeroProps = {
  title: string;
  badge: string;
  rating?: number | null;
  category?: string | null;
  imageUrl?: string | null;
  children?: React.ReactNode;
  description?: string | null;
  ratingCount?: number | null;
  calendarSlot?: ReactNode;
  wishlist?: TDetailHeroWishlist;
};

export type TDetailActionPanelProps = {
  isInCart?: boolean;
  hideCart?: boolean;
  enrollLabel: string;
  isEnrolled?: boolean;
  onEnroll: () => void;
  cartLoading?: boolean;
  isWishlisted?: boolean;
  onWishlist: () => void;
  isFree?: boolean | null;
  enrollLoading?: boolean;
  onAddToCart?: () => void;
  currency?: string | null;
  wishlistLoading?: boolean;
  price?: number | string | null;
  calendarSlot?: ReactNode;
  primaryActionSlot?: ReactNode;
};

export type TReviewFormProps = {
  isLoading?: boolean;
  defaultRating?: number | null;
  defaultComment?: string | null;
  onSubmit: (rating: number, comment: string) => void;
};

export type TReviewItem = {
  id: string;
  rating: number;
  createdAt?: string;
  comment?: string | null;
};

export type TReviewsListProps = {
  isLoading?: boolean;
  reviews: TReviewItem[];
};

export type TLesson = {
  id: string;
  type: string;
  title: string;
  isPreview?: boolean | null;
  description?: string | null;
  durationMinutes?: number | null;
};

export type TSection = {
  id: string;
  title: string;
  order: number;
  lessons?: TLesson[] | null;
  description?: string | null;
};

export type TCourseCurriculumProps = {
  sections?: TSection[] | null;
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
