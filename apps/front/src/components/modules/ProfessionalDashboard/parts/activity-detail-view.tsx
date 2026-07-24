"use client";

import { PduCompletionStatus, PduStatus } from "@/lib/graphql/generated";
import { formatDate, formatDateTime } from "@/utils/function-helper";
import { TActivityDetailViewProps } from "@/types/professional-dashboard.types";
import { formatFileSize } from "@/utils/pdu.constant";
import { GlassCard } from "@elements/glass-card";
import { ReactNode } from "react";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import * as L from "lucide-react";

const TRACKER = "professionalDashboard.cpdPduTracker";

type Translate = TActivityDetailViewProps["t"];

const Field = ({
  label,
  children,
  wide = false,
}: {
  label: string;
  children: ReactNode;
  wide?: boolean;
}) => (
  <div className={wide ? "sm:col-span-2" : undefined}>
    <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
    <dd className="mt-1 break-words text-sm leading-6">{children}</dd>
  </div>
);

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <GlassCard>
    <h2 className="mb-5 text-lg font-medium">{title}</h2>
    <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">{children}</dl>
  </GlassCard>
);

const TextBlock = ({ value }: { value: string }) => (
  <p className="whitespace-pre-wrap break-words text-sm leading-6">{value}</p>
);

const EvidenceFiles = ({
  t,
  activity,
  onDownload,
  downloadingFileId,
}: {
  t: Translate;
  activity: TActivityDetailViewProps["activity"];
  onDownload: TActivityDetailViewProps["onDownload"];
  downloadingFileId: string | null;
}) => {
  if (activity.evidenceFiles.length === 0)
    return (
      <p className="text-sm text-muted-foreground">
        {t(`${TRACKER}.detail.sections.noEvidence`)}
      </p>
    );

  return (
    <ul className="space-y-3">
      {activity.evidenceFiles.map((file) => {
        const isDownloading = downloadingFileId === file.id;

        return (
          <li
            key={file.id}
            className="flex flex-col gap-3 rounded-2xl border border-glass-border bg-background/40 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-start gap-3">
              <L.FileText
                className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                aria-hidden
              />
              <div className="min-w-0">
                <p className="break-words text-sm font-medium">
                  {file.fileName}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {file.mimeType} · {formatFileSize(file.sizeBytes)} ·{" "}
                  {t(`${TRACKER}.detail.fileUploaded`, {
                    date: formatDate(file.createdAt) ?? "—",
                  })}
                </p>
              </div>
            </div>

            <Button
              size="sm"
              radius="xl"
              type="button"
              variant="glass"
              onClick={() => onDownload(file)}
              disabled={Boolean(downloadingFileId)}
              className="shrink-0 focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2"
              aria-label={t(`${TRACKER}.detail.downloadFile`, {
                name: file.fileName,
              })}
            >
              {isDownloading ? (
                <L.Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <L.Download className="h-4 w-4" aria-hidden />
              )}
              {t(`${TRACKER}.evidence.download`)}
            </Button>
          </li>
        );
      })}
    </ul>
  );
};

