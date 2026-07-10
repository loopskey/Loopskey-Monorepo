"use client";

import { TActivityEvidenceUploadProps } from "@/types/professional-dashboard.types";
import { ChangeEvent, useRef } from "react";
import { notify } from "@/hooks/notify";
import { Button } from "@ui/button";

import * as C from "@/utils/pdu.constant";
import * as L from "lucide-react";

const TRACKER = "professionalDashboard.cpdPduTracker";

export const ActivityEvidenceUpload = ({
  t,
  files,
  onChange,
  isRemoving,
  existingFiles,
  onRemoveExisting,
  onDownloadExisting,
}: TActivityEvidenceUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const totalCount = existingFiles.length + files.length;
  const remainingSlots = C.MAX_EVIDENCE_FILES - totalCount;

  const handleSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!selected.length) return;
    if (selected.length > remainingSlots) {
      notify.error(
        t(`${TRACKER}.evidence.tooManyFiles`, { max: C.MAX_EVIDENCE_FILES }),
      );
      return;
    }

    const accepted: File[] = [];
    for (const file of selected) {
      if (file.size > C.MAX_EVIDENCE_SIZE_BYTES) {
        notify.error(
          t(`${TRACKER}.evidence.fileTooLarge`, { name: file.name }),
        );
        continue;
      }
      if (
        !(C.ACCEPTED_EVIDENCE_MIME_TYPES as readonly string[]).includes(
          file.type,
        )
      ) {
        notify.error(
          t(`${TRACKER}.evidence.fileTypeInvalid`, { name: file.name }),
        );
        continue;
      }
      accepted.push(file);
    }
    if (accepted.length) onChange([...files, ...accepted]);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-[1.5rem] border border-dashed border-glass-border bg-background/40 p-8 text-center">
        <L.UploadCloud className="mx-auto h-9 w-9 text-muted-foreground" />
        <p className="mt-3 font-medium">{t(`${TRACKER}.evidence.dropTitle`)}</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          {t(`${TRACKER}.evidence.dropHint`)}
        </p>
        <input
          hidden
          multiple
          type="file"
          ref={inputRef}
          onChange={handleSelect}
          accept={C.ACCEPTED_EVIDENCE_ACCEPT_ATTRIBUTE}
        />

        <Button
          radius="xl"
          type="button"
          variant="glass"
          className="mt-5"
          disabled={remainingSlots <= 0}
          onClick={() => inputRef.current?.click()}
        >
          <L.Paperclip className="h-4 w-4" />
          {t(`${TRACKER}.evidence.chooseFiles`)}
        </Button>

        <p className="mt-3 text-xs text-muted-foreground">
          {remainingSlots > 0
            ? t(`${TRACKER}.evidence.remaining`, { count: remainingSlots })
            : t(`${TRACKER}.evidence.limitReached`, {
                max: C.MAX_EVIDENCE_FILES,
              })}
        </p>
      </div>

      {existingFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            {t(`${TRACKER}.evidence.existingTitle`)}
          </p>

          {existingFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-glass-border bg-background/40 px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <L.FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {file.fileName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {C.formatFileSize(file.sizeBytes)}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {onDownloadExisting && (
                  <Button
                    size="sm"
                    radius="xl"
                    type="button"
                    variant="glass"
                    onClick={() => onDownloadExisting(file)}
                    aria-label={t(`${TRACKER}.evidence.download`)}
                  >
                    <L.Download className="h-3.5 w-3.5" />
                  </Button>
                )}

                {onRemoveExisting && (
                  <Button
                    size="sm"
                    radius="xl"
                    type="button"
                    variant="cancel"
                    disabled={isRemoving}
                    onClick={() => onRemoveExisting(file.id)}
                    aria-label={t(`${TRACKER}.evidence.remove`)}
                  >
                    <L.Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            {t(`${TRACKER}.evidence.pendingTitle`)}
          </p>

          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between gap-3 rounded-2xl border border-glass-border bg-background/40 px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <L.FileUp className="h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {C.formatFileSize(file.size)}
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                radius="xl"
                type="button"
                variant="cancel"
                aria-label={t(`${TRACKER}.evidence.remove`)}
                onClick={() =>
                  onChange(files.filter((_, position) => position !== index))
                }
              >
                <L.X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
