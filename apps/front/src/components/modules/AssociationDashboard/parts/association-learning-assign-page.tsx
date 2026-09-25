"use client";

import { AssociationLearningStepAssignment } from "@modules/AssociationDashboard/parts/association-learning-step-assignment";
import { TAssociationLearningEditor } from "@/types/association-dashboard.types";
import { humanizeEnumValue } from "@utils/function-helper";
import { GlassCard } from "@elements/glass-card";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";

import * as S from "@ui/select";
import * as F from "@ui/form";
import * as L from "lucide-react";

const KEY = "associationDashboard.learningContent.assignPage";

export const AssociationLearningAssignPage = ({
  hook,
}: TAssociationLearningEditor) => {
  const {
    t,
    form,
    closeAssign,
    isAssigning,
    applyAssignment,
    assignableItems,
    assignSelectedIds,
    toggleAssignSelect,
    requirementOptions,
    isAssignableLoading,
  } = hook;

  const hasSelection = assignSelectedIds.length > 0;

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={closeAssign}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <L.ArrowLeft className="h-4 w-4" />
        {t("associationDashboard.learningContent.title")}
      </button>

      <div>
        <h1 className="text-2xl font-medium">{t(`${KEY}.title`)}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t(`${KEY}.subtitle`)}
        </p>
      </div>

      <GlassCard>
        <div className="relative z-10">
          <h2 className="text-sm font-medium">
            {t(`${KEY}.selectTitle`, { count: assignSelectedIds.length })}
          </h2>

          {isAssignableLoading ? (
            <div className="mt-3 space-y-2" aria-busy="true">
              <Skeleton className="h-12 w-full rounded-md" />
              <Skeleton className="h-12 w-full rounded-md" />
              <Skeleton className="h-12 w-full rounded-md" />
            </div>
          ) : assignableItems.length === 0 ? (
            <p className="mt-3 rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              {t(`${KEY}.empty`)}
            </p>
          ) : (
            <ul className="mt-3 max-h-96 space-y-2 overflow-y-auto pr-1">
              {assignableItems.map((item) => (
                <li key={item.id}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-md border p-3 hover:bg-primary/5">
                    <input
                      type="checkbox"
                      checked={assignSelectedIds.includes(item.id)}
                      onChange={() => toggleAssignSelect(item.id)}
                      className="h-4 w-4 rounded border-border"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {item.title ||
                          t(
                            "associationDashboard.learningContent.list.untitled",
                          )}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {t(
                          `associationDashboard.learningContent.status.${item.status}`,
                        )}
                        {item.category
                          ? ` · ${humanizeEnumValue(item.category)}`
                          : ""}
                      </p>
                    </div>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      </GlassCard>

      {hasSelection && (
        <F.Form {...form}>
          <form
            className="space-y-4"
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              void applyAssignment();
            }}
          >
            <GlassCard>
              <div className="relative z-10 space-y-4">
                <h2 className="text-sm font-medium">
                  {t(`${KEY}.audienceTitle`)}
                </h2>
                <AssociationLearningStepAssignment hook={hook} />

                <div className="space-y-1.5">
                  <S.Select
                    value={form.watch("requirementId") || "NONE"}
                    onValueChange={(value) =>
                      form.setValue(
                        "requirementId",
                        value === "NONE" ? undefined : value,
                        { shouldDirty: true },
                      )
                    }
                  >
                    <S.SelectTrigger
                      className="h-14 w-full rounded-md"
                      aria-label={t(
                        "associationDashboard.learningContent.editor.countsToward",
                      )}
                    >
                      <S.SelectValue
                        placeholder={t(
                          "associationDashboard.learningContent.editor.countsToward",
                        )}
                      />
                    </S.SelectTrigger>
                    <S.SelectContent className="z-[9999] rounded-md">
                      <S.SelectItem value="NONE">
                        {t(
                          "associationDashboard.learningContent.editor.noRequirementOption",
                        )}
                      </S.SelectItem>
                      {requirementOptions.map((option) => (
                        <S.SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </S.SelectItem>
                      ))}
                    </S.SelectContent>
                  </S.Select>
                </div>
              </div>
            </GlassCard>

            <GlassCard glow={false} className="sticky bottom-4 z-30 lg:static">
              <div className="relative z-10 flex justify-end">
                <Button radius="xl" type="submit" disabled={isAssigning}>
                  {isAssigning && (
                    <L.Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  <L.Send className="h-4 w-4" />
                  {t(`${KEY}.apply`, { count: assignSelectedIds.length })}
                </Button>
              </div>
            </GlassCard>
          </form>
        </F.Form>
      )}
    </div>
  );
};

export default AssociationLearningAssignPage;
