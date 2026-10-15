"use client";

import { TAssociationMemberCertificatesSection } from "@/types/association-dashboard.types";
import { TAssociationCertificateRow } from "@/types/association-dashboard.types";
import { DataTable } from "@elements/data-table/data-table";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import * as L from "lucide-react";

const KEY = "associationDashboard.memberDetail.certificates";

export const AssociationMemberCertificatesSection = ({
  hook,
}: TAssociationMemberCertificatesSection) => {
  const { t, locale, download, certificates, downloadingFileId } = hook;

  const date = (value: string | null | undefined) =>
    value ? new Date(value).toLocaleDateString(locale) : "-";

  const files = (certificate: TAssociationCertificateRow) =>
    certificate.files.length === 0 ? (
      <span className="text-muted-foreground">
        {t("associationDashboard.memberDetail.evidence.noFiles")}
      </span>
    ) : (
      <div className="flex flex-wrap gap-2">
        {certificate.files.map((file) => (
          <Button
            key={file.id}
            size="iconSm"
            radius="lg"
            type="button"
            variant="outline"
            disabled={downloadingFileId === file.id}
            onClick={() => void download("certificate", file)}
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
          </Button>
        ))}
      </div>
    );

  return (
    <GlassCard>
      <div className="relative z-10">
        <h2 className="text-xl font-medium">{t(`${KEY}.title`)}</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {t(`${KEY}.description`)}
        </p>

        <DataTable
          className="mt-6"
          rows={certificates}
          caption={t(`${KEY}.title`)}
          rowKey={(certificate) => certificate.id}
          empty={{
            icon: L.Award,
            title: t(`${KEY}.emptyTitle`),
            description: t(`${KEY}.emptyBody`),
          }}
          columns={[
            {
              id: "certificate",
              mobile: "title",
              className: "max-w-64 whitespace-normal font-medium",
              header: t(`${KEY}.columns.certificate`),
              cell: (certificate) => certificate.title,
            },
            {
              id: "status",
              mobile: "badge",
              header: t(`${KEY}.columns.status`),
              cell: (certificate) => (
                <Badge variant="secondary">
                  {t(`${KEY}.statuses.${certificate.status}`)}
                </Badge>
              ),
            },
            {
              id: "issuer",
              header: t(`${KEY}.columns.issuer`),
              cell: (certificate) => certificate.issuer ?? t(`${KEY}.noIssuer`),
            },
            {
              id: "issueDate",
              header: t(`${KEY}.columns.issueDate`),
              cell: (certificate) => date(certificate.issuedAt as string),
            },
            {
              id: "expiryDate",
              header: t(`${KEY}.columns.expiryDate`),
              cell: (certificate) =>
                date(certificate.validUntil as string | null),
            },
            {
              id: "linkedTo",
              header: t(`${KEY}.columns.linkedTo`),
              cell: (certificate) =>
                certificate.linkedTo ?? t(`${KEY}.noLinkedTo`),
            },
            {
              id: "files",
              mobile: "wide",
              header: t(`${KEY}.columns.files`),
              cell: files,
            },
          ]}
        />
      </div>
    </GlassCard>
  );
};
