"use client";

import { useProfessionalProfileTab } from "@/hooks/useProfessionalProfileTab";
import { ProfilePreferencesPanel } from "@modules/ProfessionalDashboard/parts/profile-preferences-panel";
import { ProfileCredentialsPanel } from "@modules/ProfessionalDashboard/parts/profile-credentials-panel";
import { ProfileInterestTagsCard } from "@modules/ProfessionalDashboard/parts/profile-interest-tags-card";
import { ProfileCompletionCard } from "@modules/ProfessionalDashboard/parts/profile-completion-card";
import { ProfileDetailsPanel } from "@modules/ProfessionalDashboard/parts/profile-details-panel";
import { ProfileSkillsPanel } from "@modules/ProfessionalDashboard/parts/profile-skills-panel";
import { ProfileBasicPanel } from "@modules/ProfessionalDashboard/parts/profile-basic-panel";
import { AnimatedTabs } from "@elements/animated-tabs";
import { GlassCard } from "@elements/glass-card";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";

import * as L from "lucide-react";

const ProfessionalProfileTab = () => {
  const hook = useProfessionalProfileTab();
  const {
    t,
    tabs,
    avatar,
    profile,
    hasError,
    isLoading,
    activeTab,
    isFetching,
    basicForm,
    skillsForm,
    detailsForm,
    credentials,
    setActiveTab,
    refreshProfile,
    preferencesForm,
  } = hook;

  const isDisabled = isLoading;

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-primary">
            {t("professionalDashboard.profile.eyebrow")}
          </p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight">
            {t("professionalDashboard.profile.title")}
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {t("professionalDashboard.profile.description")}
          </p>
        </div>

        <Button
          radius="xl"
          type="button"
          variant="glass"
          disabled={isFetching}
          onClick={() => void refreshProfile()}
        >
          <L.RefreshCcw
            className={isFetching ? "h-4 w-4 animate-spin" : "h-4 w-4"}
          />
          {t("common.refresh")}
        </Button>
      </section>

      {hasError ? (
        <GlassCard className="flex flex-col items-center gap-3 py-10 text-center">
          <L.TriangleAlert aria-hidden className="h-6 w-6 text-destructive" />
          <p className="text-sm text-muted-foreground">
            {t("professionalDashboard.profile.errors.loadFailed")}
          </p>
          <Button
            radius="xl"
            type="button"
            variant="brand"
            onClick={() => void refreshProfile()}
          >
            {t("common.refresh")}
          </Button>
        </GlassCard>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <ProfileCompletionCard hook={hook} />
            <ProfileInterestTagsCard hook={hook} />
          </div>

          <AnimatedTabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={setActiveTab}
          />

          <GlassCard>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-56" />
                <Skeleton className="h-28 w-full rounded-3xl" />
                <div className="grid gap-5 md:grid-cols-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="h-14 w-full rounded-2xl" />
                  ))}
                </div>
              </div>
            ) : (
              <>
                {activeTab === "basic" && (
                  <ProfileBasicPanel
                    avatar={avatar}
                    hook={basicForm}
                    profile={profile}
                    icon={L.UserRound}
                    isDisabled={isDisabled}
                  />
                )}

                {activeTab === "details" && (
                  <ProfileDetailsPanel
                    hook={detailsForm}
                    isDisabled={isDisabled}
                    icon={L.BriefcaseBusiness}
                  />
                )}

                {activeTab === "skills" && (
                  <ProfileSkillsPanel
                    icon={L.Lightbulb}
                    hook={skillsForm}
                    isDisabled={isDisabled}
                  />
                )}

                {activeTab === "certifications" && (
                  <ProfileCredentialsPanel
                    icon={L.Award}
                    hook={credentials}
                    isDisabled={isDisabled}
                  />
                )}

                {activeTab === "preferences" && (
                  <ProfilePreferencesPanel
                    icon={L.SlidersHorizontal}
                    hook={preferencesForm}
                    isDisabled={isDisabled}
                  />
                )}
              </>
            )}
          </GlassCard>
        </>
      )}
    </div>
  );
};

export default ProfessionalProfileTab;
