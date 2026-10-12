"use client";

import { useSetProviderPublicProfileIndexExclusionMutation } from "@lib/rtk/endpoints/provider-public-profile.api";
import { useWithdrawProviderPublicProfileAsAdminMutation } from "@lib/rtk/endpoints/provider-public-profile.api";
import { useReviewProviderPublicProfileMutation } from "@lib/rtk/endpoints/provider-public-profile.api";
import { useAdminProviderPublicProfilesQuery } from "@lib/rtk/endpoints/provider-public-profile.api";
import { ProviderProfileReviewState } from "@/lib/graphql/base";
import { ExternalLink, LoaderCircle } from "lucide-react";
import { ProviderProfileDecision } from "@/lib/graphql/base";
import { resolveSocialImageUrl } from "@/utils/content-seo";
import { REVIEW_FEEDBACK_KEY } from "@/utils/provider-public-profile";
import { errorCodeOf } from "@/utils/content-seo";
import { GlassCard } from "@elements/glass-card";
import { Textarea } from "@ui/textarea";
import { useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";
import { Label } from "@ui/label";

import type { AdminProviderPublicProfileFieldsFragment } from "@/lib/graphql/operations/provider-public-profile";

import Image from "next/image";
import Link from "next/link";

type TProfile = AdminProviderPublicProfileFieldsFragment;
type TFilter = ProviderProfileReviewState | null;

const FILTERS: readonly TFilter[] = [
  ProviderProfileReviewState.Submitted,
  ProviderProfileReviewState.Rejected,
  ProviderProfileReviewState.Approved,
  ProviderProfileReviewState.Draft,
  null,
];

const NOTE_LIMIT = 1000;

type TFeedback =
  | { kind: "approved" | "rejected" | "withdrawn" | "indexed" | "excluded" }
  | { kind: "error"; code: string };

const ProfileCard = ({
  profile,
  onFeedback,
}: {
  profile: TProfile;
  onFeedback: (feedback: TFeedback) => void;
}) => {
  const { t } = useI18n();
  const [note, setNote] = useState("");
  const [review, reviewing] = useReviewProviderPublicProfileMutation();
  const [withdraw, withdrawing] =
    useWithdrawProviderPublicProfileAsAdminMutation();
  const [setExclusion, excluding] =
    useSetProviderPublicProfileIndexExclusionMutation();
  const isBusy =
    reviewing.isLoading || withdrawing.isLoading || excluding.isLoading;
  const logoUrl = resolveSocialImageUrl(profile.logoPath);
  const noteId = `profile-note-${profile.id}`;
  const isAwaiting =
    profile.reviewState === ProviderProfileReviewState.Submitted;

  const decide = async (decision: ProviderProfileDecision) => {
    const result = await review({
      profileId: profile.id,
      decision,
      note: note.trim() || null,
      expectedDraftVersion: profile.draftVersion,
    });
    if ("error" in result)
      return onFeedback({ kind: "error", code: errorCodeOf(result.error) });
    setNote("");
    onFeedback({
      kind:
        decision === ProviderProfileDecision.Approve ? "approved" : "rejected",
    });
  };

  const onWithdraw = async () => {
    const result = await withdraw({
      profileId: profile.id,
      note: note.trim() || null,
    });
    if ("error" in result)
      return onFeedback({ kind: "error", code: errorCodeOf(result.error) });
    setNote("");
    onFeedback({ kind: "withdrawn" });
  };

  const onToggleIndex = async () => {
    const excluded = !profile.excludeFromIndex;
    const result = await setExclusion({ profileId: profile.id, excluded });
    if ("error" in result)
      return onFeedback({ kind: "error", code: errorCodeOf(result.error) });
    onFeedback({ kind: excluded ? "excluded" : "indexed" });
  };

  return (
    <GlassCard className="space-y-4 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h2 className="break-words text-lg font-semibold">
            {profile.displayName || profile.providerName || profile.slug}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("providerProfileReview.fields.provider")}:{" "}
            {profile.providerName ?? profile.providerId}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={isAwaiting ? "default" : "secondary"}>
            {t(`providerProfileReview.review.${profile.reviewState}`)}
          </Badge>
          <Badge variant="outline">
            {t(`providerProfileReview.visibility.${profile.status}`)}
          </Badge>
        </div>
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div className="sm:col-span-2">
          <dt className="font-medium">
            {t("providerProfileReview.fields.biography")}
          </dt>
          <dd className="whitespace-pre-line text-muted-foreground">
            {profile.biography || t("providerProfileReview.fields.none")}
          </dd>
        </div>
        <div>
          <dt className="font-medium">
            {t("providerProfileReview.fields.website")}
          </dt>
          <dd className="break-all text-muted-foreground">
            {profile.websiteUrl || t("providerProfileReview.fields.none")}
          </dd>
        </div>
        <div>
          <dt className="font-medium">
            {t("providerProfileReview.fields.links")}
          </dt>
          <dd className="text-muted-foreground">
            {profile.links.length > 0
              ? profile.links.map((link) => (
                  <span key={link.url} className="block break-all">
                    {link.label}: {link.url}
                  </span>
                ))
              : t("providerProfileReview.fields.none")}
          </dd>
        </div>
        <div>
          <dt className="font-medium">
            {t("providerProfileReview.fields.logo")}
          </dt>
          <dd>
            {logoUrl ? (
              <Image
                alt=""
                width={48}
                height={48}
                unoptimized
                src={logoUrl}
                className="size-12 rounded-md border bg-card object-contain p-1"
              />
            ) : (
              <span className="text-muted-foreground">
                {t("providerProfileReview.fields.none")}
              </span>
            )}
          </dd>
        </div>
        <div>
          <dt className="font-medium">
            {t("providerProfileReview.fields.version", {
              version: profile.draftVersion,
            })}
          </dt>
        </div>
      </dl>

      <div className="space-y-2">
        <Label htmlFor={noteId}>{t("providerProfileReview.fields.note")}</Label>
        <Textarea
          rows={2}
          id={noteId}
          value={note}
          maxLength={NOTE_LIMIT}
          onChange={(event) => setNote(event.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {isAwaiting ? (
          <>
            <Button
              type="button"
              size="sm"
              disabled={isBusy}
              onClick={() => decide(ProviderProfileDecision.Approve)}
            >
              {reviewing.isLoading ? (
                <LoaderCircle className="size-4 animate-spin" aria-hidden />
              ) : null}
              {t("providerProfileReview.actions.approve")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isBusy}
              onClick={() => decide(ProviderProfileDecision.Reject)}
            >
              {t("providerProfileReview.actions.reject")}
            </Button>
          </>
        ) : null}
        {profile.isLive ? (
          <>
            <Button
              size="sm"
              type="button"
              variant="outline"
              disabled={isBusy}
              onClick={onWithdraw}
            >
              {t("providerProfileReview.actions.withdraw")}
            </Button>
            <Button
              size="sm"
              type="button"
              variant="outline"
              disabled={isBusy}
              onClick={onToggleIndex}
            >
              {t(
                profile.excludeFromIndex
                  ? "providerProfileReview.actions.allowIndexing"
                  : "providerProfileReview.actions.hideFromSearch",
              )}
            </Button>
            <Link
              href={`/providers/${profile.slug}`}
              className="inline-flex items-center gap-1.5 self-center text-sm font-medium underline-offset-4 hover:underline"
            >
              {t("providerProfileReview.actions.viewPublic")}
              <ExternalLink className="size-4" aria-hidden />
            </Link>
          </>
        ) : null}
      </div>
    </GlassCard>
  );
};

const AdminProviderProfilesTab = () => {
  const { t } = useI18n();
  const [filter, setFilter] = useState<TFilter>(
    ProviderProfileReviewState.Submitted,
  );
  const [feedback, setFeedback] = useState<TFeedback | null>(null);
  const query = useAdminProviderPublicProfilesQuery(filter);

  const feedbackText = feedback
    ? t(
        REVIEW_FEEDBACK_KEY[
          feedback.kind === "error" ? feedback.code : feedback.kind
        ] ?? "providerProfileReview.feedback.failed",
      )
    : null;

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-medium tracking-tight md:text-4xl">
          {t("providerProfileReview.title")}
        </h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          {t("providerProfileReview.description")}
        </p>
      </section>

      <div
        role="group"
        aria-label={t("providerProfileReview.title")}
        className="flex flex-wrap gap-2"
      >
        {FILTERS.map((candidate) => (
          <Button
            key={candidate ?? "all"}
            type="button"
            size="sm"
            variant={candidate === filter ? "default" : "outline"}
            aria-pressed={candidate === filter}
            onClick={() => {
              setFilter(candidate);
              setFeedback(null);
            }}
          >
            {t(`providerProfileReview.filters.${candidate ?? "all"}`)}
          </Button>
        ))}
      </div>

      <p
        aria-live="polite"
        className={
          feedback?.kind === "error"
            ? "text-sm text-destructive"
            : "text-sm text-muted-foreground"
        }
      >
        {feedbackText}
      </p>

      {query.isError ? (
        <div role="alert" className="space-y-3">
          <p>{t("providerProfileReview.loadFailed")}</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => query.refetch()}
          >
            {t("providerProfileReview.retry")}
          </Button>
        </div>
      ) : query.isLoading ? (
        <p role="status" className="text-muted-foreground">
          <LoaderCircle
            className="mr-2 inline size-4 animate-spin"
            aria-hidden
          />
        </p>
      ) : query.data && query.data.length > 0 ? (
        <div className="space-y-4">
          {query.data.map((profile) => (
            <ProfileCard
              profile={profile}
              onFeedback={setFeedback}
              key={`${profile.id}-${profile.draftVersion}-${profile.reviewState}-${profile.status}`}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed p-6 text-muted-foreground">
          {t("providerProfileReview.empty")}
        </p>
      )}
    </div>
  );
};

export default AdminProviderProfilesTab;
