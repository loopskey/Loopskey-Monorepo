"use client";

import { useExternalLearningRedirect } from "@/hooks/useExternalLearningRedirect";
import { TExternalLearningBtn } from "@/types/element.types";
import { ExternalLink } from "lucide-react";
import { Button } from "@ui/button";

export const ExternalLearningButton = ({
  title,
  label,
  eventId,
  courseId,
  provider,
  disabled,
  externalUrl,
}: TExternalLearningBtn) => {
  const { trackAndOpen, isTracking } = useExternalLearningRedirect();

  return (
    <Button
      radius="xl"
      variant="brand"
      disabled={disabled || isTracking}
      onClick={() =>
        trackAndOpen({
          title,
          eventId,
          courseId,
          provider,
          externalUrl,
        })
      }
    >
      <ExternalLink className="h-4 w-4" />
      {label}
    </Button>
  );
};
