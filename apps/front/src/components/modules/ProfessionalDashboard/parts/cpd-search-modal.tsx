"use client";

import { CpdSearchModalProps, TCertification } from "@/types/cpd-plan.types";
import { CpdCertificationResultCard } from "@modules/ProfessionalDashboard/parts/cpd-certification-result-card";
import { CpdSuggestedRequirement } from "@modules/ProfessionalDashboard/parts/cpd-suggested-requirement";
import { useCertificationSearch } from "@/hooks/useCertificationSearch";
import { useEffect, useState } from "react";
import { Button } from "@ui/button";
import { Input } from "@ui/input";

import * as L from "lucide-react";
import * as D from "@ui/dialog";

export const CpdSearchModal = ({
  t,
  open,
  onClose,
  isSubmitting,
  onAddManually,
  onUseSuggested,
  onEditManually,
}: CpdSearchModalProps) => {
  const {
    query,
    setQuery,
    hasQuery,
    results,
    isFetching,
    isError,
    refetch,
    resetQuery,
  } = useCertificationSearch();

  const [selected, setSelected] = useState<TCertification | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!open) {
      setSelected(null);
      resetQuery();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => setActiveIndex(0), [results]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!results.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && results[activeIndex]) {
      event.preventDefault();
      setSelected(results[activeIndex]);
    }
  };

  const preventCloseWhileSubmitting = (next: boolean) => {
    if (!next && isSubmitting) return;
    if (!next) onClose();
  };

  return (
    <D.Dialog open={open} onOpenChange={preventCloseWhileSubmitting}>
      <D.DialogContent className="glass-dialog max-h-[90vh] max-w-xl overflow-y-auto rounded-3xl border-glass-border">
        <D.DialogHeader>
          <D.DialogTitle>{t("cpdProgress.search.title")}</D.DialogTitle>
          <D.DialogDescription>
            {t("cpdProgress.search.description")}
          </D.DialogDescription>
        </D.DialogHeader>

        {selected ? (
          <CpdSuggestedRequirement
            t={t}
            certification={selected}
            isSubmitting={isSubmitting}
            onEditManually={onEditManually}
            onUseSuggested={onUseSuggested}
            onBack={() => setSelected(null)}
          />
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">
                {t("cpdProgress.search.sectionTitle")}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t("cpdProgress.search.sectionDescription")}
              </p>
            </div>

            <div className="relative">
              <L.Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                value={query}
                onKeyDown={handleKeyDown}
                onChange={(event) => setQuery(event.target.value)}
                aria-label={t("cpdProgress.search.sectionTitle")}
                placeholder={t("cpdProgress.search.placeholder")}
                className="h-12 rounded-2xl bg-background/60 pl-11"
              />
            </div>

            <div
              role="listbox"
              className="min-h-40 space-y-2"
              aria-label={t("cpdProgress.search.sectionTitle")}
            >
              {!hasQuery ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  {t("cpdProgress.search.minChars")}
                </p>
              ) : isFetching ? (
                <div className="flex items-center justify-center py-10">
                  <L.Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : isError ? (
                <div className="space-y-3 py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    {t("cpdProgress.search.error")}
                  </p>
                  <Button
                    radius="xl"
                    size="sm"
                    variant="glass"
                    type="button"
                    onClick={() => refetch()}
                  >
                    <L.RefreshCw className="h-4 w-4" />
                    {t("cpdProgress.search.retry")}
                  </Button>
                </div>
              ) : results.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  {t("cpdProgress.search.empty")}
                </p>
              ) : (
                results.map((certification, index) => (
                  <div
                    key={certification.id}
                    role="option"
                    aria-selected={index === activeIndex}
                  >
                    <CpdCertificationResultCard
                      t={t}
                      certification={certification}
                      onSelect={setSelected}
                    />
                  </div>
                ))
              )}
            </div>

            <div className="flex flex-col items-center gap-2 border-t border-glass-border pt-4 text-center">
              <p className="text-sm text-muted-foreground">
                {t("cpdProgress.search.cantFind")}
              </p>
              <Button
                radius="xl"
                type="button"
                variant="glass"
                onClick={() => onAddManually(query)}
              >
                <L.PlusCircle className="h-4 w-4" />
                {t("cpdProgress.search.addManually")}
              </Button>
            </div>
          </div>
        )}
      </D.DialogContent>
    </D.Dialog>
  );
};
