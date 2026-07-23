export const PROFESSIONAL_OVERVIEW_LINKS = {
  cpdProgress: "/dashboard/professional?tab=cpd-pdu-progress",
  roadmap: "/dashboard/professional?tab=roadmap",
  calendar: "/dashboard/professional?tab=calendar",
  activities: "/dashboard/professional?tab=cpd-pdu-tracker",
  certificates: "/dashboard/professional?tab=certificates",
} as const;

export const CERTIFICATE_EXPIRING_WINDOW_DAYS = 30;

const EARNED_COLOR = "#2563eb";
const REMAINING_COLOR = "#e2e8f0";
const COMPLETED_COLOR = "#14b8a6";

export type OverviewSectionState = "loading" | "error" | "empty" | "content";

export const getOverviewSectionState = ({
  isLoading,
  isError,
  isEmpty,
}: {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
}): OverviewSectionState => {
  if (isLoading) return "loading";
  if (isError) return "error";
  if (isEmpty) return "empty";
  return "content";
};

export type DonutSlice = {
  name: string;
  label: string;
  value: number;
  fill: string;
};

const toFiniteNumber = (value: unknown): number => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const roundTo = (value: number, decimals = 0): number => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

export const clampPercent = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(value, 0), 100);
};

export const getDaysRemaining = (
  dateIso?: string | null,
  now: Date = new Date(),
): number | null => {
  if (!dateIso) return null;
  const target = new Date(dateIso).getTime();
  if (!Number.isFinite(target)) return null;
  const diffMs = target - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

// ===================== CPD / PDU Progress =====================

export type CpdProgressInput = {
  earnedCredits?: number | null;
  remainingCredits?: number | null;
  totalRequiredCredits?: number | null;
  progressPercent?: number | null;
};

export type CpdProgressView = {
  earned: number;
  remaining: number;
  total: number;
  hasTarget: boolean;
  percent: number;
  chartPercent: number;
  exceeded: boolean;
  overAmount: number;
  earnedLabel: string;
  remainingLabel: string;
  chartData: DonutSlice[];
};

export const buildCpdProgressView = (
  progress: CpdProgressInput,
  labels: { earned: string; remaining: string },
): CpdProgressView => {
  const earned = Math.max(toFiniteNumber(progress.earnedCredits), 0);
  const total = Math.max(toFiniteNumber(progress.totalRequiredCredits), 0);
  const hasTarget = total > 0;

  const remaining = hasTarget ? Math.max(total - earned, 0) : 0;
  const earnedForArc = hasTarget ? Math.min(earned, total) : earned;

  const percent = hasTarget
    ? roundTo((earned / total) * 100)
    : Math.max(roundTo(toFiniteNumber(progress.progressPercent)), 0);
  const chartPercent = clampPercent(percent);
  const exceeded = hasTarget && earned > total;
  const overAmount = exceeded ? roundTo(earned - total, 2) : 0;

  const chartData: DonutSlice[] = [];
  if (earnedForArc > 0) {
    chartData.push({
      name: "earned",
      label: labels.earned,
      value: earnedForArc,
      fill: EARNED_COLOR,
    });
  }
  if (!hasTarget && earnedForArc <= 0) {
    chartData.push({
      name: "remaining",
      label: labels.remaining,
      value: 1,
      fill: REMAINING_COLOR,
    });
  } else if (remaining > 0) {
    chartData.push({
      name: "remaining",
      label: labels.remaining,
      value: remaining,
      fill: REMAINING_COLOR,
    });
  }

  return {
    earned: roundTo(earned, 2),
    remaining: roundTo(remaining, 2),
    total: roundTo(total, 2),
    hasTarget,
    percent,
    chartPercent,
    exceeded,
    overAmount,
    earnedLabel: labels.earned,
    remainingLabel: labels.remaining,
    chartData,
  };
};

// ===================== Learning Roadmap Progress =====================

export type RoadmapProgressInput = {
  totalSteps?: number | null;
  completedSteps?: number | null;
  progress?: number | null;
  completedPhases?: number | null;
  phasesCount?: number | null;
  nextPhaseTitle?: string | null;
  roadmapStatus?: string | null;
  title?: string | null;
};

export type RoadmapProgressView = {
  total: number;
  completed: number;
  remaining: number;
  percent: number;
  chartPercent: number;
  completedPhases: number;
  phasesCount: number;
  chartData: DonutSlice[];
};

export const buildRoadmapProgressView = (
  roadmap: RoadmapProgressInput,
  labels: { completed: string; remaining: string },
): RoadmapProgressView => {
  const total = Math.max(toFiniteNumber(roadmap.totalSteps), 0);
  const completedRaw = Math.max(toFiniteNumber(roadmap.completedSteps), 0);
  const completed = total > 0 ? Math.min(completedRaw, total) : completedRaw;
  const remaining = total > 0 ? Math.max(total - completed, 0) : 0;

  const percent =
    total > 0
      ? roundTo((completed / total) * 100)
      : clampPercent(roundTo(toFiniteNumber(roadmap.progress)));
  const chartPercent = clampPercent(percent);

  const chartData: DonutSlice[] = [];
  if (completed > 0) {
    chartData.push({
      name: "completed",
      label: labels.completed,
      value: completed,
      fill: COMPLETED_COLOR,
    });
  }
  if (remaining > 0 || completed <= 0) {
    chartData.push({
      name: "remaining",
      label: labels.remaining,
      value: remaining > 0 ? remaining : 1,
      fill: REMAINING_COLOR,
    });
  }

  return {
    total,
    completed,
    remaining,
    percent,
    chartPercent,
    completedPhases: Math.max(toFiniteNumber(roadmap.completedPhases), 0),
    phasesCount: Math.max(toFiniteNumber(roadmap.phasesCount), 0),
    chartData,
  };
};

// ===================== Upcoming Calendar Items =====================

export type UpcomingRegistrationInput = {
  id: string;
  status?: string | null;
  isPast?: boolean | null;
  isUpcoming?: boolean | null;
  event?: {
    title?: string | null;
    type?: string | null;
    startDate?: string | null;
    location?: string | null;
    onlineUrl?: string | null;
    deliveryMode?: string | null;
  } | null;
};

export type UpcomingManualInput = {
  id: string;
  title?: string | null;
  type?: string | null;
  startDate?: string | null;
  isPast?: boolean | null;
  isUpcoming?: boolean | null;
};

export type UpcomingCalendarItem = {
  id: string;
  title: string;
  startDate: string | null;
  type: string | null;
  isOnline: boolean;
  location: string | null;
  source: "registration" | "manual";
  daysRemaining: number | null;
};

const isCancelled = (status?: string | null): boolean =>
  (status ?? "").toUpperCase() === "CANCELLED";

export const buildUpcomingCalendarItems = ({
  registrations = [],
  manual = [],
  now = new Date(),
  limit = 4,
}: {
  registrations?: UpcomingRegistrationInput[];
  manual?: UpcomingManualInput[];
  now?: Date;
  limit?: number;
}): UpcomingCalendarItem[] => {
  const fromRegistrations: UpcomingCalendarItem[] = registrations
    .filter(
      (item) =>
        item.isUpcoming === true &&
        !item.isPast &&
        !isCancelled(item.status) &&
        Boolean(item.event?.startDate),
    )
    .map((item) => {
      const startDate = item.event?.startDate ?? null;
      const isOnline =
        Boolean(item.event?.onlineUrl) ||
        (item.event?.deliveryMode ?? "").toUpperCase() === "ONLINE";
      return {
        id: `registration:${item.id}`,
        title: item.event?.title ?? "",
        startDate,
        type: item.event?.type ?? null,
        isOnline,
        location: item.event?.location ?? null,
        source: "registration" as const,
        daysRemaining: getDaysRemaining(startDate, now),
      };
    });

  const fromManual: UpcomingCalendarItem[] = manual
    .filter(
      (item) =>
        item.isUpcoming === true && !item.isPast && Boolean(item.startDate),
    )
    .map((item) => {
      const startDate = item.startDate ?? null;
      return {
        id: `manual:${item.id}`,
        title: item.title ?? "",
        startDate,
        type: item.type ?? null,
        isOnline: false,
        location: null,
        source: "manual" as const,
        daysRemaining: getDaysRemaining(startDate, now),
      };
    });

  return [...fromRegistrations, ...fromManual]
    .sort((a, b) => {
      const aTime = a.startDate ? new Date(a.startDate).getTime() : Infinity;
      const bTime = b.startDate ? new Date(b.startDate).getTime() : Infinity;
      return aTime - bTime;
    })
    .slice(0, limit);
};

// ===================== Certificates summary =====================

export type CertificateInput = {
  id: string;
  status?: string | null;
  validUntil?: string | null;
  issuedAt?: string | null;
};

export type CertificatesSummaryInput = {
  items?: CertificateInput[] | null;
  activeCertificates?: number | null;
  totalCertificates?: number | null;
};

export type CertificatesSummaryView = {
  activeCount: number;
  totalCount: number;
  expiringSoonCount: number;
  nearestExpiry: string | null;
  recentlyUploaded: CertificateInput | null;
};

export const buildCertificatesSummary = ({
  data,
  now = new Date(),
  windowDays = CERTIFICATE_EXPIRING_WINDOW_DAYS,
}: {
  data: CertificatesSummaryInput;
  now?: Date;
  windowDays?: number;
}): CertificatesSummaryView => {
  const items = data.items ?? [];

  const activeCount =
    typeof data.activeCertificates === "number"
      ? data.activeCertificates
      : items.filter((item) => (item.status ?? "").toUpperCase() === "ACTIVE")
          .length;

  const totalCount =
    typeof data.totalCertificates === "number"
      ? data.totalCertificates
      : items.length;

  let expiringSoonCount = 0;
  let nearestExpiry: string | null = null;
  let nearestExpiryTime = Infinity;

  for (const item of items) {
    const days = getDaysRemaining(item.validUntil, now);
    if (days === null) continue;
    if (days >= 0 && days <= windowDays) expiringSoonCount += 1;
    if (days >= 0) {
      const time = new Date(item.validUntil as string).getTime();
      if (time < nearestExpiryTime) {
        nearestExpiryTime = time;
        nearestExpiry = item.validUntil ?? null;
      }
    }
  }

  return {
    activeCount,
    totalCount,
    expiringSoonCount,
    nearestExpiry,
    recentlyUploaded: items[0] ?? null,
  };
};
