import { ContentUrlMessageCode } from "@loopskey/api-contracts/error-codes";
import { TopicHubMessageCode } from "@loopskey/api-contracts/error-codes";
import { TOPIC_HUB_LIMITS } from "@loopskey/api-contracts/validation";
import { ContentUrlKind, CourseCategory } from "@/lib/graphql/base";

import type { AdminTopicHubFieldsFragment } from "@/lib/graphql/operations/topic-hub";
import type { ContentKind } from "@/lib/content-catalog/detail-path";

export const HUB_LIMITS = TOPIC_HUB_LIMITS;

export const HUB_CATEGORIES = Object.values(CourseCategory);

export const REFERENCE_KINDS = [
  ContentUrlKind.Course,
  ContentUrlKind.Event,
  ContentUrlKind.Podcast,
  ContentUrlKind.Youtube,
] as const;

export const CONTENT_KIND_OF: Record<string, ContentKind> = {
  [ContentUrlKind.Course]: "course",
  [ContentUrlKind.Event]: "event",
  [ContentUrlKind.Podcast]: "podcast",
  [ContentUrlKind.Youtube]: "youtube",
};

export type THubSection = { heading: string; body: string };

export type THubReference = {
  kind: ContentUrlKind;
  contentId: string;
  slug: string | null;
  title: string | null;
  isEligible: boolean;
};

export type THubForm = {
  slug: string;
  title: string;
  introduction: string;
  guidance: string;
  category: string;
  sections: THubSection[];
  references: THubReference[];
};

export const EMPTY_HUB_FORM: THubForm = {
  slug: "",
  title: "",
  introduction: "",
  guidance: "",
  category: "",
  sections: [],
  references: [],
};

export type THubLocale = "EN" | "FR";

export const formOfHub = (
  hub: AdminTopicHubFieldsFragment | null | undefined,
  locale: THubLocale,
): THubForm => {
  if (!hub) return EMPTY_HUB_FORM;
  const references: THubReference[] = hub.references.map((reference) => ({
    kind: reference.kind,
    contentId: reference.contentId,
    slug: reference.slug ?? null,
    title: reference.title ?? null,
    isEligible: reference.isEligible,
  }));
  const plainSections = (
    sections: readonly { heading: string; body: string }[],
  ) => sections.map(({ heading, body }) => ({ heading, body }));
  const translation = hub.translations.find((row) => row.locale === "FR");
  if (locale === "FR")
    return {
      slug: hub.slug,
      title: translation?.title ?? "",
      introduction: translation?.introduction ?? "",
      guidance: translation?.guidance ?? "",
      category: hub.category ?? "",
      sections: plainSections(translation?.sections ?? []),
      references,
    };
  return {
    slug: hub.slug,
    title: hub.title,
    introduction: hub.introduction,
    guidance: hub.guidance,
    category: hub.category ?? "",
    sections: plainSections(hub.sections),
    references,
  };
};

export const sameHubForm = (left: THubForm, right: THubForm) =>
  left.slug === right.slug &&
  left.title.trim() === right.title.trim() &&
  left.introduction.trim() === right.introduction.trim() &&
  left.guidance.trim() === right.guidance.trim() &&
  left.category === right.category &&
  JSON.stringify(left.sections) === JSON.stringify(right.sections) &&
  JSON.stringify(
    left.references.map((reference) => [reference.kind, reference.contentId]),
  ) ===
    JSON.stringify(
      right.references.map((reference) => [
        reference.kind,
        reference.contentId,
      ]),
    );

const BASE = "topicHubAdmin.feedback";

export const HUB_FEEDBACK_KEY: Record<string, string> = {
  saved: `${BASE}.saved`,
  published: `${BASE}.published`,
  withdrawn: `${BASE}.withdrawn`,
  frenchPublished: `${BASE}.frenchPublished`,
  frenchUnpublished: `${BASE}.frenchUnpublished`,
  indexed: `${BASE}.indexed`,
  excluded: `${BASE}.excluded`,
  FORBIDDEN: `${BASE}.forbidden`,
  BAD_USER_INPUT: `${BASE}.invalid`,
  [TopicHubMessageCode.VERSION_CONFLICT]: `${BASE}.conflict`,
  [TopicHubMessageCode.INVALID_FIELD]: `${BASE}.invalid`,
  [TopicHubMessageCode.INCOMPLETE_COPY]: `${BASE}.incomplete`,
  [TopicHubMessageCode.NO_ELIGIBLE_LINKS]: `${BASE}.noLinks`,
  [TopicHubMessageCode.INVALID_STATE]: `${BASE}.invalidState`,
  [TopicHubMessageCode.NOT_FOUND]: `${BASE}.notFound`,
  [ContentUrlMessageCode.SLUG_TAKEN]: `${BASE}.slugTaken`,
  [ContentUrlMessageCode.INVALID_SLUG]: `${BASE}.invalid`,
};
