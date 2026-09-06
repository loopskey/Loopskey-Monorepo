"use client";

import { TAssociationEvidenceViewer } from "@/types/association-dashboard.types";
import { formatFileSize } from "@utils/pdu.constant";
import { Button } from "@ui/button";

import * as SH from "@ui/sheet";
import * as L from "lucide-react";

export const AssociationEvidenceViewer = ({
  hook,
}: TAssociationEvidenceViewer) => {
  const {
    t,
    download,
    isMutating,
    openActivity,
    openDecision,
    closeEvidence,
    downloadingFileId,
  } = hook;

  return (
    <SH.Sheet
      open={Boolean(openActivity)}
      onOpenChange={(open) => {
        if (!open) closeEvidence();
      }}
    >
      <SH.SheetContent
        side="right"
        className="glass-dialog z-[9999] w-full gap-0 overflow-y-auto border-glass-border sm:max-w-lg"
      >
        <SH.SheetHeader>
          <SH.SheetTitle>
            {t("associationDashboard.memberDetail.evidence.title")}
          </SH.SheetTitle>

          <SH.SheetDescription>
            {openActivity?.title ??
              t("associationDashboard.memberDetail.evidence.description")}
          </SH.SheetDescription>
        </SH.SheetHeader>

        {openActivity && (
          <div className="space-y-5 px-4 pb-6">
            <div>
              <h3 className="text-xs uppercase text-muted-foreground">
                {t("associationDashboard.memberDetail.evidence.note")}
              </h3>

              <p className="mt-1 text-sm">
                {openActivity.evidenceNote ??
                  t("associationDashboard.memberDetail.evidence.noNote")}
              </p>
            </div>

            <div>
              <h3 className="text-xs uppercase text-muted-foreground">
                {t("associationDashboard.memberDetail.evidence.link")}
              </h3>

              {openActivity.evidenceUrl ? (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={openActivity.evidenceUrl}
                  className="mt-1 inline-flex items-center gap-2 break-all text-sm text-primary underline underline-offset-4"
                >
                  <L.ExternalLink className="h-4 w-4 shrink-0" />
                  {openActivity.evidenceUrl}
                </a>
              ) : (
                <p className="mt-1 text-sm">
                  {t("associationDashboard.memberDetail.evidence.noLink")}
                </p>
              )}
            </div>

            <div>
              <h3 className="text-xs uppercase text-muted-foreground">
                {t("associationDashboard.memberDetail.evidence.files")}
              </h3>

              {openActivity.files.length === 0 ? (
                <p className="mt-1 text-sm">
                  {t("associationDashboard.memberDetail.evidence.noFiles")}
                </p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {openActivity.files.map((file) => (
                    <li
                      key={file.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-glass-border p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm">{file.fileName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.sizeBytes)}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        radius="xl"
                        type="button"
                        variant="glass"
                        disabled={downloadingFileId === file.id}
                        onClick={() => void download("evidence", file)}
                        aria-label={t(
                          "associationDashboard.memberDetail.evidence.downloadFile",
                          { name: file.fileName },
                        )}
                      >
                        {downloadingFileId === file.id ? (
                          <L.Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <L.Download className="h-4 w-4" />
                        )}
                        {t(
                          "associationDashboard.memberDetail.evidence.download",
                        )}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {openActivity.canReview && (
              <SH.SheetFooter className="px-0">
                <Button
                  radius="xl"
                  type="button"
                  variant="destructive"
                  disabled={isMutating}
                  onClick={() => openDecision(openActivity.id, false)}
                >
                  <L.X className="h-4 w-4" />
                  {t("associationDashboard.memberDetail.activities.reject")}
                </Button>

                <Button
                  radius="xl"
                  type="button"
                  variant="brand"
                  disabled={isMutating}
                  onClick={() => openDecision(openActivity.id, true)}
                >
                  <L.Check className="h-4 w-4" />
                  {t("associationDashboard.memberDetail.activities.approve")}
                </Button>
              </SH.SheetFooter>
            )}
          </div>
        )}
      </SH.SheetContent>
    </SH.Sheet>
  );
};
