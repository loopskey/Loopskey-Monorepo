"use client";

import { TAssociationMemberCertificatesSection } from "@/types/association-dashboard.types";
import { TAssociationCertificateRow } from "@/types/association-dashboard.types";
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
            size="icon"
            radius="xl"
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
        <h2 className="text-xl font-medium">
          {t("associationDashboard.memberDetail.certificates.title")}
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {t("associationDashboard.memberDetail.certificates.description")}
        </p>

        {certificates.length === 0 ? (
          <div className="mt-6 rounded-md border border-dashed border-border p-8 text-center">
            <L.Award className="mx-auto h-8 w-8 text-muted-foreground" />

            <p className="mt-3 font-medium">
              {t("associationDashboard.memberDetail.certificates.emptyTitle")}
            </p>

            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              {t("associationDashboard.memberDetail.certificates.emptyBody")}
            </p>
          </div>
        ) : (
          <>
            <div className="mt-6 hidden overflow-x-auto md:block">
              <table className="w-full min-w-[820px] text-left text-sm">
                <caption className="sr-only">
                  {t("associationDashboard.memberDetail.certificates.title")}
                </caption>

                <thead className="text-xs uppercase text-muted-foreground">
                  <tr className="border-b border-border">
                    <th scope="col" className="py-3">
                      {t(
                        "associationDashboard.memberDetail.certificates.columns.certificate",
                      )}
                    </th>
                    <th scope="col" className="py-3">
                      {t(
                        "associationDashboard.memberDetail.certificates.columns.issuer",
                      )}
                    </th>
                    <th scope="col" className="py-3">
                      {t(
                        "associationDashboard.memberDetail.certificates.columns.issueDate",
                      )}
                    </th>
                    <th scope="col" className="py-3">
                      {t(
                        "associationDashboard.memberDetail.certificates.columns.expiryDate",
                      )}
                    </th>
                    <th scope="col" className="py-3">
                      {t(
                        "associationDashboard.memberDetail.certificates.columns.status",
                      )}
                    </th>
                    <th scope="col" className="py-3">
                      {t(
                        "associationDashboard.memberDetail.certificates.columns.linkedTo",
                      )}
                    </th>
                    <th scope="col" className="py-3">
                      {t(
                        "associationDashboard.memberDetail.certificates.columns.files",
                      )}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {certificates.map((certificate) => (
                    <tr
                      key={certificate.id}
                      className="border-b border-border/70 align-top"
                    >
                      <td className="py-4 pr-4 font-medium">
                        {certificate.title}
                      </td>
                      <td className="py-4 pr-4">
                        {certificate.issuer ??
                          t(
                            "associationDashboard.memberDetail.certificates.noIssuer",
                          )}
                      </td>
                      <td className="py-4 pr-4">
                        {date(certificate.issuedAt as string)}
                      </td>
                      <td className="py-4 pr-4">
                        {date(certificate.validUntil as string | null)}
                      </td>
                      <td className="py-4 pr-4">
                        <Badge variant="secondary">
                          {t(
                            `associationDashboard.memberDetail.certificates.statuses.${certificate.status}`,
                          )}
                        </Badge>
                      </td>
                      <td className="py-4 pr-4">
                        {certificate.linkedTo ??
                          t(
                            "associationDashboard.memberDetail.certificates.noLinkedTo",
                          )}
                      </td>
                      <td className="py-4">{files(certificate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="mt-6 space-y-3 md:hidden">
              {certificates.map((certificate) => (
                <li key={certificate.id} className="rounded-lg border p-4">
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

                      {certificate.linkedTo && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {t(
                            "associationDashboard.memberDetail.certificates.columns.linkedTo",
                          )}
                          : {certificate.linkedTo}
                        </p>
                      )}
                    </div>

                    <Badge variant="secondary">
                      {t(
                        `associationDashboard.memberDetail.certificates.statuses.${certificate.status}`,
                      )}
                    </Badge>
                  </div>

                  <div className="mt-4">{files(certificate)}</div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </GlassCard>
  );
};
