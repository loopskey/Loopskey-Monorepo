"use client";

import { BadgeCheck, Loader2, ShieldAlert } from "lucide-react";
import { TBasicProfilePanelProps } from "@/types/professional-profile.types";
import { SECURITY_SETTINGS_HREF } from "@/utils/professional-profile.constant";
import { ProfileAvatarUploader } from "@modules/ProfessionalDashboard/parts/profile-avatar-uploader";
import { FloatingSelectField } from "@elements/floating-select";
import { FloatingInputField } from "@elements/floating-input";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Label } from "@ui/label";

import Link from "next/link";

import * as R from "lucide-react";
import * as F from "@ui/form";

export const ProfileBasicPanel = ({
  hook,
  avatar,
  profile,
  isDisabled,
  icon: Icon,
}: TBasicProfilePanelProps) => {
  const {
    t,
    rhf,
    handleSubmit,
    isSaving,
    hasError,
    countryOptions,
    languageOptions,
    timeZoneOptions,
    isSaveDisabled,
  } = hook;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-medium">
            {t("professionalDashboard.profile.basic.title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("professionalDashboard.profile.basic.description")}
          </p>
        </div>
      </div>

      <ProfileAvatarUploader
        avatar={avatar}
        profile={profile}
        isDisabled={isDisabled}
      />

      <F.Form {...rhf}>
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <FloatingInputField
              name="fullName"
              autoComplete="name"
              disabled={isDisabled}
              control={rhf.control}
              leftIcon={<R.UserRound className="h-4 w-4" />}
              label={t("professionalDashboard.profile.basic.fullName")}
              description={t(
                "professionalDashboard.profile.basic.fullNameHint",
              )}
            />

            <div className="space-y-2">
              <Label htmlFor="professional-profile-email">
                {t("professionalDashboard.profile.basic.email")}
              </Label>
              <div className="relative">
                <R.Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  readOnly
                  type="email"
                  id="professional-profile-email"
                  value={profile?.email ?? ""}
                  aria-describedby="professional-profile-email-hint"
                  className="h-14 rounded-2xl border-border/70 bg-muted/40 pl-12 pr-4"
                />
              </div>
              <p
                id="professional-profile-email-hint"
                className="flex flex-wrap items-center gap-1.5 text-xs leading-5 text-muted-foreground"
              >
                {profile?.isEmailVerified ? (
                  <BadgeCheck
                    aria-hidden
                    className="h-3.5 w-3.5 text-emerald-500"
                  />
                ) : (
                  <ShieldAlert
                    aria-hidden
                    className="h-3.5 w-3.5 text-amber-500"
                  />
                )}
                {profile?.isEmailVerified
                  ? t("professionalDashboard.profile.basic.emailVerified")
                  : t("professionalDashboard.profile.basic.emailUnverified")}
                <Link
                  href={SECURITY_SETTINGS_HREF}
                  className="font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {t("professionalDashboard.profile.basic.changeEmail")}
                </Link>
              </p>
            </div>

            <FloatingInputField
              type="url"
              name="linkedInUrl"
              autoComplete="url"
              disabled={isDisabled}
              control={rhf.control}
              leftIcon={<R.Linkedin className="h-4 w-4" />}
              label={t("professionalDashboard.profile.basic.linkedInUrl")}
              description={t(
                "professionalDashboard.profile.basic.linkedInUrlHint",
              )}
            />

            <FloatingSelectField
              name="countryCode"
              disabled={isDisabled}
              control={rhf.control}
              options={countryOptions}
              label={t("professionalDashboard.profile.basic.country")}
              placeholder={t(
                "professionalDashboard.profile.basic.selectOption",
              )}
            />

            <FloatingSelectField
              name="language"
              disabled={isDisabled}
              control={rhf.control}
              options={languageOptions}
              label={t("professionalDashboard.profile.basic.language")}
              placeholder={t(
                "professionalDashboard.profile.basic.selectOption",
              )}
            />

            <FloatingSelectField
              name="timeZone"
              disabled={isDisabled}
              control={rhf.control}
              options={timeZoneOptions}
              label={t("professionalDashboard.profile.basic.timeZone")}
              placeholder={t(
                "professionalDashboard.profile.basic.selectOption",
              )}
            />
          </div>

          {hasError ? (
            <p role="alert" className="text-sm text-destructive">
              {t("professionalDashboard.profile.errors.saveFailed")}
            </p>
          ) : null}

          <Button
            radius="xl"
            type="submit"
            variant="brand"
            disabled={isSaveDisabled}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {t("professionalDashboard.profile.save")}
          </Button>
        </form>
      </F.Form>
    </div>
  );
};
