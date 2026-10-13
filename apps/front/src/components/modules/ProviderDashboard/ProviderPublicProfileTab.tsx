"use client";

import { SOCIAL_IMAGE_ACCEPT, SOCIAL_IMAGE_MAX_MB } from "@/utils/content-seo";
import { useProviderPublicProfileEditor } from "@/hooks/useProviderPublicProfileEditor";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { ImageIcon, LoaderCircle } from "lucide-react";
import { resolveSocialImageUrl } from "@/utils/content-seo";
import { PROFILE_LIMITS } from "@/utils/provider-public-profile";
import { GlassCard } from "@elements/glass-card";
import { Textarea } from "@ui/textarea";
import { Button } from "@ui/button";
import { useRef } from "react";
import { Input } from "@ui/input";
import { Label } from "@ui/label";

import Image from "next/image";
import Link from "next/link";

const FIELD = "provider-public-profile";

const ProviderPublicProfileTab = () => {
  const editor = useProviderPublicProfileEditor();
  const { t, form, profile, query } = editor;
  const logo = useRef<HTMLInputElement>(null);
  const logoUrl = resolveSocialImageUrl(form.logoPath);
  const needsReload =
    editor.feedback?.kind === "error" &&
    editor.feedback.code === "PROVIDER_PROFILE_VERSION_CONFLICT";

  if (query.isError)
    return (
      <div role="alert" className="space-y-3">
        <p>{t("providerPublicProfile.loadFailed")}</p>
        <Button type="button" variant="outline" onClick={() => query.refetch()}>
          {t("providerPublicProfile.retry")}
        </Button>
      </div>
    );

  return (
    <div className="space-y-6" aria-busy={query.isFetching}>
      <section>
        <h1 className="text-3xl font-medium tracking-tight md:text-4xl">
          {t("providerPublicProfile.title")}
        </h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          {t("providerPublicProfile.description")}
        </p>
      </section>

      <GlassCard className="space-y-2 p-5" aria-live="polite">
        <p className="font-medium">
          {t(`providerPublicProfile.status.${editor.statusKey}`)}
        </p>
        {profile?.reviewNote ? (
          <p className="text-sm">
            <span className="font-medium">
              {t("providerPublicProfile.reviewNote")}:
            </span>{" "}
            {profile.reviewNote}
          </p>
        ) : null}
        {profile?.isLive ? (
          <p className="text-sm">
            <Link
              href={`/providers/${profile.slug}`}
              className="inline-flex items-center gap-1.5 font-medium underline-offset-4 hover:underline"
            >
              {t("providerPublicProfile.actions.viewPublic")}
              <ExternalLink className="size-4" aria-hidden />
            </Link>
          </p>
        ) : null}
        <p className="text-sm text-muted-foreground">
          {t("providerPublicProfile.requirements", {
            min: PROFILE_LIMITS.biographyMin,
          })}
        </p>
      </GlassCard>

      <GlassCard className="space-y-6 p-5">
        <div className="space-y-2">
          <Label htmlFor={`${FIELD}-name`}>
            {t("providerPublicProfile.fields.displayName")}
          </Label>
          <Input
            id={`${FIELD}-name`}
            value={form.displayName}
            maxLength={PROFILE_LIMITS.displayNameMax}
            aria-describedby={`${FIELD}-name-help`}
            onChange={(event) =>
              editor.changeField("displayName", event.target.value)
            }
          />
          <p
            id={`${FIELD}-name-help`}
            className="text-xs text-muted-foreground"
          >
            {t("providerPublicProfile.hints.displayName")}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${FIELD}-bio`}>
            {t("providerPublicProfile.fields.biography")}
          </Label>
          <Textarea
            rows={7}
            id={`${FIELD}-bio`}
            value={form.biography}
            maxLength={PROFILE_LIMITS.biographyMax}
            aria-describedby={`${FIELD}-bio-help`}
            onChange={(event) =>
              editor.changeField("biography", event.target.value)
            }
          />
          <p id={`${FIELD}-bio-help`} className="text-xs text-muted-foreground">
            {t("providerPublicProfile.hints.counter", {
              count: form.biography.length,
              max: PROFILE_LIMITS.biographyMax,
            })}{" "}
            {t("providerPublicProfile.hints.biography")}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${FIELD}-website`}>
            {t("providerPublicProfile.fields.website")}
          </Label>
          <Input
            type="url"
            inputMode="url"
            autoComplete="off"
            id={`${FIELD}-website`}
            value={form.websiteUrl}
            maxLength={PROFILE_LIMITS.websiteMax}
            aria-describedby={`${FIELD}-website-help`}
            placeholder="https://"
            onChange={(event) =>
              editor.changeField("websiteUrl", event.target.value)
            }
          />
          <p
            id={`${FIELD}-website-help`}
            className="text-xs text-muted-foreground"
          >
            {t("providerPublicProfile.hints.website")}
          </p>
        </div>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">
            {t("providerPublicProfile.fields.links")}
          </legend>
          <p className="text-xs text-muted-foreground">
            {t("providerPublicProfile.hints.links", {
              max: PROFILE_LIMITS.linksMax,
            })}
          </p>
          {form.links.map((link, index) => (
            <div
              key={index}
              className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto]"
            >
              <div className="space-y-1">
                <Label htmlFor={`${FIELD}-link-label-${index}`}>
                  {t("providerPublicProfile.fields.linkLabel")}
                </Label>
                <Input
                  id={`${FIELD}-link-label-${index}`}
                  value={link.label}
                  maxLength={PROFILE_LIMITS.linkLabelMax}
                  onChange={(event) =>
                    editor.changeLink(index, "label", event.target.value)
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`${FIELD}-link-url-${index}`}>
                  {t("providerPublicProfile.fields.linkUrl")}
                </Label>
                <Input
                  id={`${FIELD}-link-url-${index}`}
                  type="url"
                  inputMode="url"
                  value={link.url}
                  maxLength={PROFILE_LIMITS.linkUrlMax}
                  placeholder="https://"
                  onChange={(event) =>
                    editor.changeLink(index, "url", event.target.value)
                  }
                />
              </div>
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="self-end"
                aria-label={t("providerPublicProfile.actions.removeLink", {
                  index: index + 1,
                })}
                onClick={() => editor.removeLink(index)}
              >
                <Trash2 className="size-4" aria-hidden />
              </Button>
            </div>
          ))}
          {form.links.length < PROFILE_LIMITS.linksMax ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={editor.addLink}
            >
              <Plus className="size-4" aria-hidden />
              {t("providerPublicProfile.actions.addLink")}
            </Button>
          ) : null}
        </fieldset>

        <div className="space-y-2">
          <p className="text-sm font-medium">
            {t("providerPublicProfile.fields.logo")}
          </p>
          <p
            id={`${FIELD}-logo-help`}
            className="text-xs text-muted-foreground"
          >
            {t("providerPublicProfile.hints.logo", {
              size: SOCIAL_IMAGE_MAX_MB,
            })}
          </p>
          <input
            type="file"
            ref={logo}
            tabIndex={-1}
            className="sr-only"
            id={`${FIELD}-logo`}
            accept={SOCIAL_IMAGE_ACCEPT}
            aria-describedby={`${FIELD}-logo-help`}
            onChange={editor.onChooseLogo}
          />
          <div className="flex flex-wrap items-center gap-3">
            {logoUrl ? (
              <Image
                alt=""
                width={64}
                height={64}
                unoptimized
                src={logoUrl}
                className="size-16 rounded-lg border bg-card object-contain p-1"
              />
            ) : (
              <span className="flex size-16 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                <ImageIcon className="size-6" aria-hidden />
              </span>
            )}
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={editor.isBusy || editor.isUploading}
              onClick={() => logo.current?.click()}
            >
              {editor.isUploading ? (
                <LoaderCircle className="size-4 animate-spin" aria-hidden />
              ) : null}
              {t(
                form.logoImageId
                  ? "providerPublicProfile.actions.replaceLogo"
                  : "providerPublicProfile.actions.uploadLogo",
              )}
            </Button>
            {form.logoImageId ? (
              <Button
                size="sm"
                type="button"
                variant="outline"
                disabled={editor.isBusy}
                onClick={editor.onRemoveLogo}
              >
                {t("providerPublicProfile.actions.removeLogo")}
              </Button>
            ) : null}
          </div>
        </div>

        <p
          tabIndex={-1}
          aria-live="polite"
          ref={editor.feedbackRef}
          className={
            editor.feedback?.kind === "error"
              ? "text-sm text-destructive outline-none"
              : "text-sm text-muted-foreground outline-none"
          }
        >
          {editor.feedbackText}
        </p>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={
              !editor.isDirty || editor.isBusy || !form.displayName.trim()
            }
            onClick={editor.onSave}
          >
            {editor.isSaving ? (
              <LoaderCircle className="size-4 animate-spin" aria-hidden />
            ) : null}
            {t("providerPublicProfile.actions.save")}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!editor.canSubmit}
            onClick={editor.onSubmit}
          >
            {editor.isSubmitting ? (
              <LoaderCircle className="size-4 animate-spin" aria-hidden />
            ) : null}
            {t("providerPublicProfile.actions.submit")}
          </Button>
          {editor.canWithdraw ? (
            <Button
              type="button"
              variant="outline"
              disabled={editor.isBusy}
              onClick={editor.onWithdraw}
            >
              {t("providerPublicProfile.actions.withdraw")}
            </Button>
          ) : null}
          {needsReload ? (
            <Button type="button" variant="outline" onClick={editor.onReload}>
              {t("providerPublicProfile.actions.reload")}
            </Button>
          ) : null}
        </div>
      </GlassCard>
    </div>
  );
};

export default ProviderPublicProfileTab;
