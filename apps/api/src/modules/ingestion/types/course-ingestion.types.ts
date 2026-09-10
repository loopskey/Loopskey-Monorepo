import { IngestionBatchMode, IngestionBatchStatus } from "@prisma/client";

import type { CanonicalCourseInput } from "@ingestion/dtos/canonical-course.input";
import type { COURSE_CANONICAL_FIELDS } from "@ingestion/enums/course-ingestion.constant";

export type CourseCanonicalField = (typeof COURSE_CANONICAL_FIELDS)[number];

export type CourseFieldMap = Record<string, CourseCanonicalField>;

export type CourseIngestionItemState =
  | "created"
  | "updated"
  | "unchanged"
  | "rejected";

export type CourseIngestionItemReport = {
  externalId: string | null;
  state: CourseIngestionItemState;
  catalogId: string | null;
  reason: string | null;
  unmappedFields: string[];
  unmappedValues?: Record<string, unknown>;
};

export type CourseIngestionReceipt = {
  batchId: string | null;
  dryRun: boolean;
  mode: IngestionBatchMode;
  status: IngestionBatchStatus | "DRY_RUN";
  receivedCount: number;
  acceptedCount: number;
  rejectedCount: number;
  createdCount: number;
  updatedCount: number;
  unchangedCount: number;
  items: CourseIngestionItemReport[];
};

export type PreparedCourseItem =
  | {
      outcome: "accepted";
      canonical: CanonicalCourseInput;
      canonicalHash: string;
      externalId: string;
      unmappedFields: string[];
      unmappedValues?: Record<string, unknown>;
    }
  | {
      outcome: "rejected";
      canonicalHash: string;
      externalId: string | null;
      reason: string;
      unmappedFields: string[];
      unmappedValues?: Record<string, unknown>;
    };
