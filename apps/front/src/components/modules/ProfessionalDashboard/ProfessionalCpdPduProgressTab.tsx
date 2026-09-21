"use client";

import { RequirementAssociationView } from "@modules/ProfessionalDashboard/parts/requirement-association-view";
import { RequirementActivitiesTable } from "@modules/ProfessionalDashboard/parts/requirement-activities-table";
import { CpdMissingRequirements } from "@modules/ProfessionalDashboard/parts/cpd-missing-requirements";
import { CpdCategoryCompletion } from "@modules/ProfessionalDashboard/parts/cpd-category-completion";
import { CpdProgressOverview } from "@modules/ProfessionalDashboard/parts/cpd-progress-overview";
import { RequirementSelector } from "@modules/ProfessionalDashboard/parts/requirement-selector";
import { useCpdPduProgress } from "@/hooks/useCpdPduProgress";
import { planActivityRows } from "@/utils/professional-requirement.helper";
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
            isDeleting={cpd.isDeleting}
            selectedKey={cpd.activeKey}
            onDelete={cpd.requestDelete}
            onSelect={cpd.setSelectedKey}
            onLogActivity={cpd.goToAddActivity}
            onEdit={(planId) => {
              const plan = cpd.plans.find((item) => item.id === planId);
              if (plan) cpd.editPlan(plan);
            }}
          />

          {cpd.selectedAssociation ? (
            <RequirementAssociationView
              t={t}
              detail={cpd.associationDetail}
              summary={cpd.selectedAssociation}
              onMarkComplete={cpd.markComplete}
              onLogActivity={cpd.goToAddActivity}
              isLoading={cpd.isAssociationDetailLoading}
            />
          ) : cpd.isProgressLoading || !cpd.progress || !cpd.selectedPlan ? (
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
              <RequirementActivitiesTable
                t={t}
                isLoading={cpd.isPlanActivitiesLoading}
                rows={planActivityRows(t, cpd.planActivities)}
              />
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
