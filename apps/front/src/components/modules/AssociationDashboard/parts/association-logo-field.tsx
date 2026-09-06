"use client";

import { TAssociationSettingsProps } from "@/types/association-dashboard.types";
import { Button } from "@ui/button";
import { useRef } from "react";

import Image from "next/image";

import * as S from "@utils/association-settings";
import * as L from "lucide-react";

export const AssociationLogoField = ({ hook }: TAssociationSettingsProps) => {
  const { label, logoUrl, uploadLogo, removeLogo, isLogoBusy } = hook;

  const picker = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-wrap items-center gap-5">
      <span className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-glass-border bg-background/50">
        {logoUrl ? (
          <Image
            width={96}
            height={96}
            unoptimized
            src={logoUrl}
            alt={label("branding.alt")}
            className="h-24 w-24 object-contain"
          />
        ) : (
          <L.ImageOff className="h-7 w-7 text-muted-foreground" />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted-foreground">
          {label("branding.rules", {
            types: S.LOGO_ACCEPT_ATTRIBUTE,
            limit: S.LOGO_MAX_MB,
          })}
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <input
            type="file"
            ref={picker}
            className="sr-only"
            id="association-logo-input"
            accept={S.LOGO_ACCEPT_ATTRIBUTE}
            aria-describedby="association-logo-rules"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void uploadLogo(file);
            }}
          />

          <Button
            radius="xl"
            type="button"
            variant="brand"
            disabled={isLogoBusy}
            onClick={() => picker.current?.click()}
          >
            {isLogoBusy ? (
              <L.LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <L.Upload className="h-4 w-4" />
            )}
            {label("branding.upload")}
          </Button>

          {logoUrl && (
            <Button
              radius="xl"
              type="button"
              variant="glass"
              disabled={isLogoBusy}
              onClick={() => void removeLogo()}
            >
              <L.Trash2 className="h-4 w-4" />
              {label("branding.remove")}
            </Button>
          )}
        </div>

        <p
          id="association-logo-rules"
          className="mt-3 text-xs text-muted-foreground"
        >
          {label("branding.reportNote")}
        </p>
      </div>
    </div>
  );
};
