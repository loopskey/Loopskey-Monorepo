"use client";

import { ContentEnrollmentStatus } from "@/lib/graphql/base";
import { MyWishlistInput, WishlistSortBy } from "@/lib/graphql/base";
import { TUseContentActionsArgs } from "@/types/hooks.types";
import { useCurrentUserQuery } from "@/lib/rtk/endpoints/auth.api";
import { useRouter } from "next/navigation";
import { siteLinks } from "@/utils/constant";
import { useMemo } from "react";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";

import * as ContentApi from "@/lib/rtk/endpoints/content-interaction.api";

const getLoginReturnUrl = () => {
  if (typeof window === "undefined") return siteLinks.login;
  return `${siteLinks.login}?returnTo=${encodeURIComponent(
    window.location.pathname + window.location.search,
  )}`;
};

const isUnauthorizedError = (error: unknown) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    Number((error as { status?: unknown }).status) === 401
  ) {
    return true;
  }
  if (
    typeof error === "object" &&
    error !== null &&
    "errors" in error &&
    Array.isArray((error as { errors?: unknown }).errors)
  ) {
    const errors = (
      error as { errors: Array<{ extensions?: { code?: string } }> }
    ).errors;
    return errors.some(
      (item) =>
        item.extensions?.code === "UNAUTHENTICATED" ||
        item.extensions?.code === "UNAUTHORIZED",
    );
  }
  return false;
};

export const useContentActions = ({
  contentId,
  contentType,
  skipEnrollment,
}: TUseContentActionsArgs) => {
  const { t } = useI18n();
  const router = useRouter();
  const { data: currentUserData } = useCurrentUserQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const isAuthenticated = Boolean(currentUserData?.user);
  const skip = !contentId;
  const skipAuthQueries = skip || !isAuthenticated;
  const wishlistInput = useMemo<MyWishlistInput>(
    () => ({
      page: 1,
      limit: 50,
      contentType,
      sortBy: WishlistSortBy.Newest,
    }),
    [contentType],
  );

  const { data: wishlistData } = ContentApi.useMyWishlistQuery(wishlistInput, {
    skip: skipAuthQueries,
  });

  const wishlistItems = useMemo(() => {
    return wishlistData?.items ?? [];
  }, [wishlistData?.items]);

  const { data: enrollments = [] } = ContentApi.useMyEnrollmentsQuery(
    undefined,
    {
      skip: skipAuthQueries || skipEnrollment,
    },
  );

  const [toggleWishlist, wishlistState] =
    ContentApi.useToggleWishlistMutation();
  const [enrollContent, enrollState] = ContentApi.useEnrollContentMutation();

  const isWishlisted = useMemo(() => {
    if (!contentId) return false;
    return wishlistItems.some(
      (item) =>
        item.contentType === contentType && item.contentId === contentId,
    );
  }, [wishlistItems, contentType, contentId]);

  const isEnrolled = useMemo(
    () =>
      enrollments.some(
        (item) =>
          item.contentType === contentType &&
          item.contentId === contentId &&
          item.status !== ContentEnrollmentStatus.Canceled,
      ),
    [enrollments, contentType, contentId],
  );

  const input = useMemo(
    () => ({
      contentType,
      contentId: contentId ?? "",
    }),
    [contentType, contentId],
  );

  const redirectToLogin = () => {
    notify.error(
      t("contentDetails.messages.loginRequired"),
      t("contentDetails.messages.loginRequiredDescription"),
    );

    router.push(getLoginReturnUrl());
  };

  const requireAuth = () => {
    if (!isAuthenticated) {
      redirectToLogin();
      return false;
    }
    return true;
  };

  const handleAuthError = (error: unknown) => {
    if (isUnauthorizedError(error)) {
      redirectToLogin();
      return true;
    }
    return false;
  };

  const onToggleWishlist = async () => {
    if (!contentId) return;
    if (!requireAuth()) return;
    try {
      const res = await toggleWishlist(input).unwrap();
      notify.success(res.message);
    } catch (error) {
      if (handleAuthError(error)) return;
      notify.error(t("contentDetails.messages.actionFailed"));
    }
  };

  const onEnroll = async () => {
    if (!contentId) return;
    if (!requireAuth()) return;
    try {
      const res = await enrollContent(input).unwrap();
      notify.success(res.message);
    } catch (error) {
      if (handleAuthError(error)) return;
      notify.error(t("contentDetails.messages.actionFailed"));
    }
  };

  return {
    onEnroll,
    isEnrolled,
    isWishlisted,
    isAuthenticated,
    onToggleWishlist,
    isEnrollLoading: enrollState.isLoading,
    isWishlistLoading: wishlistState.isLoading,
  };
};
