"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@ui/avatar";
import { UseProfessionalProfileTabReturn } from "@/hooks/useProfessionalProfileTab";
import { FloatingTextareaField } from "@elements/floating-textarea";
import { FloatingInputField } from "@elements/floating-input";
import { getInitials } from "@/utils/function-helper";
import { LucideIcon } from "lucide-react";
import { Button } from "@ui/button";

import * as R from "lucide-react";
import * as F from "@ui/form";

type TProfessionalProfileSettingsPanelProps = {
  icon: LucideIcon;
  hook: UseProfessionalProfileTabReturn;
};

export const ProfessionalProfileSettingsPanel = ({
  icon: Icon,
  hook,
}: TProfessionalProfileSettingsPanelProps) => {
  const {
    t,
    profile,
    profileRhf,
    profileValues,
    isSaveDisabled,
    handleSaveProfile,
    handleRemoveAvatar,
  } = hook;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-medium">
            {t("professionalDashboard.settings.profile.title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("professionalDashboard.settings.profile.description")}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-4 rounded-3xl border border-glass-border bg-background/45 p-5 sm:flex-row sm:items-center">
        <Avatar className="h-20 w-20 border border-primary/20">
          {profileValues.avatarUrl ? (
            <AvatarImage src={profileValues.avatarUrl} />
          ) : null}
          <AvatarFallback className="bg-primary/10 text-lg font-medium text-primary">
            {getInitials(profileValues.fullName, profile?.email)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <p className="font-medium">
            {profileValues.fullName || profile?.email || "-"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("professionalDashboard.settings.profile.nameHint")}
          </p>
        </div>
        <Button
          radius="xl"
          type="button"
          variant="glass"
          onClick={handleRemoveAvatar}
          disabled={!profileValues.avatarUrl}
        >
          {t("professionalDashboard.settings.profile.removePhoto")}
        </Button>
      </div>

      <F.Form {...profileRhf}>
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <FloatingInputField
              name="fullName"
              control={profileRhf.control}
              label={t("professionalDashboard.settings.profile.fullName")}
              description={t(
                "professionalDashboard.settings.profile.fullNameHint",
              )}
              autoComplete="name"
              leftIcon={<R.UserRound className="h-4 w-4" />}
            />
            <FloatingInputField
              name="phone"
              inputMode="tel"
              autoComplete="tel"
              control={profileRhf.control}
              leftIcon={<R.Phone className="h-4 w-4" />}
              label={t("professionalDashboard.settings.profile.phone")}
            />

            <FloatingInputField
              name="location"
              control={profileRhf.control}
              autoComplete="address-level2"
              leftIcon={<R.MapPin className="h-4 w-4" />}
              label={t("professionalDashboard.settings.profile.location")}
            />

            <FloatingInputField
              type="url"
              name="website"
              autoComplete="url"
              control={profileRhf.control}
              leftIcon={<R.Link2 className="h-4 w-4" />}
              label={t("professionalDashboard.settings.profile.website")}
            />

            <FloatingInputField
              name="education"
              autoComplete="off"
              control={profileRhf.control}
              leftIcon={<R.GraduationCap className="h-4 w-4" />}
              label={t("professionalDashboard.settings.profile.education")}
            />

            <FloatingInputField
              name="occupation"
              control={profileRhf.control}
              autoComplete="organization-title"
              leftIcon={<R.BriefcaseBusiness className="h-4 w-4" />}
              label={t("professionalDashboard.settings.profile.occupation")}
            />

            <FloatingInputField
              type="url"
              name="avatarUrl"
              autoComplete="url"
              className="md:col-span-2"
              control={profileRhf.control}
              leftIcon={<R.ImageIcon className="h-4 w-4" />}
              label={t("professionalDashboard.settings.profile.avatarUrl")}
            />

            <FloatingTextareaField
              name="bio"
              className="md:col-span-2"
              textareaClassName="min-h-32"
              control={profileRhf.control}
              leftIcon={<R.FileText className="h-4 w-4" />}
              label={t("professionalDashboard.settings.profile.bio")}
            />
          </div>

          <div className="rounded-3xl bg-primary/5 p-4 text-sm text-muted-foreground">
            {t("professionalDashboard.settings.profile.note")}
          </div>

          <Button
            radius="xl"
            type="submit"
            variant="brand"
            disabled={isSaveDisabled}
          >
            {t("professionalDashboard.settings.profile.save")}
          </Button>
        </form>
      </F.Form>
    </div>
  );
};
