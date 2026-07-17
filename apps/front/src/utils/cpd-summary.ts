import { ProfessionalPduActivityFieldsFragment } from "@/lib/graphql/generated";
import { TCpdPlan, TCpdPlanProgress } from "@/types/cpd-plan.types";

type CsvCell = string | number | null | undefined;

const formatDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString() : "";

const toCsv = (rows: CsvCell[][]): string =>
  rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`)
        .join(","),
    )
    .join("\n");

export const buildCpdSummaryCsv = (
  plan: TCpdPlan,
  progress: TCpdPlanProgress,
  activities: ProfessionalPduActivityFieldsFragment[],
): string => {
  const rows: CsvCell[][] = [
    ["CPD / PDU Summary"],
    ["Generated", new Date().toLocaleString()],
    [],
    ["Certification / Licence", plan.certificationName],
    ["Association / Organization", plan.organization],
    [
      "Reporting Period",
      `${formatDate(plan.reportingStart)} - ${formatDate(plan.reportingEnd)}`,
    ],
    ["Credit Type", plan.creditType],
    ["Total Required Credits", progress.totalRequiredCredits],
    ["Baseline Completed Credits", progress.initialCompletedCredits],
    ["Credits From Activities", progress.activityCredits],
    ["Earned Credits", progress.earnedCredits],
    ["Remaining Credits", progress.remainingCredits],
    ["Overall Progress", `${progress.progressPercent.toFixed(1)}%`],
    ["Compliance Status", progress.complianceStatus],
    ["Report Recipient", plan.reportRecipientLabel ?? plan.reportRecipientType],
    ["Evidence Required", plan.evidenceTypes.join(" | ")],
    ["Activities Counted", progress.activitiesCounted],
    ["Categories Missing", progress.categoriesMissing],
    ["Evidence Missing", progress.evidenceMissing],
    [],
    ["Category Breakdown"],
    ["Category", "Target", "Completed", "Remaining", "Progress", "Status"],
    ...progress.categories.map((category) => [
      category.name,
      category.target,
      category.completed,
      category.remaining,
      `${category.progress.toFixed(1)}%`,
      category.isComplete ? "Complete" : "Below target",
    ]),
    [],
    ["Missing Requirements"],
    ...(progress.missingRequirements.length
      ? progress.missingRequirements.map((item) => [
          item.code,
          item.detail ?? "",
        ])
      : [["None", ""]]),
    [],
    ["Learning Activities Included"],
    [
      "Activity",
      "Type",
      "Date",
      "Credit Type",
      "Credits",
      "Status",
      "Provider",
      "Evidence",
    ],
    ...activities.map((activity) => [
      activity.title,
      activity.source,
      formatDate(activity.date),
      activity.creditType,
      activity.pdus,
      activity.status,
      activity.providerOrganizer ?? "",
      activity.evidenceFiles.length ? "Attached" : "None",
    ]),
  ];

  return toCsv(rows);
};

export const downloadCsv = (filename: string, csv: string) => {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};
