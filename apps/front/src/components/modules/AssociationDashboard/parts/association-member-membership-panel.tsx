"use client";

import { TAssociationMemberMembershipPanel } from "@/types/association-dashboard.types";
import { GlassCard } from "@elements/glass-card";

export const AssociationMemberMembershipPanel = ({
  hook,
}: TAssociationMemberMembershipPanel) => {
  const { t, member, locale, memberSince, lastNotifiedAt } = hook;

  const date = (value: string | null | undefined) =>
    value ? new Date(value).toLocaleDateString(locale) : "-";

  const rows = [
    {
      label: t("associationDashboard.memberDetail.membership.group"),
      value:
        member?.group?.title ??
        t("associationDashboard.memberDetail.membership.noGroup"),
    },
    {
      label: t("associationDashboard.memberDetail.membership.memberSince"),
      value: date(memberSince as string | null),
    },
    {
      label: t("associationDashboard.memberDetail.membership.lastLogin"),
      value: member?.lastLoginAt
        ? date(member.lastLoginAt as string)
        : t("associationDashboard.memberDetail.membership.never"),
    },
    {
      label: t("associationDashboard.memberDetail.membership.joinedVia"),
      value: member?.joinedVia
        ? t(
            `associationDashboard.memberDetail.membership.joinedViaValues.${member.joinedVia}`,
          )
        : "-",
    },
    {
      label: t(
        "associationDashboard.memberDetail.membership.lastNotification",
      ),
      value: lastNotifiedAt
        ? date(lastNotifiedAt as string)
        : t("associationDashboard.memberDetail.membership.never"),
    },
  ];

  return (
    <GlassCard>
      <div className="relative z-10">
        <h2 className="text-xl font-medium">
          {t("associationDashboard.memberDetail.membership.title")}
        </h2>

        <dl className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((row) => (
            <div key={row.label}>
              <dt className="text-xs uppercase text-muted-foreground">
                {row.label}
              </dt>
              <dd className="mt-1 text-sm">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </GlassCard>
  );
};
