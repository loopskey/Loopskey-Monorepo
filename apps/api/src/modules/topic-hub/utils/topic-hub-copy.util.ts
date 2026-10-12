import { cleanPlainText, containsMarkup } from "@utils/plain-text.util";
import { TopicHubMessageCode } from "@loopskey/api-contracts/error-codes";
import { BadRequestException } from "@nestjs/common";
import { TOPIC_HUB_LIMITS } from "@loopskey/api-contracts/validation";
import { CourseCategory } from "@prisma/client";

export type TopicHubSection = { heading: string; body: string };

export type TopicHubCopy = {
  title: string;
  introduction: string;
  guidance: string;
  sections: TopicHubSection[];
};

export type TopicHubCopyField = keyof TopicHubCopy | "category" | "references";

const CATEGORY_KEYS: ReadonlySet<string> = new Set(
  Object.values(CourseCategory),
);
export const invalidTopicHubField = (field: TopicHubCopyField) =>
  new BadRequestException({
    code: TopicHubMessageCode.INVALID_FIELD,
    message: TopicHubMessageCode.INVALID_FIELD,
    field,
  });

export const incompleteTopicHubCopy = (field: TopicHubCopyField) =>
  new BadRequestException({
    code: TopicHubMessageCode.INCOMPLETE_COPY,
    message: TopicHubMessageCode.INCOMPLETE_COPY,
    field,
  });

const requiredText = (
  field: TopicHubCopyField,
  value: string,
  maximum: number,
) => {
  const cleaned = cleanPlainText(value);
  if (!cleaned || cleaned.length > maximum || containsMarkup(cleaned))
    throw invalidTopicHubField(field);
  return cleaned;
};

export const cleanTopicHubCopy = (input: {
  title: string;
  introduction: string;
  guidance: string;
  sections?: readonly TopicHubSection[] | null;
}): TopicHubCopy => {
  const sections = (input.sections ?? []).map((section) => ({
    heading: requiredText(
      "sections",
      section.heading,
      TOPIC_HUB_LIMITS.sectionHeadingMax,
    ),
    body: requiredText(
      "sections",
      section.body,
      TOPIC_HUB_LIMITS.sectionBodyMax,
    ),
  }));
  if (sections.length > TOPIC_HUB_LIMITS.sectionsMax)
    throw invalidTopicHubField("sections");
  return {
    title: requiredText("title", input.title, TOPIC_HUB_LIMITS.titleMax),
    introduction: requiredText(
      "introduction",
      input.introduction,
      TOPIC_HUB_LIMITS.introductionMax,
    ),
    guidance: requiredText(
      "guidance",
      input.guidance,
      TOPIC_HUB_LIMITS.guidanceMax,
    ),
    sections,
  };
};

export const assertSubstantiveTopicHubCopy = (copy: TopicHubCopy) => {
  if (copy.introduction.length < TOPIC_HUB_LIMITS.introductionMin)
    throw incompleteTopicHubCopy("introduction");
  if (copy.guidance.length < TOPIC_HUB_LIMITS.guidanceMin)
    throw incompleteTopicHubCopy("guidance");
};

export const cleanTopicHubCategory = (value: string | null | undefined) => {
  if (value === undefined || value === null) return null;
  const key = value.trim().toUpperCase();
  if (!key) return null;
  if (!CATEGORY_KEYS.has(key)) throw invalidTopicHubField("category");
  return key;
};

export const sectionsFromJson = (value: unknown): TopicHubSection[] => {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (typeof entry !== "object" || entry === null) return [];
    const { heading, body } = entry as Record<string, unknown>;
    return typeof heading === "string" && typeof body === "string"
      ? [{ heading, body }]
      : [];
  });
};

export const snippetOf = (text: string, maximum: number) => {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length <= maximum
    ? flat
    : `${flat.slice(0, maximum - 1).trimEnd()}…`;
};
