import type {
  CourseLanguageFieldsFragment,
  CourseTranslationFieldsFragment,
} from "@/lib/graphql/operations/course";

export type TCourseTranslation = CourseTranslationFieldsFragment;

export type TCourseLanguage = CourseLanguageFieldsFragment;

export type TCourseTranslationDialogProps = {
  courseId: string;
  courseTitle: string;
};

export type TContentTranslationFeedback =
  | { kind: "saved" | "published" | "unpublished" | "declared" }
  | { kind: "error"; code: string };
