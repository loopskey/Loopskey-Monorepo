"use client";

import { TAssignedContentDetailDialogProps } from "@/types/content-module.types";
import { getContentTypeStyle } from "@/utils/content-type-style";
import { ExternalLink } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";

import * as D from "@ui/dialog";

const KEY = "cpdProgress.assignedContentDetail";
const CATEGORY_KEY = "professionalDashboard.cpdPduTracker.categories";

export const AssignedContentDetailDialog = ({
  open,
  item,
  onOpenChange,
}: TAssignedContentDetailDialogProps) => {
  const { t } = useI18n();

  if (!item) return null;

  const style = getContentTypeStyle(item.contentType);

  const facts: { label: string; value: string }[] = [
    { label: t(`${KEY}.provider`), value: item.provider || "—" },
    { label: t(`${KEY}.type`), value: t(style.labelKey) },
    ...(item.indicativeCredits
      ? [
          {
            label: t("cpdProgress.requirements.learning.credits", {
              credits: item.indicativeCredits,
            }),
            value: item.category
              ? t(`${CATEGORY_KEY}.${item.category}`)
              : "—",
          },
        ]
      : []),
  ];

  return (
    <D.Dialog open={open} onOpenChange={onOpenChange}>
      <D.DialogContent className="glass-dialog max-w-lg rounded-lg border-border">
        <D.DialogHeader>
          <D.DialogTitle>{item.title}</D.DialogTitle>
          <D.DialogDescription>{t(`${KEY}.description`)}</D.DialogDescription>
        </D.DialogHeader>

        {item.associationName && (
          <p className="text-sm text-primary">
            {t("cpdProgress.requirements.assignedBy", {
              association: item.associationName,
            })}
          </p>
        )}

        {item.description && (
          <p className="whitespace-pre-line text-sm text-muted-foreground">
            {item.description}
          </p>
        )}

        <dl className="grid gap-3 rounded-md border p-4 sm:grid-cols-2">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className="text-xs font-medium text-muted-foreground">
                {fact.label}
              </dt>
              <dd className="mt-1 truncate text-sm font-medium">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>

        {item.requirementLabel && (
          <p className="text-xs text-muted-foreground">
            {t(`${KEY}.requirement`, { requirement: item.requirementLabel })}
          </p>
        )}

        {item.externalUrl && (
          <p className="text-xs text-muted-foreground">
            {t(`${KEY}.opensExternally`)}
          </p>
        )}

        <D.DialogFooter>
          <Button
            radius="xl"
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t("common.cancel")}
          </Button>

          {item.externalUrl && (
            <Button asChild radius="xl">
              <a
                href={item.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onOpenChange(false)}
              >
                <ExternalLink className="h-4 w-4" />
                {t(`${KEY}.openLink`)}
              </a>
            </Button>
          )}
        </D.DialogFooter>
      </D.DialogContent>
    </D.Dialog>
  );
};

export default AssignedContentDetailDialog;
