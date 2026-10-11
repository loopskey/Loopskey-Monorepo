"use client";

import { ImageIcon } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

import type { TContentSeoPreviewProps } from "@/types/content-seo.types";

import Image from "next/image";

const ContentSeoPreview = ({
  title,
  locale,
  imageUrl,
  imageAlt,
  description,
  canonicalUrl,
}: TContentSeoPreviewProps) => {
  const { t } = useI18n();
  const isEmpty = !title && !description;

  return (
    <section
      aria-label={t("contentSeo.preview.title")}
      className="space-y-3 rounded-lg border bg-muted/30 p-4"
    >
      <div className="space-y-1">
        <h3 className="text-sm font-semibold">
          {t("contentSeo.preview.title")}
        </h3>
        <p className="text-xs text-muted-foreground">
          {t("contentSeo.preview.note")}
        </p>
      </div>

      {isEmpty ? (
        <p className="text-sm text-muted-foreground">
          {t("contentSeo.preview.empty")}
        </p>
      ) : (
        <div className="space-y-4">
          <div lang={locale.toLowerCase()} className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              {t("contentSeo.preview.search")}
            </p>
            <p className="break-all text-xs text-muted-foreground">
              {canonicalUrl}
            </p>
            <p className="break-words text-base font-medium text-primary">
              {title}
            </p>
            <p className="break-words text-sm text-muted-foreground">
              {description}
            </p>
          </div>

          <div lang={locale.toLowerCase()} className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              {t("contentSeo.preview.share")}
            </p>
            <div className="overflow-hidden rounded-md border bg-background">
              {imageUrl ? (
                <div className="relative aspect-[1200/630] w-full">
                  <Image
                    fill
                    unoptimized
                    src={imageUrl}
                    alt={imageAlt}
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex aspect-[1200/630] w-full items-center justify-center gap-2 bg-muted text-sm text-muted-foreground">
                  <ImageIcon className="size-4" aria-hidden />
                  {t("contentSeo.preview.generatedCard")}
                </div>
              )}
              <div className="space-y-0.5 border-t p-3">
                <p className="break-words text-sm font-medium">{title}</p>
                <p className="line-clamp-2 break-words text-xs text-muted-foreground">
                  {description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ContentSeoPreview;
