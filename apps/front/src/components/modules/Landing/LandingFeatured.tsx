"use client";

import { LandingSection } from "@modules/Landing/parts/LandingSection";
import { LandingSectionHeading } from "@modules/Landing/parts/LandingSection";
import { useLandingFeatured } from "@/hooks/useLandingFeatured";

import LearningHubRow from "@modules/Landing/parts/LearningHubRow";
import LandingEmptyState from "@modules/Landing/parts/LandingEmptyState";

const TITLE_ID = "landing-hub-title";

const LandingFeatured = () => {
  const { t, rows } = useLandingFeatured();

  const isSettled = rows.every((row) => !row.isLoading && !row.isError);
  const isEmpty = isSettled && rows.every((row) => row.items.length === 0);

  return (
    <LandingSection labelledBy={TITLE_ID}>
      <LandingSectionHeading
        align="start"
        id={TITLE_ID}
        eyebrow={t("landing.learningHub.badge")}
        title={t("landing.learningHub.title")}
      />

      <div className="mt-12 space-y-12">
        {isEmpty ? (
          <LandingEmptyState />
        ) : (
          rows.map((row) => <LearningHubRow key={row.id} row={row} />)
        )}
      </div>
    </LandingSection>
  );
};

export default LandingFeatured;
