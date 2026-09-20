-- Replace LearningTimeCommitment's hour ranges and LearningBudgetPreference's
-- mixed how-much/who-pays vocabulary with plain weekly-hour and price-tier
-- buckets. Existing rows are remapped rather than dropped:
--
-- LearningTimeCommitment:
--   LESS_THAN_ONE_HOUR  -> ONE_TO_TWO_HOURS      (rounds up; nothing below the new lowest bucket)
--   ONE_TO_THREE_HOURS  -> TWO_TO_THREE_HOURS    (straddled two new buckets; kept the upper bound)
--   FOUR_TO_SIX_HOURS   -> THREE_TO_FIVE_HOURS   (straddled two new buckets; kept the lower bound)
--   SEVEN_TO_TEN_HOURS  -> MORE_THAN_FIVE_HOURS
--   MORE_THAN_TEN_HOURS -> MORE_THAN_FIVE_HOURS
--
-- LearningBudgetPreference (the old values were not a price scale, and most
-- cannot be mapped without guessing; only FREE_ONLY is preserved):
--   FREE_ONLY           -> FREE_ONLY
--   MIXED_FREE_AND_PAID -> NULL
--   PREMIUM             -> NULL
--   EMPLOYER_SPONSORED  -> NULL

ALTER TYPE "LearningTimeCommitment" RENAME TO "LearningTimeCommitment_old";
ALTER TYPE "LearningBudgetPreference" RENAME TO "LearningBudgetPreference_old";

CREATE TYPE "LearningTimeCommitment" AS ENUM ('ONE_TO_TWO_HOURS', 'TWO_TO_THREE_HOURS', 'THREE_TO_FIVE_HOURS', 'MORE_THAN_FIVE_HOURS');
CREATE TYPE "LearningBudgetPreference" AS ENUM ('FREE_ONLY', 'UNDER_100', 'HUNDRED_TO_500', 'FIVE_HUNDRED_PLUS');

ALTER TABLE "ProfessionalProfile"
  ALTER COLUMN "learningTimeCommitment" TYPE "LearningTimeCommitment"
  USING (
    CASE "learningTimeCommitment"::text
      WHEN 'LESS_THAN_ONE_HOUR' THEN 'ONE_TO_TWO_HOURS'
      WHEN 'ONE_TO_THREE_HOURS' THEN 'TWO_TO_THREE_HOURS'
      WHEN 'FOUR_TO_SIX_HOURS' THEN 'THREE_TO_FIVE_HOURS'
      WHEN 'SEVEN_TO_TEN_HOURS' THEN 'MORE_THAN_FIVE_HOURS'
      WHEN 'MORE_THAN_TEN_HOURS' THEN 'MORE_THAN_FIVE_HOURS'
      ELSE NULL
    END
  )::"LearningTimeCommitment";

ALTER TABLE "ProfessionalProfile"
  ALTER COLUMN "learningBudgetPreference" TYPE "LearningBudgetPreference"
  USING (
    CASE "learningBudgetPreference"::text
      WHEN 'FREE_ONLY' THEN 'FREE_ONLY'
      ELSE NULL
    END
  )::"LearningBudgetPreference";

ALTER TABLE "CPDPlan"
  ALTER COLUMN "timeAvailable" TYPE "LearningTimeCommitment"
  USING (
    CASE "timeAvailable"::text
      WHEN 'LESS_THAN_ONE_HOUR' THEN 'ONE_TO_TWO_HOURS'
      WHEN 'ONE_TO_THREE_HOURS' THEN 'TWO_TO_THREE_HOURS'
      WHEN 'FOUR_TO_SIX_HOURS' THEN 'THREE_TO_FIVE_HOURS'
      WHEN 'SEVEN_TO_TEN_HOURS' THEN 'MORE_THAN_FIVE_HOURS'
      WHEN 'MORE_THAN_TEN_HOURS' THEN 'MORE_THAN_FIVE_HOURS'
      ELSE NULL
    END
  )::"LearningTimeCommitment";

ALTER TABLE "RoadmapDraft"
  ALTER COLUMN "timeCommitment" TYPE "LearningTimeCommitment"
  USING (
    CASE "timeCommitment"::text
      WHEN 'LESS_THAN_ONE_HOUR' THEN 'ONE_TO_TWO_HOURS'
      WHEN 'ONE_TO_THREE_HOURS' THEN 'TWO_TO_THREE_HOURS'
      WHEN 'FOUR_TO_SIX_HOURS' THEN 'THREE_TO_FIVE_HOURS'
      WHEN 'SEVEN_TO_TEN_HOURS' THEN 'MORE_THAN_FIVE_HOURS'
      WHEN 'MORE_THAN_TEN_HOURS' THEN 'MORE_THAN_FIVE_HOURS'
      ELSE NULL
    END
  )::"LearningTimeCommitment";

ALTER TABLE "RoadmapDraft"
  ALTER COLUMN "budgetPreference" TYPE "LearningBudgetPreference"
  USING (
    CASE "budgetPreference"::text
      WHEN 'FREE_ONLY' THEN 'FREE_ONLY'
      ELSE NULL
    END
  )::"LearningBudgetPreference";

DROP TYPE "LearningTimeCommitment_old";
DROP TYPE "LearningBudgetPreference_old";
