"use client";

import { TAssociationLearningPublishDialog } from "@/types/association-dashboard.types";
import { AssociationAudienceKind } from "@/lib/graphql/base";
import { Button } from "@ui/button";

import * as S from "@ui/select";
import * as D from "@ui/dialog";
import * as L from "lucide-react";

export const AssociationLearningPublishDialog = ({
  hook,
}: TAssociationLearningPublishDialog) => {
  const {
    t,
    groupOptions,
    publishingId,
    closePublish,
    isPublishing,
    publishGroupId,
    confirmPublish,
    publishAudience,
    setPublishGroupId,
    setPublishAudience,
  } = hook;

  const label = (key: string) =>
    t(`associationDashboard.learningContent.publish.${key}`);

  const isGroup = publishAudience === AssociationAudienceKind.Group;

  return (
    <D.Dialog
      open={Boolean(publishingId)}
      onOpenChange={(open) => {
        if (!open) closePublish();
      }}
    >
      <D.DialogContent className="glass-dialog z-[9999] max-w-lg rounded-3xl border-glass-border">
        <D.DialogHeader>
          <D.DialogTitle className="text-xl">{label("title")}</D.DialogTitle>

          <D.DialogDescription className="leading-6">
            {label("description")}
          </D.DialogDescription>
        </D.DialogHeader>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="association-library-audience"
              className="text-xs uppercase text-muted-foreground"
            >
              {label("audience")}
            </label>

            <S.Select
              value={publishAudience}
              onValueChange={setPublishAudience}
            >
              <S.SelectTrigger
                id="association-library-audience"
                className="mt-1 rounded-2xl"
              >
                <S.SelectValue />
              </S.SelectTrigger>

              <S.SelectContent className="z-[9999] rounded-2xl">
                <S.SelectItem value={AssociationAudienceKind.AllMembers}>
                  {label("allMembers")}
                </S.SelectItem>
                <S.SelectItem value={AssociationAudienceKind.Group}>
                  {label("oneGroup")}
                </S.SelectItem>
              </S.SelectContent>
            </S.Select>
          </div>

          {isGroup && (
            <div>
              <label
                htmlFor="association-library-group"
                className="text-xs uppercase text-muted-foreground"
              >
                {label("group")}
              </label>

              <S.Select
                value={publishGroupId}
                onValueChange={setPublishGroupId}
              >
                <S.SelectTrigger
                  id="association-library-group"
                  className="mt-1 rounded-2xl"
                >
                  <S.SelectValue placeholder={label("groupPlaceholder")} />
                </S.SelectTrigger>

                <S.SelectContent className="z-[9999] rounded-2xl">
                  {groupOptions.map((option) => (
                    <S.SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </S.SelectItem>
                  ))}
                </S.SelectContent>
              </S.Select>
            </div>
          )}
        </div>

        <D.DialogFooter>
          <Button
            radius="xl"
            type="button"
            variant="cancel"
            disabled={isPublishing}
            onClick={closePublish}
          >
            {t("associationDashboard.members.confirm.cancel")}
          </Button>

          <Button
            radius="xl"
            type="button"
            variant="brand"
            onClick={() => void confirmPublish()}
            disabled={isPublishing || (isGroup && !publishGroupId)}
          >
            {isPublishing && <L.Loader2 className="h-4 w-4 animate-spin" />}
            {label("confirm")}
          </Button>
        </D.DialogFooter>
      </D.DialogContent>
    </D.Dialog>
  );
};
