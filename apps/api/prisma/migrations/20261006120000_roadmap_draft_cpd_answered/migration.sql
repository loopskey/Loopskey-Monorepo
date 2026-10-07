-- A draft stored only `cpdEnabled`, so "the professional said No" and "the
-- professional has not been asked" were the same row. `cpdAnswered` tells them
-- apart: unanswered = (false, false), No = (false, true), Yes = (true, true).
--
-- Additive and backward-compatible: the column is NOT NULL with a default, so
-- existing writers keep working, and nothing is dropped or rewritten except
-- the backfill below.
ALTER TABLE "RoadmapDraft"
  ADD COLUMN "cpdAnswered" BOOLEAN NOT NULL DEFAULT false;

-- Backfill, never destructive: a draft counts as answered when the interview
-- already moved past the CPD question (a CPD follow-up step or review), when
-- CPD was switched on, or when the draft was once complete enough to be ready,
-- generating, completed or failed. Everything else stays unanswered and is
-- asked once more, which is the safe direction.
UPDATE "RoadmapDraft"
SET "cpdAnswered" = true
WHERE "cpdEnabled" = true
   OR "currentStep" IN ('CERTIFICATION', 'CPD_REQUIREMENTS', 'REVIEW')
   OR "status" IN ('READY', 'GENERATING', 'COMPLETED', 'FAILED');
