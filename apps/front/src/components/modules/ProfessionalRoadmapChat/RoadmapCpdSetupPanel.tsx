"use client";

import { useLazyCertificationSearchQuery } from "@/lib/rtk/endpoints/cpd-plan.api";
import { useCertificationSearchQuery } from "@/lib/rtk/endpoints/cpd-plan.api";
import { useCpdReportRecipientsQuery } from "@/lib/rtk/endpoints/cpd-plan.api";
import { useEffect, useState } from "react";
import { useDebouncedValue } from "@/hooks/useDebounced";
import { CpdEvidenceType } from "@/lib/graphql/base";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { PatchRoadmapCpdSetupInput } from "@/lib/graphql/base";
import type { TRoadmapDraft } from "@/types/professional-roadmap-chat.types";

const KEY = "professionalRoadmapChat.cpdSetup";
const COMMON_CERTIFICATIONS = [
  "PMP",
  "PMP-ACP",
  "CFA",
  "CPA",
  "CISSP",
  "SHRM-CP",
];
const EVIDENCE_OPTIONS = Object.values(CpdEvidenceType);

type TCategoryDraft = { name: string; target: string };

type TRoadmapCpdSetupPanelProps = {
  draft: TRoadmapDraft;
  isEditing: boolean;
  isPatching: boolean;
  onPatch: (changes: Omit<PatchRoadmapCpdSetupInput, "draftId">) => void;
};

const toDateInput = (value?: string | null) =>
  value ? value.slice(0, 10) : "";

