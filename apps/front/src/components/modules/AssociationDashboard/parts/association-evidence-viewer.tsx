"use client";

import { TAssociationEvidenceViewer } from "@/types/association-dashboard.types";
import { humanizeEnumValue } from "@utils/function-helper";
import { formatFileSize } from "@utils/pdu.constant";
import { Button } from "@ui/button";

import * as SH from "@ui/sheet";
import * as L from "lucide-react";

export const AssociationEvidenceViewer = ({
  hook,
}: TAssociationEvidenceViewer) => {
  const {
    t,
    locale,
    download,
    isMutating,
    openActivity,
    openDecision,
    closeEvidence,
    downloadingFileId,
  } = hook;

  const date = (value: string) => new Date(value).toLocaleDateString(locale);

  const primaryFile = openActivity?.files[0] ?? null;

  const attachedEvidence = primaryFile
    ? primaryFile.fileName
    : openActivity?.evidenceUrl
      ? t("associationDashboard.memberDetail.evidence.link")
      : t("associationDashboard.memberDetail.evidence.noAttachment");

  const summaryRows = openActivity
    ? [
        {
          label: t("associationDashboard.memberDetail.evidence.attachedEvidence"),
          value: attachedEvidence,
        },
        {
          label: t("associationDashboard.memberDetail.evidence.activity"),
          value: openActivity.title,
        },
        {
          label: t("associationDashboard.memberDetail.evidence.completed"),
          value: date(openActivity.date as string),
        },
        {
          label: t("associationDashboard.memberDetail.evidence.type"),
          value: humanizeEnumValue(openActivity.category),
        },
        {
          label: t("associationDashboard.memberDetail.evidence.provider"),
          value:
            openActivity.provider ??
            t("associationDashboard.memberDetail.evidence.noProvider"),
        },
      ]
    : [];

  return (
    <SH.Sheet
      open={Boolean(openActivity)}
      onOpenChange={(open) => {
        if (!open) closeEvidence();
      }}
    >
      <SH.SheetContent
        side="right"
        className="glass-dialog z-[9999] w-full gap-0 overflow-y-auto border-border sm:max-w-lg"
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
            <dl className="grid grid-cols-2 gap-4 rounded-md border p-4">
              {summaryRows.map((row) => (
                <div key={row.label}>
                  <dt className="text-xs uppercase text-muted-foreground">
                    {row.label}
                  </dt>
                  <dd className="mt-1 text-sm">{row.value}</dd>
                </div>
              ))}
            </dl>

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
                      className="flex items-center justify-between gap-3 rounded-md border p-3"
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
                        variant="outline"
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

            <SH.SheetFooter className="px-0">
              {openActivity.canReview && (
                <>
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
                    disabled={isMutating}
                    onClick={() => openDecision(openActivity.id, true)}
                  >
                    <L.Check className="h-4 w-4" />
                    {t("associationDashboard.memberDetail.activities.approve")}
                  </Button>
                </>
              )}

              <Button
                radius="xl"
                type="button"
                variant="outline"
                onClick={closeEvidence}
              >
                {t("associationDashboard.memberDetail.evidence.close")}
              </Button>

              <Button
                radius="xl"
                type="button"
                disabled={!primaryFile || downloadingFileId === primaryFile.id}
                onClick={() =>
                  primaryFile && void download("evidence", primaryFile)
                }
              >
                {primaryFile && downloadingFileId === primaryFile.id ? (
                  <L.Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <L.Download className="h-4 w-4" />
                )}
                {t("associationDashboard.memberDetail.evidence.download")}
              </Button>
            </SH.SheetFooter>
          </div>
        )}
      </SH.SheetContent>
    </SH.Sheet>
  );
};
