"use client";

import { professionalApi } from "@/lib/rtk/endpoints/professional.api";
import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";

import * as C from "@/utils/professional-profile.constant";

type TAvatarTagList = Parameters<
  typeof professionalApi.util.invalidateTags
>[0];

const AVATAR_TAGS: TAvatarTagList = [
  "ProfessionalProfile",
  "Professional",
  "CurrentUser",
  "User",
];

export const useProfessionalAvatar = () => {
  const { t } = useI18n();
  const dispatch = useDispatch();
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const refreshAvatarCaches = useCallback(() => {
    dispatch(professionalApi.util.invalidateTags(AVATAR_TAGS));
  }, [dispatch]);

  /**
   * Mirrors the API's own limits so an oversized or unsupported file never
   * leaves the browser. The API re-validates both independently.
   */
  const validateFile = useCallback(
    (file: File) => {
      const isAcceptedType = (
        C.ACCEPTED_AVATAR_MIME_TYPES as readonly string[]
      ).includes(file.type);
      if (!isAcceptedType)
        return t("professionalDashboard.profile.errors.avatarType");
      if (file.size > C.MAX_AVATAR_SIZE_BYTES)
        return t("professionalDashboard.profile.errors.avatarSize");
      return null;
    },
    [t],
  );

  const uploadAvatar = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        notify.error(validationError);
        return;
      }

      setError(null);
      setProgress(0);
      setIsUploading(true);

      try {
        // XHR (not fetch) so the upload can report real progress.
        await new Promise<void>((resolve, reject) => {
          const body = new FormData();
          body.append("file", file);

          const request = new XMLHttpRequest();
          request.open("POST", C.AVATAR_ENDPOINT);
          request.withCredentials = true;

          request.upload.onprogress = (event) => {
            if (!event.lengthComputable) return;
            setProgress(Math.round((event.loaded / event.total) * 100));
          };
          request.onload = () => {
            if (request.status >= 200 && request.status < 300) return resolve();
            reject(new Error(String(request.status)));
          };
          request.onerror = () => reject(new Error("network"));
          request.send(body);
        });

        refreshAvatarCaches();
        notify.success(t("professionalDashboard.profile.avatar.uploaded"));
      } catch {
        const message = t("professionalDashboard.profile.errors.avatarUpload");
        setError(message);
        notify.error(message);
      } finally {
        setIsUploading(false);
        setProgress(0);
      }
    },
    [refreshAvatarCaches, t, validateFile],
  );

  const removeAvatar = useCallback(async () => {
    setError(null);
    setIsRemoving(true);
    try {
      const response = await fetch(C.AVATAR_ENDPOINT, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error(String(response.status));
      refreshAvatarCaches();
      notify.success(t("professionalDashboard.profile.avatar.removed"));
    } catch {
      const message = t("professionalDashboard.profile.errors.avatarDelete");
      setError(message);
      notify.error(message);
    } finally {
      setIsRemoving(false);
    }
  }, [refreshAvatarCaches, t]);

  return {
    error,
    progress,
    isRemoving,
    isUploading,
    uploadAvatar,
    removeAvatar,
  };
};