export const RoadmapCpdSetupPanel = ({
  draft,
  isEditing,
  isPatching,
  onPatch,
}: TRoadmapCpdSetupPanelProps) => {
  const { t } = useI18n();
  const plan = draft.cpdPlan;
  const hasCertification = Boolean(
    draft.certificationId || draft.certificationName,
  );

  const [query, setQuery] = useState("");
  const [manualName, setManualName] = useState("");
  const debouncedQuery = useDebouncedValue(query, 350);
  const [triggerSearch] = useLazyCertificationSearchQuery();
  const { data: recipients } = useCpdReportRecipientsQuery();

  const { data: matches } = useCertificationSearchQuery(
    { input: { query: debouncedQuery.trim(), limit: 6 } },
    { skip: debouncedQuery.trim().length < 2 },
  );

  const [organization, setOrganization] = useState(plan?.organization ?? "");
  const [totalRequiredCredits, setTotalRequiredCredits] = useState(
    plan?.totalRequiredCredits ? String(plan.totalRequiredCredits) : "",
  );
  const [reportingEnd, setReportingEnd] = useState(
    toDateInput(plan?.reportingEnd),
  );
  const [evidenceTypes, setEvidenceTypes] = useState<CpdEvidenceType[]>(
    plan?.evidenceTypes ?? [],
  );
  const [reportRecipientType, setReportRecipientType] = useState(
    plan?.reportRecipientType ?? null,
  );
  const [categories, setCategories] = useState<TCategoryDraft[]>(
    (plan?.categories ?? []).map((category) => ({
      name: category.name,
      target: String(category.targetCredits),
    })),
  );

  useEffect(() => {
    if (!isEditing) return;
    setOrganization(plan?.organization ?? "");
    setTotalRequiredCredits(
      plan?.totalRequiredCredits ? String(plan.totalRequiredCredits) : "",
    );
    setReportingEnd(toDateInput(plan?.reportingEnd));
    setEvidenceTypes(plan?.evidenceTypes ?? []);
    setReportRecipientType(plan?.reportRecipientType ?? null);
    setCategories(
      (plan?.categories ?? []).map((category) => ({
        name: category.name,
        target: String(category.targetCredits),
      })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  const pickCommon = async (abbreviation: string) => {
    const result = await triggerSearch({
      input: { query: abbreviation, limit: 1 },
    }).unwrap();
    const match = result[0];
    if (match) onPatch({ certificationId: match.id });
  };

  const saveManualName = () => {
    if (!manualName.trim()) return;
    onPatch({ certificationName: manualName.trim() });
    setManualName("");
  };

  const toggleEvidence = (value: CpdEvidenceType) => {
    setEvidenceTypes((current) =>
      current.includes(value)
        ? current.filter((entry) => entry !== value)
        : [...current, value],
    );
  };

  const addCategory = () =>
    setCategories((current) => [...current, { name: "", target: "" }]);

  const updateCategory = (index: number, next: Partial<TCategoryDraft>) =>
    setCategories((current) =>
      current.map((category, i) =>
        i === index ? { ...category, ...next } : category,
      ),
    );

  const removeCategory = (index: number) =>
    setCategories((current) => current.filter((_, i) => i !== index));

  const saveFields = () => {
    onPatch({
      organization: organization.trim() || null,
      totalRequiredCredits: totalRequiredCredits
        ? Number(totalRequiredCredits)
        : null,
      reportingEnd: reportingEnd
        ? new Date(`${reportingEnd}T00:00:00.000Z`).toISOString()
        : null,
      evidenceTypes,
      reportRecipientType,
      categories: categories
        .filter((category) => category.name.trim())
        .map((category) => ({
          name: category.name.trim(),
          target: Number(category.target) || 0,
        })),
    });
  };

  if (!hasCertification)
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">{t(`${KEY}.pickTitle`)}</p>

        <div className="flex flex-wrap gap-2">
          {COMMON_CERTIFICATIONS.map((abbreviation) => (
            <Button
              key={abbreviation}
              size="sm"
              radius="xl"
              variant="outline"
              disabled={isPatching}
              onClick={() => pickCommon(abbreviation)}
            >
              {abbreviation}
            </Button>
          ))}
        </div>

        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t(`${KEY}.searchPlaceholder`)}
          aria-label={t(`${KEY}.searchPlaceholder`)}
        />
        {matches?.length ? (
          <ul className="flex flex-col gap-1">
            {matches.map((item) => (
              <li key={item.id}>
                <Button
                  size="sm"
                  radius="xl"
                  variant="ghost"
                  disabled={isPatching}
                  className="w-full justify-start"
                  onClick={() => onPatch({ certificationId: item.id })}
                >
                  {item.abbreviation} — {item.name}
                </Button>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Input
            value={manualName}
            onChange={(event) => setManualName(event.target.value)}
            placeholder={t(`${KEY}.manualPlaceholder`)}
            aria-label={t(`${KEY}.manualPlaceholder`)}
            className="max-w-xs"
          />
          <Button
            size="sm"
            radius="xl"
            variant="outline"
            disabled={!manualName.trim() || isPatching}
            onClick={saveManualName}
          >
            {t(`${KEY}.useManual`)}
          </Button>
        </div>
      </div>
    );

  if (!isEditing)
    return (
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-muted-foreground">
            {t(`${KEY}.certification`)}
          </dt>
          <dd className="text-sm">{draft.certificationName ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">
            {t(`${KEY}.organization`)}
          </dt>
          <dd className="text-sm">{plan?.organization || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">
            {t(`${KEY}.requirement`)}
          </dt>
          <dd className="text-sm">{draft.requiredCredits ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">
            {t(`${KEY}.deadline`)}
          </dt>
          <dd className="text-sm">
            {plan?.reportingEnd
              ? new Date(plan.reportingEnd).toLocaleDateString()
              : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">
            {t(`${KEY}.evidence`)}
          </dt>
          <dd className="text-sm">
            {plan?.evidenceTypes.length
              ? plan.evidenceTypes
                  .map((type) => t(`cpdProgress.evidence.${type}`))
                  .join(", ")
              : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">
            {t(`${KEY}.reportTo`)}
          </dt>
          <dd className="text-sm">
            {recipients?.find(
              (option) => option.type === plan?.reportRecipientType,
            )?.label ?? "—"}
          </dd>
        </div>
        {plan?.categories.length ? (
          <div className="sm:col-span-2">
            <dt className="text-xs text-muted-foreground">
              {t(`${KEY}.categories`)}
            </dt>
            <dd className="mt-1 flex flex-wrap gap-2 text-sm">
              {plan.categories.map((category) => (
                <span key={category.id} className="rounded-md border px-2 py-1">
                  {category.name} ({category.targetCredits})
                </span>
              ))}
            </dd>
          </div>
        ) : null}
      </dl>
    );

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-medium">{draft.certificationName}</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          {t(`${KEY}.organization`)}
          <Input
            value={organization}
            onChange={(event) => setOrganization(event.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          {t(`${KEY}.requirement`)}
          <Input
            type="number"
            value={totalRequiredCredits}
            onChange={(event) => setTotalRequiredCredits(event.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          {t(`${KEY}.deadline`)}
          <Input
            type="date"
            value={reportingEnd}
            onChange={(event) => setReportingEnd(event.target.value)}
          />
        </label>
      </div>

      <div>
        <p className="mb-2 text-sm">{t(`${KEY}.evidence`)}</p>
        <div className="flex flex-wrap gap-2">
          {EVIDENCE_OPTIONS.map((option) => (
            <Button
              key={option}
              size="sm"
              radius="xl"
              type="button"
              aria-pressed={evidenceTypes.includes(option)}
              variant={evidenceTypes.includes(option) ? "default" : "outline"}
              onClick={() => toggleEvidence(option)}
            >
              {t(`cpdProgress.evidence.${option}`)}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm">{t(`${KEY}.reportTo`)}</p>
        <div className="flex flex-wrap gap-2">
          {(recipients ?? []).map((option) => (
            <Button
              key={option.type}
              size="sm"
              radius="xl"
              type="button"
              aria-pressed={reportRecipientType === option.type}
              variant={
                reportRecipientType === option.type ? "default" : "outline"
              }
              onClick={() => setReportRecipientType(option.type)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm">{t(`${KEY}.categories`)}</p>
        <div className="flex flex-col gap-2">
          {categories.map((category, index) => (
            <div key={index} className="flex flex-wrap items-center gap-2">
              <Input
                value={category.name}
                placeholder={t(`${KEY}.categoryName`)}
                onChange={(event) =>
                  updateCategory(index, { name: event.target.value })
                }
                className="max-w-[200px]"
              />
              <Input
                type="number"
                value={category.target}
                placeholder={t(`${KEY}.categoryTarget`)}
                onChange={(event) =>
                  updateCategory(index, { target: event.target.value })
                }
                className="max-w-[100px]"
              />
              <Button
                size="sm"
                radius="xl"
                variant="ghost"
                onClick={() => removeCategory(index)}
              >
                {t(`${KEY}.removeCategory`)}
              </Button>
            </div>
          ))}
          <Button
            size="sm"
            radius="xl"
            variant="outline"
            className="w-fit"
            onClick={addCategory}
          >
            {t(`${KEY}.addCategory`)}
          </Button>
        </div>
      </div>

      <Button
        radius="xl"
        className="w-fit"
        disabled={isPatching}
        onClick={saveFields}
      >
        {t(`${KEY}.saveSetup`)}
      </Button>
    </div>
  );
};
