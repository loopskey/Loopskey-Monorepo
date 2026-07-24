"use client";

import { TCertificateDetailCardProps } from "@/types/professional-dashboard.types";
import { formatDate, formatDateTime } from "@/utils/function-helper";
import { CertificateStatusBadge } from "@modules/ProfessionalDashboard/parts/certificate-status-badge";
import { formatFileSize } from "@/utils/pdu.constant";
import { GlassCard } from "@elements/glass-card";
import { ReactNode } from "react";
import { Button } from "@ui/button";

import * as L from "lucide-react";

const CERTIFICATES = "professionalDashboard.certificates";

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div>
    <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
    <dd className="mt-1 break-words text-sm leading-6">{children}</dd>
  </div>
);

export const CertificateDetailCard = ({
  t,
  onEdit,
  onDownload,
  certificate,
  downloadingFileId,
}: TCertificateDetailCardProps) => {
  const [evidenceFile] = certificate.evidenceFiles;
  const isDownloading = Boolean(
    evidenceFile && downloadingFileId === evidenceFile.id,
  );

  return (
    <GlassCard className="lg:sticky lg:top-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-primary">
            {t(`${CERTIFICATES}.detail.eyebrow`)}
          </p>
          <h3 className="mt-2 break-words text-lg font-medium">
            {certificate.title}
          </h3>
        </div>

        <CertificateStatusBadge
          t={t}
          status={certificate.status}
          className="shrink-0"
        />
      </div>

      <dl className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <Field label={t(`${CERTIFICATES}.table.issuer`)}>
          {certificate.issuer ?? t(`${CERTIFICATES}.unknownIssuer`)}
        </Field>
        <Field label={t(`${CERTIFICATES}.fields.certificateNumber`)}>
          {certificate.certificateNumber || "—"}
        </Field>
        <Field label={t(`${CERTIFICATES}.table.issueDate`)}>
          {formatDate(certificate.issuedAt) ?? "—"}
        </Field>
        <Field label={t(`${CERTIFICATES}.table.expiryDate`)}>
          {formatDate(certificate.validUntil) ?? t(`${CERTIFICATES}.lifetime`)}
        </Field>
        <Field label={t(`${CERTIFICATES}.table.linkedTo`)}>
          {certificate.cpdPlanName || t(`${CERTIFICATES}.table.notLinked`)}
        </Field>
        <Field label={t(`${CERTIFICATES}.fields.evidenceFile`)}>
          {evidenceFile ? (
            <span className="break-all">{evidenceFile.fileName}</span>
          ) : (
            <span className="text-muted-foreground">
              {t(`${CERTIFICATES}.detail.noEvidence`)}
            </span>
          )}
        </Field>
        {evidenceFile && (
          <Field label={t(`${CERTIFICATES}.detail.uploadedAt`)}>
            {formatDate(evidenceFile.createdAt) ?? "—"}
            <span className="block text-xs text-muted-foreground">
              {evidenceFile.mimeType} · {formatFileSize(evidenceFile.sizeBytes)}
            </span>
          </Field>
        )}
        <Field label={t(`${CERTIFICATES}.detail.createdAt`)}>
          {formatDateTime(certificate.createdAt)}
        </Field>
        <Field label={t(`${CERTIFICATES}.detail.updatedAt`)}>
          {formatDateTime(certificate.updatedAt)}
        </Field>
      </dl>

      {certificate.evidenceFiles.length > 1 && (
        <p className="mt-4 text-xs text-muted-foreground">
          {t(`${CERTIFICATES}.detail.additionalFiles`, {
            count: certificate.evidenceFiles.length - 1,
          })}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3 border-t border-glass-border pt-5 sm:flex-row">
        <Button
          radius="xl"
          type="button"
          variant="brand"
          className="sm:flex-1"
          disabled={!evidenceFile || Boolean(downloadingFileId)}
          onClick={() => evidenceFile && onDownload(evidenceFile)}
          aria-label={
            evidenceFile
              ? t(`${CERTIFICATES}.detail.downloadFile`, {
                  name: evidenceFile.fileName,
                })
              : undefined
          }
        >
          {isDownloading ? (
            <L.Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <L.Download className="h-4 w-4" aria-hidden />
          )}
          {t(`${CERTIFICATES}.detail.download`)}
        </Button>

        <Button
          radius="xl"
          type="button"
          variant="glass"
          className="sm:flex-1"
          onClick={() => onEdit(certificate.id)}
        >
          <L.Pencil className="h-4 w-4" aria-hidden />
          {t(`${CERTIFICATES}.actions.edit`)}
        </Button>
      </div>

      {!evidenceFile && (
        <p className="mt-3 text-xs text-muted-foreground">
          {t(`${CERTIFICATES}.detail.missingEvidenceHint`)}
        </p>
      )}
    </GlassCard>
  );
};
