"use client";

import { useProfessionalBasicProfileForm } from "@/hooks/useProfessionalBasicProfileForm";
import { useProfessionalPreferencesForm } from "@/hooks/useProfessionalPreferencesForm";
import { useCallback, useMemo, useState } from "react";
import { useProfessionalCredentials } from "@/hooks/useProfessionalCredentials";
import { useProfessionalDetailsForm } from "@/hooks/useProfessionalDetailsForm";
import { useProfessionalSkillsForm } from "@/hooks/useProfessionalSkillsForm";
import { TProfessionalProfileTab } from "@/types/professional-profile.types";
import { useProfessionalAvatar } from "@/hooks/useProfessionalAvatar";
import { ProfileSectionKey } from "@/lib/graphql/generated";
import { useI18n } from "@/hooks/useI18n";

import * as PAPI from "@/lib/rtk/endpoints/professional.api";
import * as AAPI from "@/lib/rtk/endpoints/auth.api";
import * as C from "@/utils/professional-profile.constant";

export const useProfessionalProfileTab = () => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<TProfessionalProfileTab>("basic");

  const profileQuery = PAPI.useProfessionalDashboardProfileQuery();
  const { refetch: refetchCurrentUser } = AAPI.useCurrentUserQuery();

  const profile = profileQuery.data;

  const avatar = useProfessionalAvatar();
  const basicForm = useProfessionalBasicProfileForm(profile);
  const detailsForm = useProfessionalDetailsForm(profile);
  const skillsForm = useProfessionalSkillsForm(profile);
  const credentials = useProfessionalCredentials(profile);
  const preferencesForm = useProfessionalPreferencesForm(profile);

  const refreshProfile = useCallback(async () => {
    await Promise.all([profileQuery.refetch(), refetchCurrentUser()]);
  }, [profileQuery, refetchCurrentUser]);

  const completion = profile?.completion;

  /**
   * Completion always comes from persisted backend data, so the "Complete /
   * Incomplete" state never reacts to unsaved form values.
   */
  const sections = useMemo(
    () =>
      (completion?.sections ?? []).map((section) => {
        const tab = C.SECTION_TAB_MAP[section.key as ProfileSectionKey];
        return {
          tab,
          key: section.key,
          isComplete: section.isComplete,
          missingFields: section.missingFields,
          label: t(C.PROFILE_TAB_I18N_KEY[tab]),
        };
      }),
    [completion, t],
  );

  const tabs = useMemo(
    () =>
      C.PROFILE_TABS.map((value) => ({
        value,
        label: t(C.PROFILE_TAB_I18N_KEY[value]),
      })),
    [t],
  );

  const interestTags = profile?.favoriteSubjects ?? [];

  return {
    t,
    tabs,
    avatar,
    profile,
    sections,
    activeTab,
    completion,
    basicForm,
    skillsForm,
    credentials,
    detailsForm,
    setActiveTab,
    interestTags,
    refreshProfile,
    preferencesForm,
    isLoading: profileQuery.isLoading,
    isFetching: profileQuery.isFetching,
    hasError: Boolean(profileQuery.error),
  };
};

export type UseProfessionalProfileTabReturn = ReturnType<
  typeof useProfessionalProfileTab
>;
