"use client";

import { CertificateStatusBadge } from "@modules/ProfessionalDashboard/parts/certificate-status-badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@ui/tooltip";
import { TCertificatesTableProps } from "@/types/professional-dashboard.types";
import { ProfessionalCertificate } from "@/types/professional-dashboard.types";
import { I18nContextValue } from "@/types/providers.types";
import { ConfirmDialog } from "@elements/confirm-dialog";
import { formatDate } from "@/utils/function-helper";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

import * as L from "lucide-react";

const CERTIFICATES = "professionalDashboard.certificates";

const IconAction = ({
  icon: Icon,
  label,
  onClick,
  disabled,
  variant = "glass",
}: {
  label: string;
  icon: typeof L.Pencil;
  disabled?: boolean;
  onClick?: () => void;
  variant?: "glass" | "cancel";
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        radius="full"
        size="iconSm"
        type="button"
        variant={variant}
        onClick={onClick}
        aria-label={label}
        disabled={disabled}
        className="focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2"
      >
        <Icon className="h-4 w-4" aria-hidden />
      </Button>
    </TooltipTrigger>
    <TooltipContent>{label}</TooltipContent>
  </Tooltip>
);

const SelectButton = ({
  onSelect,
  isSelected,
  certificate,
  className,
}: {
  isSelected: boolean;
  className?: string;
  certificate: ProfessionalCertificate;
  onSelect: TCertificatesTableProps["onSelect"];
}) => (
  <button
    type="button"
    aria-pressed={isSelected}
    title={certificate.title}
    onClick={(event) => {
      // The row itself also selects on click; without this the two handlers
      // would toggle each other out.
      event.stopPropagation();
      onSelect(certificate.id);
    }}
    className={cn(
      "block max-w-full text-left font-medium underline-offset-4 hover:underline",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2",
      className,
    )}
  >
    {certificate.title}
  </button>
);

const RowActions = ({
  t,
  onEdit,
  onDelete,
  isDeleting,
  certificate,
  deletingCertificateId,
}: {
  isDeleting: boolean;
  t: I18nContextValue["t"];
  deletingCertificateId: string | null;
  certificate: ProfessionalCertificate;
  onEdit: TCertificatesTableProps["onEdit"];
  onDelete: TCertificatesTableProps["onDelete"];
}) => (
  <div
    className="flex items-center gap-2"
    // Row selection is a click on the row; the actions must not trigger it.
    onClick={(event) => event.stopPropagation()}
  >
    <IconAction
      icon={L.Pencil}
      disabled={isDeleting}
      onClick={() => onEdit(certificate.id)}
      label={t(`${CERTIFICATES}.actions.edit`)}
    />

    <ConfirmDialog
      confirmVariant="destructive"
      cancelText={t("common.cancel")}
      confirmText={t("common.delete")}
      onConfirm={() => onDelete(certificate.id)}
      title={t(`${CERTIFICATES}.deleteTitle`)}
      isLoading={deletingCertificateId === certificate.id}
      description={t(`${CERTIFICATES}.deleteDescription`)}
      trigger={
        <span>
          <IconAction
            variant="cancel"
            icon={L.Trash2}
            disabled={isDeleting}
            label={t(`${CERTIFICATES}.actions.delete`)}
          />
        </span>
      }
    />
  </div>
);

const LinkedTo = ({
  t,
  certificate,
}: {
  t: I18nContextValue["t"];
  certificate: ProfessionalCertificate;
}) =>
  certificate.cpdPlanName ? (
    <span className="block truncate" title={certificate.cpdPlanName}>
      {certificate.cpdPlanName}
    </span>
  ) : (
    <span className="text-muted-foreground">
      {t(`${CERTIFICATES}.table.notLinked`)}
    </span>
  );

export const CertificatesTable = ({
  t,
  onEdit,
  onSelect,
  onDelete,
  selectedId,
  isDeleting,
  certificates,
  deletingCertificateId,
}: TCertificatesTableProps) => {
  const columns = [
    "certificate",
    "issuer",
    "issueDate",
    "expiryDate",
    "status",
    "linkedTo",
    "actions",
  ] as const;

  const rowActions = (certificate: ProfessionalCertificate) => (
    <RowActions
      t={t}
      onEdit={onEdit}
      onDelete={onDelete}
      isDeleting={isDeleting}
      certificate={certificate}
      deletingCertificateId={deletingCertificateId}
    />
  );

  return (
    <>
      {/* Seven columns never fit a phone; below lg each row becomes a card. */}
      <div className="hidden overflow-x-auto rounded-[2rem] border border-glass-border lg:block">
        <table className="w-full min-w-[960px] border-collapse text-sm">
          <caption className="sr-only">
            {t(`${CERTIFICATES}.table.caption`)}
          </caption>
          <thead>
            <tr className="border-b border-glass-border bg-primary/5 text-left text-xs font-black uppercase tracking-wider text-muted-foreground">
              {columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="whitespace-nowrap px-4 py-4"
                >
                  {t(`${CERTIFICATES}.table.${column}`)}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-glass-border">
            {certificates.map((certificate) => {
              const isSelected = selectedId === certificate.id;

              return (
                <tr
                  key={certificate.id}
                  onClick={() => onSelect(certificate.id)}
                  className={cn(
                    "cursor-pointer bg-background/35 transition-colors hover:bg-primary/5",
                    isSelected &&
                      "bg-primary/10 shadow-[inset_3px_0_0_0_var(--color-primary)] hover:bg-primary/15",
                  )}
                >
                  <td className="max-w-72 px-4 py-4">
                    {/* The name is the keyboard-reachable selection control.
                        `aria-selected` is not valid on a plain table row, and a
                        focusable row would swallow Enter from the action
                        buttons inside it. */}
                    <SelectButton
                      className="truncate"
                      onSelect={onSelect}
                      isSelected={isSelected}
                      certificate={certificate}
                    />
                    {certificate.certificateNumber && (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {certificate.certificateNumber}
                      </p>
                    )}
                  </td>
                  <td className="max-w-48 px-4 py-4 text-muted-foreground">
                    <span
                      className="block truncate"
                      title={certificate.issuer ?? undefined}
                    >
                      {certificate.issuer ??
                        t(`${CERTIFICATES}.unknownIssuer`)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">
                    {formatDate(certificate.issuedAt) ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">
                    {formatDate(certificate.validUntil) ??
                      t(`${CERTIFICATES}.lifetime`)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <CertificateStatusBadge t={t} status={certificate.status} />
                  </td>
                  <td className="max-w-48 px-4 py-4">
                    <LinkedTo t={t} certificate={certificate} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    {rowActions(certificate)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="space-y-4 lg:hidden">
        {certificates.map((certificate) => {
          const isSelected = selectedId === certificate.id;

          return (
            <li key={certificate.id}>
              {/* A plain container, not a button: the card holds the edit and
                  delete controls, and nesting interactive elements is invalid.
                  The name below is the selection control. */}
              <div
                onClick={() => onSelect(certificate.id)}
                className={cn(
                  "w-full cursor-pointer rounded-[1.5rem] border border-glass-border bg-background/40 p-5 text-left transition-colors",
                  isSelected && "border-primary/50 bg-primary/10",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <SelectButton
                    className="break-words"
                    onSelect={onSelect}
                    isSelected={isSelected}
                    certificate={certificate}
                  />
                  <CertificateStatusBadge t={t} status={certificate.status} />
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">
                      {t(`${CERTIFICATES}.table.issuer`)}
                    </dt>
                    <dd className="break-words">
                      {certificate.issuer ?? t(`${CERTIFICATES}.unknownIssuer`)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">
                      {t(`${CERTIFICATES}.table.issueDate`)}
                    </dt>
                    <dd>{formatDate(certificate.issuedAt) ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">
                      {t(`${CERTIFICATES}.table.expiryDate`)}
                    </dt>
                    <dd>
                      {formatDate(certificate.validUntil) ??
                        t(`${CERTIFICATES}.lifetime`)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">
                      {t(`${CERTIFICATES}.table.linkedTo`)}
                    </dt>
                    <dd className="break-words">
                      <LinkedTo t={t} certificate={certificate} />
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 flex justify-end">
                  {rowActions(certificate)}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
};
