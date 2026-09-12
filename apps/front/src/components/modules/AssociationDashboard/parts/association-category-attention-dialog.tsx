"use client";

import { TAssociationCategoryAttentionDialog } from "@/types/association-dashboard.types";
import { AssociationAttentionSection } from "@/lib/graphql/base";
import { ContentPagination } from "@elements/pagination";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import * as REPORTS from "@utils/association-reports";
import * as DIALOG from "@ui/dialog";
import * as API from "@lib/rtk/endpoints/association-dashboard.api";
import * as L from "lucide-react";

const PAGE_SIZE = 10;

export const AssociationCategoryAttentionDialog = ({
  hook,
}: TAssociationCategoryAttentionDialog) => {
  const router = useRouter();
  const { t, locale, viewingSection, closeDetails } = hook;

  const label = (key: string, vars?: Record<string, string | number>) =>
    t(`associationDashboard.messages.${key}`, vars);

  const none = t("associationDashboard.reports.table.none");

  const isOpen = viewingSection === AssociationAttentionSection.CategoryBehind;

  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const cursor = cursorStack.at(-1) ?? null;

  const query = API.useAssociationCategoryAttentionGroupsQuery(
    { pagination: { take: PAGE_SIZE, cursor } },
    { skip: !isOpen },
  );

  const groups = query.data?.items ?? [];
  const totalCount = query.data?.totalCount ?? 0;
  const hasNextPage = query.data?.pageInfo?.hasNextPage ?? false;
  const page = cursorStack.length + 1;

  const close = () => {
    setCursorStack([]);
    closeDetails();
  };

  return (
    <DIALOG.Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <DIALOG.DialogContent className="glass-dialog max-h-[85vh] overflow-y-auto border-border sm:max-w-3xl">
        <DIALOG.DialogHeader>
          <DIALOG.DialogTitle>
            {label("detail.title", {
              title: label("sections.CATEGORY_BEHIND.title"),
            })}
          </DIALOG.DialogTitle>
          <DIALOG.DialogDescription>
            {label("sections.CATEGORY_BEHIND.description")}
          </DIALOG.DialogDescription>
        </DIALOG.DialogHeader>

        {query.isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full rounded-md" />
            <Skeleton className="h-24 w-full rounded-md" />
          </div>
        ) : groups.length === 0 ? (
          <p className="rounded-md border p-4 text-sm text-muted-foreground">
            {label("detail.empty")}
          </p>
        ) : (
          <ul className="space-y-4">
            {groups.map((group) => (
              <li
                key={`${group.requirementId}:${group.categoryId}`}
                className="rounded-lg border p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{group.categoryName}</p>
                    <p className="text-xs text-muted-foreground">
                      {group.requirementName}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {group.deadline && (
                      <Badge variant="outline">
                        {label("detail.deadline", {
                          when: REPORTS.formatReportDate(
                            group.deadline,
                            locale,
                            none,
                          ),
                        })}
                      </Badge>
                    )}
                    <Badge variant="secondary">
                      {label("detail.affected", { count: group.affectedCount })}
                    </Badge>
                  </div>
                </div>

                <ul className="mt-3 space-y-2">
                  {group.members.map((member) => (
                    <li
                      key={member.memberId}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {member.fullName ?? member.email ?? none}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {label("detail.reason", {
                            completed: (
                              member.completedCredits ?? 0
                            ).toLocaleString(locale),
                            required: (
                              member.requiredCredits ?? 0
                            ).toLocaleString(locale),
                          })}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        radius="xl"
                        type="button"
                        variant="outline"
                        onClick={() =>
                          router.push(
                            `/dashboard/association?tab=members&memberId=${member.memberId}`,
                          )
                        }
                      >
                        <L.UserSearch className="h-4 w-4" />
                        {label("detail.viewMember")}
                      </Button>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}

        <ContentPagination
          page={page}
          totalCount={totalCount}
          isLoading={query.isFetching}
          canPrevious={page > 1}
          hasNextPage={hasNextPage}
          onNext={() => {
            const nextCursor = query.data?.pageInfo?.nextCursor;
            if (nextCursor)
              setCursorStack((current) => [...current, nextCursor]);
          }}
          onPrevious={() => setCursorStack((current) => current.slice(0, -1))}
        />

        <DIALOG.DialogFooter>
          <Button radius="xl" type="button" variant="outline" onClick={close}>
            <L.X className="h-4 w-4" />
            {label("detail.close")}
          </Button>
        </DIALOG.DialogFooter>
      </DIALOG.DialogContent>
    </DIALOG.Dialog>
  );
};
