"use client";

import { TDetailGoToContentProps } from "@/types/content-module.types";
import { getContentTypeStyle } from "@/utils/content-type-style";
import { externalUrlHost } from "@/utils/content-source.helper";
import { ExternalLink } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

const DetailGoToContent = ({ url, contentType }: TDetailGoToContentProps) => {
  const { t } = useI18n();
  const style = getContentTypeStyle(contentType);

  return (
    <div className="space-y-2">
      <Button
        asChild
        size="lg"
        radius="xl"
        className={cn(style.solidClass, "w-full justify-center")}
      >
        <a href={url} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="h-4 w-4" aria-hidden />
          {t("contentDetails.goToContent.button")}
        </a>
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        {t("contentDetails.goToContent.opensAt", {
          host: externalUrlHost(url),
        })}
      </p>
    </div>
  );
};

export default DetailGoToContent;
