import { TOrgSettingspanel } from "@/types/admin-dashboard.types";
import { ComplianceCycle } from "@/lib/graphql/generated";
import { GlassCard } from "@elements/glass-card";
import { useState } from "react";
import { Switch } from "@ui/switch";
import { Button } from "@ui/button";
import { Input } from "@ui/input";

import * as S from "@ui/select";

type TBooleanSettingKey =
  | "weeklySummaryReport"
  | "complianceAlerts"
  | "assignmentNotifications";

const booleanSettings: {
  key: TBooleanSettingKey;
  label: string;
}[] = [
  { key: "weeklySummaryReport", label: "weeklySummary" },
  { key: "complianceAlerts", label: "complianceAlerts" },
  { key: "assignmentNotifications", label: "assignmentAlerts" },
];

export const OrganizationSettingsPanel = ({
  t,
  org,
  onSave,
  isLoading,
}: TOrgSettingspanel) => {
  const settings = org.settings;

  const [form, setForm] = useState({
    minimumPdu: String(settings?.minimumPdu ?? 30),
    complianceAlerts: Boolean(settings?.complianceAlerts),
    strictCompliance: Boolean(settings?.strictCompliance),
    weeklySummaryReport: Boolean(settings?.weeklySummaryReport),
    assignmentNotifications: Boolean(settings?.assignmentNotifications),
    complianceCycle: settings?.complianceCycle ?? ComplianceCycle.Annual,
  });

  const handleSave = () => {
    const minimumPdu = Number(form.minimumPdu || 0);
    const input = {
      minimumPdu,
      organizationId: org.id,
      complianceCycle: form.complianceCycle,
      complianceAlerts: form.complianceAlerts,
      strictCompliance: form.strictCompliance,
      weeklySummaryReport: form.weeklySummaryReport,
      assignmentNotifications: form.assignmentNotifications,
    };
    onSave(input);
  };
  return (
    <div className="grid gap-5">
      <GlassCard glow={false} className="p-5">
        <h3 className="font-medium">
          {t("adminDashboard.organizationUsers.settings.complianceRules")}
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          {t("adminDashboard.organizationUsers.settings.complianceDescription")}
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Input
            type="number"
            value={form.minimumPdu}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                minimumPdu: event.target.value,
              }))
            }
          />

          <S.Select
            value={form.complianceCycle}
            onValueChange={(value) =>
              setForm((prev) => ({
                ...prev,
                complianceCycle: value as ComplianceCycle,
              }))
            }
          >
            <S.SelectTrigger className="rounded-2xl">
              <S.SelectValue />
            </S.SelectTrigger>
            <S.SelectContent>
              {Object.values(ComplianceCycle).map((cycle) => (
                <S.SelectItem key={cycle} value={cycle}>
                  {cycle}
                </S.SelectItem>
              ))}
            </S.SelectContent>
          </S.Select>
        </div>

        <div className="mt-5 flex items-center justify-between rounded-2xl bg-background/45 p-4">
          <div>
            <p className="font-medium">
              {t("adminDashboard.organizationUsers.settings.strictCompliance")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t(
                "adminDashboard.organizationUsers.settings.strictComplianceHint",
              )}
            </p>
          </div>
          <Switch
            checked={form.strictCompliance}
            onCheckedChange={(value) =>
              setForm((prev) => ({ ...prev, strictCompliance: value }))
            }
          />
        </div>
      </GlassCard>

      <GlassCard glow={false} className="p-5">
        <h3 className="font-medium">
          {t("adminDashboard.organizationUsers.settings.notifications")}
        </h3>

        {booleanSettings.map((item) => (
          <div
            key={item.key}
            className="mt-4 flex items-center justify-between rounded-2xl bg-background/45 p-4"
          >
            <p className="font-medium">
              {t(`adminDashboard.organizationUsers.settings.${item.label}`)}
            </p>

            <Switch
              checked={form[item.key]}
              onCheckedChange={(value) =>
                setForm((prev) => ({ ...prev, [item.key]: value }))
              }
            />
          </div>
        ))}
      </GlassCard>

      <Button
        radius="xl"
        disabled={isLoading}
        onClick={handleSave}
        variant="brandOutline"
      >
        {t("common.save")}
      </Button>
    </div>
  );
};
