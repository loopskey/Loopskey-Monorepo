"use client";

import { ProfessionalMessageCode } from "@loopskey/api-contracts/error-codes";
import { useCallback, useState } from "react";
import { refreshAccessToken } from "@/lib/rtk/graphqlBaseQuery";
import { professionalApi } from "@/lib/rtk/endpoints/professional.api";
import { useDispatch } from "react-redux";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";

import * as C from "@/utils/professional-profile.constant";

type TAvatarTagList = Parameters<typeof professionalApi.util.invalidateTags>[0];

const AVATAR_TAGS: TAvatarTagList = [
  "ProfessionalProfile",
  "Professional",
  "CurrentUser",
  "User",
];

const UNAUTHORIZED_STATUS = 401;

const AVATAR_ERROR_MESSAGE_KEY: Record<string, string> = {
  [ProfessionalMessageCode.AVATAR_FILE_INVALID_TYPE]:
    "professionalDashboard.profile.errors.avatarType",
  [ProfessionalMessageCode.AVATAR_FILE_TOO_LARGE]:
    "professionalDashboard.profile.errors.avatarSize",
  [ProfessionalMessageCode.AVATAR_STORAGE_UNAVAILABLE]:
    "professionalDashboard.profile.errors.avatarStorageUnavailable",
};

type TAvatarUploadResult = { status: number; code?: string };

const parseErrorCode = (responseText: string): string | undefined => {
  try {
    const body = JSON.parse(responseText) as { message?: unknown };
    return typeof body.message === "string" ? body.message : undefined;
  } catch {
    return undefined;
  }
};

const sendAvatarUpload = (file: File, onProgress: (value: number) => void) =>
  new Promise<TAvatarUploadResult>((resolve, reject) => {
    const body = new FormData();
    body.append("file", file);

    const request = new XMLHttpRequest();
    request.open("POST", C.AVATAR_ENDPOINT);
    request.withCredentials = true;

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    };
    request.onload = () => {
      const status = request.status;
      if (status >= 200 && status < 300) return resolve({ status });
      resolve({ status, code: parseErrorCode(request.responseText) });
    };
    request.onerror = () => reject(new Error("network"));
    request.send(body);
  });

export const useProfessionalAvatar = () => {
  const { t } = useI18n();
  const dispatch = useDispatch();
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const refreshAvatarCaches = useCallback(() => {
    dispatch(professionalApi.util.invalidateTags(AVATAR_TAGS));
  }, [dispatch]);

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
        setPendingFile(null);
        setError(validationError);
        notify.error(validationError);
        return;
      }

      setPendingFile(file);
      setError(null);
      setProgress(0);
      setIsUploading(true);

      try {
        let result = await sendAvatarUpload(file, setProgress);
        if (result.status === UNAUTHORIZED_STATUS) {
          const refreshed = await refreshAccessToken();
          if (!refreshed) {
            const message = t(
              "professionalDashboard.profile.errors.avatarUnauthenticated",
            );
            setError(message);
            notify.error(message);
            return;
          }
          result = await sendAvatarUpload(file, setProgress);
        }

        if (result.status < 200 || result.status >= 300) {
          const message = t(
            (result.code && AVATAR_ERROR_MESSAGE_KEY[result.code]) ||
              "professionalDashboard.profile.errors.avatarUpload",
          );
          setError(message);
          notify.error(message);
          refreshAvatarCaches();
          return;
        }

        setPendingFile(null);
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

  const retryUpload = useCallback(() => {
    if (!pendingFile || isUploading) return;
    void uploadAvatar(pendingFile);
  }, [isUploading, pendingFile, uploadAvatar]);

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
    retryUpload,
    canRetry: Boolean(pendingFile) && !isUploading,
  };
};
