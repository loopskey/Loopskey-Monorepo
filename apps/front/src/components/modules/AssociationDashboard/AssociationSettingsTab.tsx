"use client";

import { AssociationThresholdDialog } from "@modules/AssociationDashboard/parts/association-threshold-dialog";
import { AssociationSettingsSection } from "@modules/AssociationDashboard/parts/association-settings-section";
import { useAssociationSettingsTab } from "@hooks/useAssociationSettingsTab";
import { FloatingTextareaField } from "@elements/floating-textarea";
import { AssociationLogoField } from "@modules/AssociationDashboard/parts/association-logo-field";
import { FloatingSelectField } from "@elements/floating-select";
import { FloatingInputField } from "@elements/floating-input";
import { GlassCard } from "@elements/glass-card";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";
import { Switch } from "@ui/switch";
import { Badge } from "@ui/badge";

import Link from "next/link";

import * as S from "@utils/association-settings";
import * as F from "@ui/form";
import * as L from "lucide-react";

const AssociationSettingsTab = () => {
  const hook = useAssociationSettingsTab();

  const {
    t,
    label,
    retry,
    isError,
    settings,
    isLoading,
    association,
    profileForm,
    saveProfile,
    complianceForm,
    reviewCompliance,
    notificationForm,
    saveNotifications,
    isSavingProfile,
    isSavingCompliance,
    isSavingNotifications,
  } = hook;

  const creditTypeOptions = S.ASSOCIATION_CREDIT_TYPES.map((value) => ({
    value,
    label: label(`compliance.creditTypes.${value}`),
  }));

  const switches = [
    { key: "complianceReminders" as const, isMaster: false },
    { key: "welcomeMessages" as const, isMaster: false },
    { key: "weeklyDigest" as const, isMaster: false },
  ];

  const suppressAll = notificationForm.watch("suppressAllEmail");

  const header = (
    <section>
      <p className="text-sm font-medium text-primary">
        {t("associationDashboard.eyebrow")}
      </p>

      <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
        {label("title")}
      </h1>

      <p className="mt-2 max-w-3xl text-muted-foreground">
        {label("description")}
      </p>
    </section>
  );

  if (isError)
    return (
      <div className="space-y-6">
        {header}

        <GlassCard glow={false}>
          <div className="relative z-10 flex flex-col items-start gap-3">
            <p role="alert" className="text-sm text-muted-foreground">
              <L.TriangleAlert className="mr-2 inline h-4 w-4 text-destructive" />
              {label("errors.loadFailed")}
            </p>

            <Button size="sm" radius="xl" variant="glass" onClick={retry}>
              <L.RotateCcw className="h-4 w-4" />
              {label("retry")}
            </Button>
          </div>
        </GlassCard>
      </div>
    );

  if (isLoading || !settings || !association)
    return (
      <div className="space-y-6">
        {header}

        {[0, 1, 2].map((row) => (
          <GlassCard key={row} glow={false}>
            <div className="relative z-10">
              <Skeleton className="h-48 w-full rounded-2xl" />
            </div>
          </GlassCard>
        ))}
      </div>
    );

  return (
    <div className="space-y-6">
      {header}

      <F.Form {...profileForm}>
        <AssociationSettingsSection
          onSave={saveProfile}
          isSaving={isSavingProfile}
          title={label("profile.title")}
          saveLabel={label("profile.save")}
          description={label("profile.description")}
        >
          <div className="grid gap-5 md:grid-cols-2">
            <FloatingInputField
              name="name"
              control={profileForm.control}
              label={label("profile.name")}
            />

            <FloatingInputField
              name="country"
              control={profileForm.control}
              label={label("profile.country")}
            />

            <FloatingInputField
              name="website"
              control={profileForm.control}
              label={label("profile.website")}
            />

            <FloatingInputField
              type="email"
              name="contactEmail"
              control={profileForm.control}
              label={label("profile.contactEmail")}
              description={label("profile.contactEmailHint")}
            />
          </div>

          <FloatingTextareaField
            name="description"
            control={profileForm.control}
            label={label("profile.descriptionField")}
          />
        </AssociationSettingsSection>
      </F.Form>

      <AssociationSettingsSection
        title={label("branding.title")}
        description={label("branding.description")}
      >
        <AssociationLogoField hook={hook} />
      </AssociationSettingsSection>

      <F.Form {...complianceForm}>
        <AssociationSettingsSection
          onSave={reviewCompliance}
          isSaving={isSavingCompliance}
          title={label("compliance.title")}
          saveLabel={label("compliance.review")}
          description={label("compliance.description")}
        >
          <div className="grid gap-5 md:grid-cols-2">
            <FloatingSelectField
              name="defaultCreditType"
              options={creditTypeOptions}
              control={complianceForm.control}
              label={label("compliance.defaultCreditType")}
              description={label("compliance.defaultCreditTypeHint")}
            />

            <div />

            <FloatingInputField
              type="number"
              name="onTrackThreshold"
              min={S.THRESHOLD_MIN}
              max={S.THRESHOLD_MAX}
              control={complianceForm.control}
              label={label("compliance.onTrackThreshold")}
              description={label("compliance.onTrackThresholdHint")}
            />

            <FloatingInputField
              type="number"
              name="atRiskThreshold"
              min={S.THRESHOLD_MIN}
              max={S.THRESHOLD_MAX}
              control={complianceForm.control}
              label={label("compliance.atRiskThreshold")}
              description={label("compliance.atRiskThresholdHint")}
            />
          </div>

          <F.FormField
            control={complianceForm.control}
            name="renewalRequiresReviewedEvidence"
            render={({ field }) => (
              <F.FormItem className="flex items-start justify-between gap-4 rounded-2xl border border-glass-border bg-background/50 p-4">
                <div>
                  <F.FormLabel className="font-medium">
                    {label("compliance.renewalRequiresReviewedEvidence")}
                  </F.FormLabel>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {label("compliance.renewalRequiresReviewedEvidenceHint")}
                  </p>
                </div>

                <F.FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-label={label(
                      "compliance.renewalRequiresReviewedEvidence",
                    )}
                  />
                </F.FormControl>
              </F.FormItem>
            )}
          />
        </AssociationSettingsSection>
      </F.Form>

      <F.Form {...notificationForm}>
        <AssociationSettingsSection
          onSave={saveNotifications}
          isSaving={isSavingNotifications}
          title={label("notifications.title")}
          saveLabel={label("notifications.save")}
          description={label("notifications.description")}
        >
          <F.FormField
            control={notificationForm.control}
            name="suppressAllEmail"
            render={({ field }) => (
              <F.FormItem className="flex items-start justify-between gap-4 rounded-2xl border border-glass-border bg-destructive/5 p-4">
                <div>
                  <F.FormLabel className="font-medium">
                    {label("notifications.suppressAllEmail")}
                  </F.FormLabel>

                  <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                    {label("notifications.suppressAllEmailHint")}
                  </p>
                </div>

                <F.FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-label={label("notifications.suppressAllEmail")}
                  />
                </F.FormControl>
              </F.FormItem>
            )}
          />

          {suppressAll && (
            <p className="rounded-2xl border border-glass-border bg-background/50 p-4 text-sm text-muted-foreground">
              <L.Info className="mr-2 inline h-4 w-4 text-primary" />
              {label("notifications.suppressAllActive")}
            </p>
          )}

          {switches.map((item) => (
            <F.FormField
              key={item.key}
              control={notificationForm.control}
              name={item.key}
              render={({ field }) => (
                <F.FormItem className="flex items-start justify-between gap-4 rounded-2xl border border-glass-border bg-background/50 p-4">
                  <div>
                    <F.FormLabel className="font-medium">
                      {label(`notifications.${item.key}`)}
                    </F.FormLabel>

                    <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                      {label(`notifications.${item.key}Hint`)}
                    </p>
                  </div>

                  <F.FormControl>
                    <Switch
                      disabled={suppressAll}
                      checked={field.value && !suppressAll}
                      onCheckedChange={field.onChange}
                      aria-label={label(`notifications.${item.key}`)}
                    />
                  </F.FormControl>
                </F.FormItem>
              )}
            />
          ))}
        </AssociationSettingsSection>
      </F.Form>

      <AssociationSettingsSection
        title={label("account.title")}
        description={label("account.description")}
      >
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-muted-foreground">
              {label("account.email")}
            </dt>
            <dd className="mt-1 font-medium">
              {association.ownerEmail ?? "—"}
            </dd>
          </div>

          <div>
            <dt className="text-sm text-muted-foreground">
              {label("account.status")}
            </dt>
            <dd className="mt-1">
              <Badge variant="secondary">{association.ownerStatus}</Badge>
            </dd>
          </div>
        </dl>

        <div className="flex flex-wrap gap-3">
          <Button radius="xl" variant="glass" asChild>
            <Link href="/dashboard/profile">
              <L.KeyRound className="h-4 w-4" />
              {label("account.changePassword")}
            </Link>
          </Button>

          <Button radius="xl" variant="glass" asChild>
            <Link href="/dashboard/profile">
              <L.AtSign className="h-4 w-4" />
              {label("account.changeEmail")}
            </Link>
          </Button>
        </div>
      </AssociationSettingsSection>

      <AssociationThresholdDialog hook={hook} />
    </div>
  );
};

export default AssociationSettingsTab;
