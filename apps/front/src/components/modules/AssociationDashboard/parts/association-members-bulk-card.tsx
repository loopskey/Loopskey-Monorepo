"use client";

import { TAssociationMembersBulkCard } from "@/types/association-dashboard.types";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Label } from "@ui/label";

import * as L from "lucide-react";

export const AssociationMembersBulkCard = ({
  hook,
}: TAssociationMembersBulkCard) => {
  const {
    t,
    isParsing,
    clearImport,
    isImporting,
    importResult,
    confirmImport,
    importPreview,
    importFileName,
    downloadTemplate,
    previewImportFile,
    importFailureMessage,
  } = hook;

  const canSubmit = Boolean(
    importPreview &&
      importPreview.invalidCount === 0 &&
      importPreview.validCount > 0,
  );

  return (
    <GlassCard>
      <div className="relative z-10">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            <L.FileSpreadsheet className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-xl font-medium">
              {t("associationDashboard.members.bulk.title")}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {t("associationDashboard.members.bulk.description")}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-3xl border border-dashed border-primary/30 bg-primary/5 p-4 text-sm leading-7">
          <p className="font-medium">
            {t("associationDashboard.members.bulk.templateTitle")}
          </p>

          <p className="text-muted-foreground">
            {t("associationDashboard.members.bulk.templateColumns")}
          </p>

          <Button
            size="sm"
            radius="xl"
            type="button"
            variant="glass"
            className="mt-3"
            onClick={downloadTemplate}
          >
            <L.Download className="h-4 w-4" />
            {t("associationDashboard.members.bulk.downloadTemplate")}
          </Button>
        </div>

        <div className="mt-5 space-y-2">
          <Label htmlFor="association-import-file">
            {t("associationDashboard.members.bulk.fileLabel")}
          </Label>

          <Input
            type="file"
            className="rounded-2xl"
            accept=".xlsx,.xls,.csv"
            id="association-import-file"
            disabled={isParsing || isImporting}
            onChange={(event) =>
              void previewImportFile(event.target.files?.[0])
            }
          />
        </div>

        {isParsing && (
          <p className="mt-4 text-sm text-muted-foreground" role="status">
            {t("associationDashboard.members.bulk.parsing")}
          </p>
        )}

        {importPreview && (
          <div className="mt-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">
                {t("associationDashboard.members.bulk.previewTitle", {
                  file: importFileName,
                })}
              </p>

              <p className="text-sm text-muted-foreground">
                {t("associationDashboard.members.bulk.previewCounts", {
                  valid: importPreview.validCount,
                  invalid: importPreview.invalidCount,
                })}
              </p>
            </div>

            {importPreview.isTruncated && (
              <p className="text-sm text-warning-foreground">
                {t("associationDashboard.members.bulk.truncated")}
              </p>
            )}

            <div className="max-h-72 overflow-auto rounded-2xl border border-glass-border">
              <table className="w-full min-w-[560px] text-left text-sm">
                <caption className="sr-only">
                  {t("associationDashboard.members.bulk.previewCaption")}
                </caption>

                <thead className="text-xs uppercase text-muted-foreground">
                  <tr className="border-b border-glass-border">
                    <th scope="col" className="p-3">
                      {t("associationDashboard.members.bulk.columns.row")}
                    </th>
                    <th scope="col" className="p-3">
                      {t("associationDashboard.members.bulk.columns.email")}
                    </th>
                    <th scope="col" className="p-3">
                      {t("associationDashboard.members.bulk.columns.name")}
                    </th>
                    <th scope="col" className="p-3">
                      {t("associationDashboard.members.bulk.problem")}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {importPreview.rows.map((row) => (
                    <tr
                      key={row.row}
                      className="border-b border-glass-border/60 last:border-0"
                    >
                      <td className="p-3 tabular-nums">{row.row}</td>
                      <td className="p-3">{row.email || "-"}</td>
                      <td className="p-3">
                        {[row.firstName, row.lastName]
                          .filter(Boolean)
                          .join(" ") || "-"}
                      </td>
                      <td className="p-3 text-destructive">
                        {row.errorKeys
                          .map((key) =>
                            t(
                              `associationDashboard.members.bulk.rowErrors.${key}`,
                            ),
                          )
                          .join(", ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                radius="xl"
                type="button"
                variant="brand"
                disabled={!canSubmit || isImporting}
                onClick={() => void confirmImport()}
              >
                {isImporting && <L.Loader2 className="h-4 w-4 animate-spin" />}
                {t("associationDashboard.members.bulk.confirm", {
                  count: importPreview.validCount,
                })}
              </Button>

              <Button
                radius="xl"
                type="button"
                variant="glass"
                onClick={clearImport}
                disabled={isImporting}
              >
                {t("associationDashboard.members.confirm.cancel")}
              </Button>
            </div>

            {!canSubmit && importPreview.invalidCount > 0 && (
              <p className="text-sm text-muted-foreground">
                {t("associationDashboard.members.bulk.blocked")}
              </p>
            )}
          </div>
        )}

        {importResult && (
          <div
            role="status"
            className="mt-5 space-y-3 rounded-3xl border border-glass-border bg-background/50 p-4"
          >
            <p className="font-medium">
              {t("associationDashboard.members.bulk.resultTitle")}
            </p>

            <p className="text-sm text-muted-foreground">
              {t("associationDashboard.members.bulk.resultCounts", {
                invited: importResult.invited,
                linked: importResult.linked,
                failed: importResult.failed,
                total: importResult.totalRows,
              })}
            </p>

            {importResult.failures.length > 0 && (
              <ul className="space-y-1 text-sm">
                {importResult.failures.map((failure) => (
                  <li key={`${failure.row}-${failure.email}`}>
                    <span className="font-medium tabular-nums">
                      {t("associationDashboard.members.bulk.rowNumber", {
                        row: failure.row,
                      })}
                    </span>{" "}
                    <span className="text-muted-foreground">
                      {failure.email} — {importFailureMessage(failure)}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <Button
              size="sm"
              radius="xl"
              type="button"
              variant="glass"
              onClick={clearImport}
            >
              {t("associationDashboard.members.bulk.dismissResult")}
            </Button>
          </div>
        )}
      </div>
    </GlassCard>
  );
};
