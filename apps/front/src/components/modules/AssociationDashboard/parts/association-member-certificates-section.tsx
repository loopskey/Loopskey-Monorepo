"use client";

import { TAssociationMemberCertificatesSection } from "@/types/association-dashboard.types";
import { formatFileSize } from "@utils/pdu.constant";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import * as L from "lucide-react";

export const AssociationMemberCertificatesSection = ({
  hook,
}: TAssociationMemberCertificatesSection) => {
  const { t, locale, download, certificates, downloadingFileId } = hook;

  const date = (value: string | null | undefined) =>
    value ? new Date(value).toLocaleDateString(locale) : "-";

  return (
    <GlassCard>
      <div className="relative z-10">
        <h2 className="text-xl font-medium">
          {t("associationDashboard.memberDetail.certificates.title")}
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {t("associationDashboard.memberDetail.certificates.description")}
        </p>

        {certificates.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-glass-border p-8 text-center">
            <L.Award className="mx-auto h-8 w-8 text-muted-foreground" />

            <p className="mt-3 font-medium">
              {t("associationDashboard.memberDetail.certificates.emptyTitle")}
            </p>

            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              {t("associationDashboard.memberDetail.certificates.emptyBody")}
            </p>
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {certificates.map((certificate) => (
              <li
                key={certificate.id}
                className="rounded-3xl border border-glass-border bg-background/50 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{certificate.title}</p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {t(
                        "associationDashboard.memberDetail.certificates.meta",
                        {
                          issuer:
                            certificate.issuer ??
                            t(
                              "associationDashboard.memberDetail.certificates.noIssuer",
                            ),
                          issued: date(certificate.issuedAt as string),
                          expires: date(
                            certificate.validUntil as string | null,
                          ),
                          credits: certificate.creditsEarned,
                        },
                      )}
                    </p>
                  </div>

                  <Badge variant="secondary">{certificate.status}</Badge>
                </div>

                {certificate.files.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {certificate.files.map((file) => (
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
                          {t(
                            "associationDashboard.memberDetail.evidence.download",
                          )}
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </GlassCard>
  );
};
