"use client";

import { TAssociationSettingsSectionProps } from "@/types/association-dashboard.types";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";

import * as L from "lucide-react";

export const AssociationSettingsSection = ({
  title,
  onSave,
  children,
  saveLabel,
  isSaving,
  description,
  isDisabled,
}: TAssociationSettingsSectionProps) => (
  <GlassCard glow={false}>
    <form
      className="relative z-10"
      onSubmit={(event) => {
        event.preventDefault();
        if (onSave) void onSave();
      }}
    >
      <div>
        <h2 className="text-lg font-medium">{title}</h2>

        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="mt-6 space-y-5">{children}</div>

      {onSave && (
        <div className="mt-6 flex justify-end">
          <Button
            radius="xl"
            type="submit"
            disabled={isSaving || isDisabled}
          >
            {isSaving ? (
              <L.LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <L.Check className="h-4 w-4" />
            )}
            {saveLabel}
          </Button>
        </div>
      )}
    </form>
  </GlassCard>
);
