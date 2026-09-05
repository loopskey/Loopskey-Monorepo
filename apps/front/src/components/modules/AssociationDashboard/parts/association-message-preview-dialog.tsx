"use client";

import { TAssociationMessagePreviewDialog } from "@/types/association-dashboard.types";
import { skipToken } from "@reduxjs/toolkit/query";
import { useEffect, useRef } from "react";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";

import * as API from "@lib/rtk/endpoints/association-dashboard.api";
import * as DIALOG from "@ui/dialog";
import * as M from "@utils/association-messages";
import * as L from "lucide-react";

export const AssociationMessagePreviewDialog = ({
  hook,
}: TAssociationMessagePreviewDialog) => {
  const {
    t,
    locale,
    send,
    isSending,
    openSection,
    setOpenSection,
    audienceFor,
  } = hook;

  const label = (key: string, vars?: Record<string, string | number>) =>
    t(`associationDashboard.messages.${key}`, vars);

  const isOpen = Boolean(openSection && M.isActionableSection(openSection));

  const openedBy = useRef<M.TAttentionSection | null>(null);

  useEffect(() => {
    if (openSection) openedBy.current = openSection;
  }, [openSection]);

  const previewQuery = API.useAssociationMessagePreviewQuery(
    openSection && M.isActionableSection(openSection)
      ? {
          messageType: M.MESSAGE_TYPE_OF[openSection],
          audience: audienceFor(openSection),
        }
      : skipToken,
  );

  const preview = previewQuery.data ?? null;
  const canSend = (preview?.recipientCount ?? 0) > 0;

  return (
    <DIALOG.Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) setOpenSection(null);
      }}
    >
      <DIALOG.DialogContent
        className="glass-dialog max-h-[85vh] overflow-y-auto border-glass-border sm:max-w-2xl"
        onCloseAutoFocus={(event) => {
          const section = openedBy.current;
          if (!section) return;

          const trigger = document.getElementById(
            M.sectionSendButtonId(section),
          );

          if (!trigger) return;

          event.preventDefault();
          trigger.focus();
        }}
      >
        <DIALOG.DialogHeader>
          <DIALOG.DialogTitle>
            {openSection
              ? label(`sections.${openSection}.title`)
              : label("preview.title")}
          </DIALOG.DialogTitle>

          <DIALOG.DialogDescription>
            {label("preview.description")}
          </DIALOG.DialogDescription>
        </DIALOG.DialogHeader>

        {previewQuery.isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-2/3 rounded-xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        ) : previewQuery.isError ? (
          <p className="text-sm text-destructive">{label("preview.error")}</p>
        ) : (
          <div className="space-y-4">
            <dl className="grid gap-3 rounded-2xl border border-glass-border bg-background/50 p-4 sm:grid-cols-3">
              <div>
                <dt className="text-xs uppercase text-muted-foreground">
                  {label("preview.recipients")}
                </dt>
                <dd className="mt-1 text-xl font-medium tabular-nums">
                  {(preview?.recipientCount ?? 0).toLocaleString(locale)}
                </dd>
              </div>

              <div>
                <dt className="text-xs uppercase text-muted-foreground">
                  {label("preview.skipped")}
                </dt>
                <dd className="mt-1 text-xl font-medium tabular-nums">
                  {(preview?.skippedCount ?? 0).toLocaleString(locale)}
                </dd>
              </div>

              <div>
                <dt className="text-xs uppercase text-muted-foreground">
                  {label("preview.language")}
                </dt>
                <dd className="mt-1 text-xl font-medium">
                  {preview?.language ?? t("associationDashboard.reports.table.none")}
                </dd>
              </div>
            </dl>

            {canSend ? (
              <section aria-labelledby="association-message-body">
                <h3
                  id="association-message-body"
                  className="text-xs uppercase text-muted-foreground"
                >
                  {label("preview.asSeenBy", {
                    name:
                      preview?.recipientName ??
                      t("associationDashboard.reports.table.none"),
                  })}
                </h3>

                <p className="mt-2 font-medium">{preview?.subject}</p>

                <p className="mt-2 whitespace-pre-line rounded-2xl border border-glass-border bg-background/50 p-4 text-sm leading-relaxed">
                  {preview?.body}
                </p>

                <p className="mt-2 text-xs text-muted-foreground">
                  {label("preview.fixedCopy")}
                </p>
              </section>
            ) : (
              <p className="rounded-2xl border border-glass-border bg-background/50 p-4 text-sm text-muted-foreground">
                {label("preview.nobody")}
              </p>
            )}

            {(preview?.skipped.length ?? 0) > 0 && (
              <section>
                <h3 className="text-xs uppercase text-muted-foreground">
                  {label("preview.skippedTitle")}
                </h3>

                <ul className="mt-2 space-y-1 text-sm">
                  {preview?.skipped.map((skip) => (
                    <li key={skip.memberId} className="text-muted-foreground">
                      {skip.fullName ?? skip.memberId} —{" "}
                      {label(`skipReasons.${skip.reason}`)}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}

        <DIALOG.DialogFooter>
          <Button
            radius="xl"
            type="button"
            variant="glass"
            onClick={() => setOpenSection(null)}
          >
            {label("preview.cancel")}
          </Button>

          <Button
            radius="xl"
            type="button"
            variant="brand"
            disabled={!canSend || isSending}
            onClick={() => openSection && void send(openSection)}
          >
            {isSending ? (
              <L.Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <L.Send className="h-4 w-4" />
            )}
            {label("preview.confirm", {
              count: (preview?.recipientCount ?? 0).toLocaleString(locale),
            })}
          </Button>
        </DIALOG.DialogFooter>
      </DIALOG.DialogContent>
    </DIALOG.Dialog>
  );
};
