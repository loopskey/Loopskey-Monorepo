export const LANDING_HIGHLIGHT_KEYS = [
  "catalog",
  "formats",
  "certifications",
] as const;

export const LANDING_STEP_KEYS = [
  "addGoal",
  "getPlan",
  "trackCredits",
] as const;

export const LANDING_SERVICE_KEYS = [
  "certificationManagement",
  "learningCatalog",
  "aiRecommendations",
  "personalDashboard",
] as const;

export const ROADMAP_BENEFIT_KEYS = [
  "aiSequencing",
  "eventSlotting",
  "progressTracking",
  "adaptiveRoadmap",
] as const;

export const ORGANIZATION_BENEFIT_KEYS = [
  "defineMembers",
  "publishContent",
  "trackProgress",
  "memberReports",
] as const;

export const LANDING_AUDIENCES = [
  { key: "professional", role: "PROFESSIONAL" },
  { key: "association", role: "ASSOCIATION" },
  { key: "organization", role: "ORGANIZATION" },
] as const;

export const LANDING_FAQ_IDS = [
  "roadmap-personalization",
  "cert-storage",
  "cert-expiry",
  "ai-override",
  "platform-free-plan",
  "providers-listing",
] as const;

export type RoadmapSampleStatus = "done" | "active" | "upcoming";

export type RoadmapSampleStep = {
  key: "fundamentals" | "agile" | "risk" | "exam";
  status: RoadmapSampleStatus;
  hours?: number;
  date?: { value: number; style: "dayMonth" | "month" };
};

export const ROADMAP_SAMPLE_STEPS: readonly RoadmapSampleStep[] = [
  { key: "fundamentals", status: "done", hours: 12 },
  {
    key: "agile",
    status: "active",
    date: { value: Date.UTC(2026, 10, 12), style: "dayMonth" },
  },
  { key: "risk", status: "upcoming", hours: 8 },
  {
    key: "exam",
    status: "upcoming",
    date: { value: Date.UTC(2027, 2, 1), style: "month" },
  },
];

export const ROADMAP_SAMPLE_HOURS = { completed: 18, target: 35 } as const;

export const ORGANIZATION_SAMPLE = {
  members: 1248,
  publishedContent: 86,
  status: [
    { key: "onTrack", share: 0.76 },
    { key: "atRisk", share: 0.18 },
    { key: "overdue", share: 0.06 },
  ],
  topContent: [
    { key: "ethics", completion: 0.82 },
    { key: "standards", completion: 0.67 },
    { key: "leadership", completion: 0.51 },
  ],
} as const;

export const HERO_SAMPLE_CREDITS = { earned: 42, total: 60 } as const;
