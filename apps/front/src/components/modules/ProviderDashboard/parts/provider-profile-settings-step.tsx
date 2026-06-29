"use client";

import { AtSign, Link2, Mail, UserRound } from "lucide-react";
import { useProviderProfileSettingsStep } from "@/hooks/useProviderProfileSettingsStep";
import { Building2, FileText } from "lucide-react";
import { FloatingInputField } from "@elements/floating-input";
import { Textarea } from "@ui/textarea";
import { Button } from "@ui/button";
import { Label } from "@ui/label";

import * as F from "@ui/form";

type Props = {
  hook: ReturnType<
    typeof import("@/hooks/useProviderSettingsTab").useProviderSettingsTab
  >;
};

export const ProviderProfileSettingsStep = ({ hook }: Props) => {
  const {
    t,
    isLoading,
    currentUser,
    profileForm,
    setProfileForm,
    saveProfileSettings,
  } = hook;

  type TProfileForm = typeof profileForm;

  const { form, watchedValues, updateTextareaField } =
    useProviderProfileSettingsStep({
      profileForm,
      setProfileForm,
    });

  return (
    <F.Form {...form}>
      <section className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            <Building2 className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-xl font-medium">
              {t("providerDashboard.settings.profile.title")}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {t("providerDashboard.settings.profile.description")}
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl border border-glass-border bg-background/45 p-5">
            <UserRound className="h-5 w-5 text-primary" />

            <p className="mt-3 text-sm text-muted-foreground">
              {t("providerDashboard.settings.profile.providerName")}
            </p>

            <p className="mt-1 font-medium">
              {currentUser?.fullName ?? t("common.notAvailable")}
            </p>
          </div>

          <div className="rounded-3xl border border-glass-border bg-background/45 p-5">
            <Mail className="h-5 w-5 text-primary" />

            <p className="mt-3 text-sm text-muted-foreground">
              {t("providerDashboard.settings.profile.accountEmail")}
            </p>

            <p className="mt-1 truncate font-medium">
              {currentUser?.email ?? t("common.notAvailable")}
            </p>
          </div>

          <div className="rounded-3xl border border-glass-border bg-background/45 p-5">
            <Building2 className="h-5 w-5 text-primary" />

            <p className="mt-3 text-sm text-muted-foreground">
              {t("providerDashboard.settings.profile.organization")}
            </p>

            <p className="mt-1 truncate font-medium">
              {watchedValues?.organizationName || t("common.notAvailable")}
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <FloatingInputField
            control={form.control}
            name="organizationName"
            label={t("providerDashboard.settings.profile.organizationName")}
            leftIcon={<Building2 className="h-4 w-4" />}
          />

          <FloatingInputField
            type="email"
            name="contactEmail"
            control={form.control}
            label={t("providerDashboard.settings.profile.contactEmail")}
            leftIcon={<AtSign className="h-4 w-4" />}
          />

          <FloatingInputField
            control={form.control}
            className="md:col-span-2"
            name="organizationProfile"
            leftIcon={<Link2 className="h-4 w-4" />}
            label={t("providerDashboard.settings.profile.organizationProfile")}
          />

          <div className="space-y-2 md:col-span-2">
            <Label>
              {t("providerDashboard.settings.profile.aboutOrganization")}
            </Label>

            <div className="relative">
              <FileText className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-muted-foreground" />

              <Textarea
                className="min-h-32 rounded-2xl border-border/70 bg-background/55 pl-11 pt-4 text-base shadow-sm backdrop-blur-xl transition-all duration-200 hover:border-primary/30 focus-visible:border-primary/55 focus-visible:ring-primary/25"
                value={watchedValues?.aboutOrganization ?? ""}
                onChange={(event) =>
                  updateTextareaField(
                    "aboutOrganization",
                    event.target.value as TProfileForm["aboutOrganization"],
                  )
                }
              />
            </div>
          </div>
        </div>

        <Button
          radius="xl"
          type="button"
          variant="brand"
          disabled={isLoading}
          onClick={saveProfileSettings}
        >
          {t("providerDashboard.settings.profile.save")}
        </Button>
      </section>
    </F.Form>
  );
};
