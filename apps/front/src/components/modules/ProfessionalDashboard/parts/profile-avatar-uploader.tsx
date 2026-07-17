"use client";

import { TProfileAvatarUploaderProps } from "@/types/professional-profile.types";
import { ImageUp, Loader2, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@elements/confirm-dialog";
import { UserAvatar } from "@elements/user-avatar";
import { Progress } from "@ui/progress";
import { useI18n } from "@/hooks/useI18n";
import { useRef, useState } from "react";
import { Button } from "@ui/button";

import * as C from "@/utils/professional-profile.constant";

export const ProfileAvatarUploader = ({
  avatar,
  profile,
  isDisabled,
}: TProfileAvatarUploaderProps) => {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [hasImageError, setHasImageError] = useState(false);

  const {
    error,
    progress,
    isRemoving,
    isUploading,
    uploadAvatar,
    removeAvatar,
  } = avatar;

  const isBusy = isUploading || isRemoving || isDisabled;

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const input = event.target;
    const file = input.files?.[0];
    if (file) await uploadAvatar(file);
    // Reset once the file has been read, so re-picking the same file still
    // fires a change event without clearing the FileList mid-upload.
    input.value = "";
  };

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-glass-border bg-background/45 p-5 sm:flex-row sm:items-center">
      <UserAvatar
        email={profile?.email}
        fullName={profile?.fullName}
        avatarUrl={profile?.avatarUrl}
        className="h-20 w-20 border border-primary/20"
        alt={t("professionalDashboard.profile.avatar.alt")}
        fallbackClassName="bg-primary/10 text-lg font-medium text-primary"
        onLoadingStatusChange={(status) => setHasImageError(status === "error")}
      />

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">
          {profile?.fullName || profile?.email || "-"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("professionalDashboard.profile.avatar.hint", {
            size: String(C.MAX_AVATAR_SIZE_BYTES / (1024 * 1024)),
          })}
        </p>

        {isUploading ? (
          <div className="mt-3 space-y-1">
            <Progress
              value={progress}
              aria-label={t("professionalDashboard.profile.avatar.uploading")}
            />
            <p className="text-xs text-muted-foreground" aria-live="polite">
              {t("professionalDashboard.profile.avatar.uploading")} {progress}%
            </p>
          </div>
        ) : null}

        {error ? (
          <p role="alert" className="mt-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        {/* Without this a stored avatar that fails to load is indistinguishable
            from having none, because the fallback initials quietly take over.
            Having no photo at all also reports "error", so this stays keyed to
            a photo actually being set. */}
        {!error && !isUploading && profile?.avatarUrl && hasImageError ? (
          <p role="alert" className="mt-2 text-sm text-destructive">
            {t("professionalDashboard.profile.errors.avatarUnavailable")}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          type="file"
          ref={inputRef}
          className="sr-only"
          disabled={isBusy}
          onChange={handleFileChange}
          id="professional-avatar-input"
          accept={C.ACCEPTED_AVATAR_ACCEPT_ATTRIBUTE}
          aria-label={t("professionalDashboard.profile.avatar.upload")}
        />

        <Button
          radius="xl"
          type="button"
          variant="glass"
          disabled={isBusy}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImageUp className="h-4 w-4" />
          )}
          {t("professionalDashboard.profile.avatar.upload")}
        </Button>

        <ConfirmDialog
          isLoading={isRemoving}
          confirmVariant="destructive"
          onConfirm={() => void removeAvatar()}
          title={t("professionalDashboard.profile.avatar.deleteTitle")}
          cancelText={t("common.cancel")}
          confirmText={t("common.delete")}
          description={t(
            "professionalDashboard.profile.avatar.deleteDescription",
          )}
          trigger={
            <Button
              radius="xl"
              type="button"
              variant="glass"
              disabled={isBusy || !profile?.avatarUrl}
            >
              {isRemoving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              {t("professionalDashboard.profile.avatar.remove")}
            </Button>
          }
        />
      </div>
    </div>
  );
};