export const ActivityDetailView = ({
  t,
  activity,
  onCancel,
  onEdit,
  onDownload,
  downloadingFileId,
}: TActivityDetailViewProps) => {
  const hasNotes = Boolean(
    activity.description || activity.learningOutcome || activity.evidenceNote,
  );
  const hasLinkedContent = Boolean(activity.contentId && activity.contentType);

  return (
    <div className="space-y-6">
      {/* Header with title and primary actions */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div className="min-w-0">
          <p className="text-sm font-medium text-primary">
            {t(`${TRACKER}.detail.eyebrow`)}
          </p>
          <h1 className="mt-2 break-words text-3xl font-medium tracking-tight md:text-4xl">
            {activity.title}
          </h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button radius="xl" type="button" variant="glass" onClick={onCancel}>
            <L.ArrowLeft className="h-4 w-4" aria-hidden />
            {t(`${TRACKER}.detail.cancel`)}
          </Button>

          <Button radius="xl" type="button" variant="brand" onClick={onEdit}>
            <L.Pencil className="h-4 w-4" aria-hidden />
            {t(`${TRACKER}.detail.edit`)}
          </Button>
        </div>
      </div>

      {/* Overview */}
      <Section title={t(`${TRACKER}.detail.sections.overview`)}>
        <Field label={t(`${TRACKER}.table.type`)}>
          {t(`${TRACKER}.activityTypes.${activity.source}`)}
        </Field>
        <Field label={t(`${TRACKER}.fields.providerOrganizer`)}>
          {activity.providerOrganizer || "—"}
        </Field>
        <Field label={t(`${TRACKER}.table.dateCompleted`)}>
          {formatDate(activity.date) ?? "—"}
        </Field>
        <Field label={t(`${TRACKER}.fields.reportingYear`)}>
          {activity.reportingYear ?? "—"}
        </Field>
        <Field label={t(`${TRACKER}.detail.approvalStatus`)}>
          <Badge
            variant={
              activity.status === PduStatus.Approved ? "default" : "secondary"
            }
          >
            {t(`${TRACKER}.statuses.${activity.status}`)}
          </Badge>
        </Field>
        <Field label={t(`${TRACKER}.table.status`)}>
          <Badge
            variant={
              activity.completionStatus === PduCompletionStatus.Completed
                ? "default"
                : "secondary"
            }
          >
            {t(`${TRACKER}.completionStatuses.${activity.completionStatus}`)}
          </Badge>
        </Field>
      </Section>

      {/* CPD/PDU details */}
      <Section title={t(`${TRACKER}.detail.sections.credits`)}>
        <Field label={t(`${TRACKER}.table.creditValue`)}>
          {Number(activity.pdus ?? 0).toFixed(1)}
        </Field>
        <Field label={t(`${TRACKER}.table.creditType`)}>
          <Badge variant="secondary">
            {t(`${TRACKER}.creditTypes.${activity.creditType}`)}
          </Badge>
        </Field>
        <Field label={t(`${TRACKER}.table.category`)}>
          <Badge variant="secondary">
            {t(`${TRACKER}.categories.${activity.category}`)}
          </Badge>
        </Field>
        <Field label={t(`${TRACKER}.fields.subCategory`)}>
          {activity.subCategory || "—"}
        </Field>
        <Field label={t(`${TRACKER}.fields.issuingOrganization`)}>
          {activity.issuingOrganization || "—"}
        </Field>
        <Field label={t(`${TRACKER}.fields.relatedCertification`)}>
          {activity.relatedCertification || "—"}
        </Field>
      </Section>

      {/* Description and notes */}
      {hasNotes && (
        <Section title={t(`${TRACKER}.detail.sections.notes`)}>
          {activity.description && (
            <Field label={t(`${TRACKER}.fields.description`)} wide>
              <TextBlock value={activity.description} />
            </Field>
          )}
          {activity.learningOutcome && (
            <Field label={t(`${TRACKER}.fields.learningOutcome`)} wide>
              <TextBlock value={activity.learningOutcome} />
            </Field>
          )}
          {activity.evidenceNote && (
            <Field label={t(`${TRACKER}.fields.evidenceNote`)} wide>
              <TextBlock value={activity.evidenceNote} />
            </Field>
          )}
        </Section>
      )}

      {/* Evidence and attachments */}
      <GlassCard>
        <h2 className="mb-5 text-lg font-medium">
          {t(`${TRACKER}.detail.sections.evidence`)}
        </h2>

        {activity.evidenceUrl && (
          <a
            target="_blank"
            href={activity.evidenceUrl}
            rel="noopener noreferrer"
            className="mb-4 inline-flex items-center gap-2 break-all text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2"
          >
            <L.ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
            {t(`${TRACKER}.detail.evidenceLink`)}
          </a>
        )}

        <EvidenceFiles
          t={t}
          activity={activity}
          onDownload={onDownload}
          downloadingFileId={downloadingFileId}
        />
      </GlassCard>

      {/* Record metadata */}
      <Section title={t(`${TRACKER}.detail.sections.record`)}>
        {hasLinkedContent && (
          <Field label={t(`${TRACKER}.detail.linkedContent`)}>
            <Badge variant="secondary">{activity.contentType}</Badge>
          </Field>
        )}
        <Field label={t(`${TRACKER}.detail.createdAt`)}>
          {formatDateTime(activity.createdAt)}
        </Field>
        <Field label={t(`${TRACKER}.detail.updatedAt`)}>
          {formatDateTime(activity.updatedAt)}
        </Field>
      </Section>
    </div>
  );
};
