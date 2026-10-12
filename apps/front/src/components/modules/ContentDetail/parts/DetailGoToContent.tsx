"use client";

import { TelemetryConversionEvent } from "@/lib/graphql/base";
import { TDetailGoToContentProps } from "@/types/content-module.types";
import { useAcquisitionTracking } from "@/hooks/useAcquisitionTracking";
import { getContentTypeStyle } from "@/utils/content-type-style";
import { externalUrlHost } from "@/utils/content-source.helper";
import { telemetryKindOf } from "@/lib/telemetry/conversions";
import { ExternalLink } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

const DetailGoToContent = ({ url, contentType }: TDetailGoToContentProps) => {
  const { t } = useI18n();
  const style = getContentTypeStyle(contentType);
  const { track } = useAcquisitionTracking();

  const trackExternalAction = () =>
    track({
      event: TelemetryConversionEvent.ExternalContentAction,
      contentKind: telemetryKindOf(contentType),
    });

  const notifyUnavailable = () => {
    notify.warning(
      t("contentDetails.goToContent.unavailableTitle"),
      t("contentDetails.goToContent.unavailableDescription"),
    );
  };

  return (
    <div className="space-y-2">
      {url ? (
        <Button
          asChild
          size="lg"
          radius="xl"
          className={cn(style.solidClass, "w-full justify-center")}
        >
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={trackExternalAction}
          >
            <ExternalLink className="h-4 w-4" aria-hidden />
            {t("contentDetails.goToContent.button")}
          </a>
        </Button>
      ) : (
        <Button
          size="lg"
          radius="xl"
          type="button"
          onClick={notifyUnavailable}
          className={cn(style.solidClass, "w-full justify-center")}
        >
          <ExternalLink className="h-4 w-4" aria-hidden />
          {t("contentDetails.goToContent.button")}
        </Button>
      )}

      <p className="text-center text-xs text-muted-foreground">
        {url
          ? t("contentDetails.goToContent.opensAt", {
              host: externalUrlHost(url),
            })
          : t("contentDetails.goToContent.unavailableHint")}
      </p>
    </div>
  );
};

export default DetailGoToContent;
