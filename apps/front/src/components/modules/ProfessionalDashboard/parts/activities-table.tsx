"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@ui/tooltip";
import { TPduActivitiesTableProps } from "@/types/professional-dashboard.types";
import { PduCompletionStatus } from "@/lib/graphql/generated";
import { I18nContextValue } from "@/types/providers.types";
import { ConfirmDialog } from "@elements/confirm-dialog";
import { TPduActivity } from "@/types/professional-dashboard.types";
import { formatDate } from "@/utils/function-helper";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import * as L from "lucide-react";

const TRACKER = "professionalDashboard.cpdPduTracker";

const StatusBadge = ({
  status,
  t,
}: {
  status: PduCompletionStatus;
  t: I18nContextValue["t"];
}) => (
  <Badge
    variant={status === PduCompletionStatus.Completed ? "default" : "secondary"}
  >
    {t(`${TRACKER}.completionStatuses.${status}`)}
  </Badge>
);

const CertificateCell = ({
  activity,
  onDownload,
  t,
}: {
  activity: TPduActivity;
  t: I18nContextValue["t"];
  onDownload: TPduActivitiesTableProps["onDownload"];
}) => {
  const [firstFile] = activity.evidenceFiles;

  if (!firstFile)
    return (
      <span className="text-xs text-muted-foreground">
        {t(`${TRACKER}.table.noFile`)}
      </span>
    );

  return (
    <Button
      size="sm"
      radius="xl"
      type="button"
      variant="glass"
      onClick={() => onDownload(firstFile)}
      title={firstFile.fileName}
    >
      <L.Paperclip className="h-3.5 w-3.5" />
      {activity.evidenceFiles.length > 1
        ? `${t(`${TRACKER}.table.attached`)} (${activity.evidenceFiles.length})`
        : t(`${TRACKER}.table.attached`)}
    </Button>
  );
};

const IconAction = ({
  icon: Icon,
  label,
  onClick,
  disabled,
  variant = "glass",
}: {
  icon: typeof L.Eye;
  label: string;
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

const RowActions = ({
  activity,
  onView,
  onEdit,
  onDelete,
  isDeleting,
  deletingActivityId,
  t,
}: {
  activity: TPduActivity;
  isDeleting: boolean;
  deletingActivityId: string | null;
  t: I18nContextValue["t"];
  onView: TPduActivitiesTableProps["onView"];
  onEdit: TPduActivitiesTableProps["onEdit"];
  onDelete: TPduActivitiesTableProps["onDelete"];
}) => {
  const isDeletingRow = deletingActivityId === activity.id;

  return (
    <div className="flex items-center gap-2">
      <IconAction
        icon={L.Eye}
        disabled={isDeleting}
        onClick={() => onView(activity.id)}
        label={t(`${TRACKER}.actions.view`)}
      />

      <IconAction
        icon={L.Pencil}
        disabled={isDeleting}
        onClick={() => onEdit(activity.id)}
        label={t(`${TRACKER}.actions.edit`)}
      />

      <ConfirmDialog
        isLoading={isDeletingRow}
        confirmVariant="destructive"
        cancelText={t("common.cancel")}
        confirmText={t("common.delete")}
        onConfirm={() => onDelete(activity.id)}
        title={t(`${TRACKER}.activities.deleteTitle`)}
        description={t(`${TRACKER}.activities.deleteDescription`)}
        trigger={
          <span>
            <IconAction
              variant="cancel"
              icon={L.Trash2}
              disabled={isDeleting}
              label={t(`${TRACKER}.actions.delete`)}
            />
          </span>
        }
      />
    </div>
  );
};

export const ActivitiesTable = ({
  t,
  onView,
  onEdit,
  onDelete,
  isDeleting,
  activities,
  onDownload,
  deletingActivityId,
}: TPduActivitiesTableProps) => {
  const columns = [
    "title",
    "type",
    "dateCompleted",
    "creditType",
    "creditValue",
    "category",
    "reportingYear",
    "provider",
    "status",
    "certificate",
    "actions",
  ] as const;

  return (
    <>
      {/* Eleven columns never fit a phone; below lg each row becomes a card. */}
      <div className="hidden overflow-x-auto rounded-[2rem] border border-glass-border lg:block">
        <table className="w-full min-w-[1200px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-glass-border bg-primary/5 text-left text-xs font-black uppercase tracking-wider text-muted-foreground">
              {columns.map((column) => (
                <th key={column} className="whitespace-nowrap px-4 py-4">
                  {t(`${TRACKER}.table.${column}`)}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-glass-border">
            {activities.map((activity) => (
              <tr
                key={activity.id}
                className="bg-background/35 transition-colors hover:bg-primary/5"
              >
                <td className="max-w-72 px-4 py-4">
                  <p className="truncate font-medium" title={activity.title}>
                    {activity.title}
                  </p>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">
                  {t(`${TRACKER}.activityTypes.${activity.source}`)}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">
                  {formatDate(activity.date)}
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  <Badge variant="secondary">
                    {t(`${TRACKER}.creditTypes.${activity.creditType}`)}
                  </Badge>
                </td>
                <td className="whitespace-nowrap px-4 py-4 font-medium">
                  {Number(activity.pdus ?? 0).toFixed(1)}
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  <Badge variant="secondary">
                    {t(`${TRACKER}.categories.${activity.category}`)}
                  </Badge>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">
                  {activity.reportingYear ?? "—"}
                </td>
                <td className="max-w-48 px-4 py-4 text-muted-foreground">
                  <span
                    className="block truncate"
                    title={activity.providerOrganizer ?? undefined}
                  >
                    {activity.providerOrganizer ?? "—"}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  <StatusBadge t={t} status={activity.completionStatus} />
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  <CertificateCell
                    t={t}
                    activity={activity}
                    onDownload={onDownload}
                  />
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  <RowActions
                    t={t}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    activity={activity}
                    isDeleting={isDeleting}
                    deletingActivityId={deletingActivityId}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-4 lg:hidden">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="rounded-[1.5rem] border border-glass-border bg-background/40 p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium">{activity.title}</p>
              <StatusBadge t={t} status={activity.completionStatus} />
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">
                  {t(`${TRACKER}.table.type`)}
                </dt>
                <dd>{t(`${TRACKER}.activityTypes.${activity.source}`)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">
                  {t(`${TRACKER}.table.dateCompleted`)}
                </dt>
                <dd>{formatDate(activity.date)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">
                  {t(`${TRACKER}.table.creditValue`)}
                </dt>
                <dd>
                  {Number(activity.pdus ?? 0).toFixed(1)}{" "}
                  {t(`${TRACKER}.creditTypes.${activity.creditType}`)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">
                  {t(`${TRACKER}.table.reportingYear`)}
                </dt>
                <dd>{activity.reportingYear ?? "—"}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs text-muted-foreground">
                  {t(`${TRACKER}.table.provider`)}
                </dt>
                <dd>{activity.providerOrganizer ?? "—"}</dd>
              </div>
            </dl>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <CertificateCell
                t={t}
                activity={activity}
                onDownload={onDownload}
              />
              <RowActions
                t={t}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                activity={activity}
                isDeleting={isDeleting}
                deletingActivityId={deletingActivityId}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
