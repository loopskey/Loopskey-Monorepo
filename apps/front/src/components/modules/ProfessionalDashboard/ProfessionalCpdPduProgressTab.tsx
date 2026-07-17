"use client";

import { CpdMissingRequirements } from "@modules/ProfessionalDashboard/parts/cpd-missing-requirements";
import { CpdCategoryCompletion } from "@modules/ProfessionalDashboard/parts/cpd-category-completion";
import { CpdProgressOverview } from "@modules/ProfessionalDashboard/parts/cpd-progress-overview";
import { useCpdPduProgress } from "@/hooks/useCpdPduProgress";
import { CpdPlanSelector } from "@modules/ProfessionalDashboard/parts/cpd-plan-selector";
import { CpdSearchModal } from "@modules/ProfessionalDashboard/parts/cpd-search-modal";
import { CpdEmptyState } from "@modules/ProfessionalDashboard/parts/cpd-empty-state";
import { CpdSetupFlow } from "@modules/ProfessionalDashboard/parts/cpd-setup-flow";
import { Button } from "@ui/button";

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

        <div className="flex flex-wrap gap-3">
          <Button
            radius="xl"
            type="button"
            variant="glass"
            onClick={cpd.generateSummary}
            disabled={!cpd.canGenerateSummary || cpd.isGenerating}
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
            variant="brand"
            onClick={cpd.openSearch}
          >
            <L.Plus className="h-4 w-4" />
            {t("cpdProgress.actions.createNew")}
          </Button>
        </div>
      </div>

      {cpd.isPlansLoading ? (
        <div className="flex min-h-96 items-center justify-center">
          <L.Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      ) : !cpd.hasPlans ? (
        <CpdEmptyState t={t} onCreate={cpd.openSearch} />
      ) : (
        <div className="space-y-6">
          <CpdPlanSelector
            t={t}
            plans={cpd.plans}
            isDeleting={cpd.isDeleting}
            onDelete={cpd.requestDelete}
            onSelect={cpd.setSelectedPlanId}
            selectedPlanId={cpd.selectedPlanId}
          />

          {cpd.isProgressLoading || !cpd.progress || !cpd.selectedPlan ? (
            <div className="flex min-h-72 items-center justify-center">
              <L.Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <CpdProgressOverview
                t={t}
                plan={cpd.selectedPlan}
                progress={cpd.progress}
              />
              <div className="grid gap-6 xl:grid-cols-2">
                <CpdCategoryCompletion
                  t={t}
                  plan={cpd.selectedPlan}
                  progress={cpd.progress}
                />
                <CpdMissingRequirements
                  t={t}
                  progress={cpd.progress}
                  onEditPlan={cpd.goToAddActivity}
                  onAddActivity={cpd.goToAddActivity}
                />
              </div>
            </>
          )}
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
        <A.AlertDialogContent className="glass-dialog rounded-3xl border-glass-border">
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
        <A.AlertDialogContent className="glass-dialog rounded-3xl border-glass-border">
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
