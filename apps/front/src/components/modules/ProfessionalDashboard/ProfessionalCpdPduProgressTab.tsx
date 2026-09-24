"use client";

import { RequirementDetailView } from "@modules/ProfessionalDashboard/parts/requirement-detail-view";
import { RequirementSelector } from "@modules/ProfessionalDashboard/parts/requirement-selector";
import { useCpdPduProgress } from "@/hooks/useCpdPduProgress";
import { CpdSearchModal } from "@modules/ProfessionalDashboard/parts/cpd-search-modal";
import { CpdEmptyState } from "@modules/ProfessionalDashboard/parts/cpd-empty-state";
import { CpdSetupFlow } from "@modules/ProfessionalDashboard/parts/cpd-setup-flow";
import { Button } from "@ui/button";

import type { TRequirementViewModel } from "@/types/professional-requirement.types";

import * as R from "@/utils/professional-requirement.helper";
import * as L from "lucide-react";
import * as A from "@ui/alert-dialog";

const ProfessionalCpdPduProgressTab = () => {
  const cpd = useCpdPduProgress();
  const { t } = cpd;

  if (cpd.setup)
    return (
      <CpdSetupFlow
        t={t}
        setup={cpd.setup}
        isSubmitting={cpd.isSubmittingPlan}
        onCancel={cpd.closeSetup}
        onSubmit={cpd.submitSetup}
      />
    );

  const loadError = cpd.isAssociationsError ? (
    <div className="flex flex-wrap items-center gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm">
      <span>{t("cpdProgress.requirements.loadError")}</span>
      <Button
        size="sm"
        radius="xl"
        type="button"
        variant="outline"
        onClick={() => cpd.refetchAssociations()}
      >
        {t("cpdProgress.requirements.retry")}
      </Button>
    </div>
  ) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <p className="text-sm font-medium text-primary">
            {t("cpdProgress.eyebrow")}
          </p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
            {t("cpdProgress.title")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {t("cpdProgress.subtitle")}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            radius="xl"
            type="button"
            variant="outline"
            onClick={cpd.generateSummary}
            disabled={!cpd.canGenerateSummary || cpd.isGenerating}
            className="w-full justify-center sm:w-auto"
          >
            {cpd.isGenerating ? (
              <L.Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <L.FileDown className="h-4 w-4" />
            )}
            {t("cpdProgress.actions.generateSummary")}
          </Button>

          <Button
            radius="xl"
            type="button"
            onClick={cpd.openSearch}
            className="w-full justify-center sm:w-auto"
          >
            <L.Plus className="h-4 w-4" />
            {t("cpdProgress.actions.createNew")}
          </Button>
        </div>
      </div>

      {cpd.draftPlans.length > 0 && (
        <div className="space-y-2">
          {cpd.draftPlans.map((draft) => (
            <div
              key={draft.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-primary/30 bg-primary/5 p-4"
            >
              <p className="text-sm">
                {t("cpdProgress.draftPlan.prompt", {
                  certification: draft.certificationName,
                })}
              </p>
              <Button
                size="sm"
                radius="xl"
                type="button"
                disabled={cpd.isActivatingPlan}
                onClick={() => cpd.trackDraftPlan(draft.id)}
              >
                {cpd.isActivatingPlan ? (
                  <L.Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <L.Target className="h-4 w-4" />
                )}
                {t("cpdProgress.draftPlan.track")}
              </Button>
            </div>
          ))}
        </div>
      )}

      {cpd.isRequirementsLoading ? (
        <div className="flex min-h-96 items-center justify-center">
          <L.Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      ) : !cpd.hasRequirements ? (
        <div className="space-y-4">
          {loadError}
          <CpdEmptyState t={t} onCreate={cpd.openSearch} />
        </div>
      ) : (
        <div className="space-y-6">
          {loadError}

          <RequirementSelector
            t={t}
            options={cpd.options}
            selectedKey={cpd.activeKey}
            onSelect={cpd.setSelectedKey}
            onLogActivity={cpd.goToAddActivity}
          />

          {(() => {
            if (cpd.selectedAssociation) {
              const model: TRequirementViewModel = R.associationToViewModel(
                cpd.selectedAssociation,
              );
              return (
                <RequirementDetailView
                  t={t}
                  model={model}
                  isLoading={false}
                  requirementKeyValue={model.key}
                  isDetailLoading={cpd.isAssociationDetailLoading}
                  isActivitiesLoading={cpd.isAssociationDetailLoading}
                  categories={R.associationCategoryRows(cpd.associationDetail)}
                  content={cpd.associationDetail?.learningContents ?? []}
                  activities={R.associationActivityRows(
                    t,
                    cpd.associationDetail?.activities ?? [],
                  )}
                  onMarkComplete={cpd.markComplete}
                />
              );
            }

            if (!cpd.selectedPlan || cpd.isProgressLoading || !cpd.progress)
              return (
                <RequirementDetailView
                  t={t}
                  isLoading
                  isDetailLoading
                  isActivitiesLoading
                  requirementKeyValue=""
                  model={{} as TRequirementViewModel}
                  categories={[]}
                  content={[]}
                  activities={[]}
                />
              );

            const model = R.planToViewModel(cpd.selectedPlan, cpd.progress);
            return (
              <RequirementDetailView
                t={t}
                model={model}
                isLoading={false}
                isDetailLoading={false}
                requirementKeyValue={model.key}
                isActivitiesLoading={cpd.isPlanActivitiesLoading}
                categories={R.planCategoryRows(cpd.progress)}
                content={[]}
                activities={R.planActivityRows(t, cpd.planActivities)}
                isDeleting={cpd.isDeleting}
                onDelete={() => cpd.requestDelete(cpd.selectedPlan!.id)}
                onEdit={() => cpd.editPlan(cpd.selectedPlan!)}
              />
            );
          })()}
        </div>
      )}

      <CpdSearchModal
        t={t}
        open={cpd.searchOpen}
        onClose={cpd.closeSearch}
        onAddManually={cpd.addManually}
        onUseSuggested={cpd.useSuggested}
        onEditManually={cpd.editManually}
        isSubmitting={cpd.isCreatingSuggestion}
      />

      <A.AlertDialog
        open={Boolean(cpd.pendingDuplicate)}
        onOpenChange={(open) => !open && cpd.cancelDuplicate()}
      >
        <A.AlertDialogContent className="glass-dialog rounded-lg border-border">
          <A.AlertDialogHeader>
            <A.AlertDialogTitle>
              {t("cpdProgress.duplicate.title")}
            </A.AlertDialogTitle>
            <A.AlertDialogDescription>
              {t("cpdProgress.duplicate.description")}
            </A.AlertDialogDescription>
          </A.AlertDialogHeader>
          <A.AlertDialogFooter>
            <A.AlertDialogCancel>
              {t("cpdProgress.common.cancel")}
            </A.AlertDialogCancel>
            <A.AlertDialogAction
              disabled={cpd.isSubmittingPlan}
              onClick={cpd.confirmDuplicate}
            >
              {t("cpdProgress.duplicate.confirm")}
            </A.AlertDialogAction>
          </A.AlertDialogFooter>
        </A.AlertDialogContent>
      </A.AlertDialog>

      {/* Delete-plan confirmation. */}
      <A.AlertDialog
        open={Boolean(cpd.deleteTargetId)}
        onOpenChange={(open) => !open && cpd.cancelDelete()}
      >
        <A.AlertDialogContent className="glass-dialog rounded-lg border-border">
          <A.AlertDialogHeader>
            <A.AlertDialogTitle>
              {t("cpdProgress.delete.title")}
            </A.AlertDialogTitle>
            <A.AlertDialogDescription>
              {t("cpdProgress.delete.description")}
            </A.AlertDialogDescription>
          </A.AlertDialogHeader>
          <A.AlertDialogFooter>
            <A.AlertDialogCancel>
              {t("cpdProgress.common.cancel")}
            </A.AlertDialogCancel>
            <A.AlertDialogAction
              disabled={cpd.isDeleting}
              onClick={cpd.confirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {t("cpdProgress.delete.confirm")}
            </A.AlertDialogAction>
          </A.AlertDialogFooter>
        </A.AlertDialogContent>
      </A.AlertDialog>
    </div>
  );
};

export default ProfessionalCpdPduProgressTab;
