export const SERVICE_AI_PORT = Symbol("SERVICE_AI_PORT");

export enum RoadmapAiMessageCode {
  ROADMAP_AI_BUSY = "ROADMAP_AI_BUSY",
  ROADMAP_AI_FAILED = "ROADMAP_AI_FAILED",
  ROADMAP_AI_REFUSED = "ROADMAP_AI_REFUSED",
  ROADMAP_AI_UNAVAILABLE = "ROADMAP_AI_UNAVAILABLE",
}

export type PlatformSkillLevel =
  | "BEGINNER"
  | "INTERMEDIATE"
  | "ADVANCED"
  | "EXPERT";

export type PlatformTimeCommitment =
  | "LESS_THAN_ONE_HOUR"
  | "ONE_TO_THREE_HOURS"
  | "FOUR_TO_SIX_HOURS"
  | "SEVEN_TO_TEN_HOURS"
  | "MORE_THAN_TEN_HOURS";

export type PlatformBudgetPreference =
  | "FREE_ONLY"
  | "MIXED_FREE_AND_PAID"
  | "PREMIUM"
  | "EMPLOYER_SPONSORED";

export type PlatformLearningFormat =
  | "COURSE"
  | "WEBINAR"
  | "WORKSHOP"
  | "VIDEO"
  | "PODCAST"
  | "ARTICLE";

export type PlatformContentType = "EVENT" | "COURSE" | "PODCAST" | "YOUTUBE";

export type PlatformChatRole = "ASSISTANT" | "PROFESSIONAL" | "SYSTEM";

export type PlatformDraftStep =
  | "GOAL"
  | "GOAL_REASON"
  | "CONTEXT"
  | "TARGET_DATE"
  | "PREFERENCES"
  | "CPD_TRACKING"
  | "CERTIFICATION"
  | "CPD_REQUIREMENTS"
  | "REVIEW";

export type PlatformLocale = "en" | "fa";

export type RoadmapSection = "GOAL" | "PREFERENCES" | "CPD_SETUP" | "REVIEW";

export type RoadmapDraftField =
  | "goal"
  | "targetRole"
  | "goalReason"
  | "context"
  | "targetDate"
  | "skillLevel"
  | "timeCommitment"
  | "budgetPreference"
  | "subjects"
  | "preferredFormats"
  | "preferredContentTypes"
  | "cpdEnabled"
  | "certificationName";

export type RoadmapDraftState = {
  goal?: string | null;
  context?: string | null;
  subjects?: string[] | null;
  goalReason?: string | null;
  targetRole?: string | null;
  targetDate?: Date | null;
  cpdEnabled?: boolean | null;
  certificationName?: string | null;
  skillLevel?: PlatformSkillLevel | null;
  timeCommitment?: PlatformTimeCommitment | null;
  preferredFormats?: PlatformLearningFormat[] | null;
  budgetPreference?: PlatformBudgetPreference | null;
  preferredContentTypes?: PlatformContentType[] | null;
};

export type RoadmapChatEntry = { role: PlatformChatRole; content: string };

export type RoadmapSubjectOption = { id: string; label: string };

export type RoadmapWidget = {
  field: RoadmapDraftField;
  maxSelections: number | null;
  options: { value: string; label: string }[];
  type: "TEXT" | "SINGLE_SELECT" | "MULTI_SELECT" | "DATE" | "YES_NO";
};

export type ChatTurnInput = {
  today: Date;
  draft: RoadmapDraftState;
  locale?: PlatformLocale;
  currentStep: PlatformDraftStep;
  userMessage?: string | null;
  history?: RoadmapChatEntry[];
  subjectOptions?: RoadmapSubjectOption[];
};

export type ChatTurnData = {
  isComplete: boolean;
  assistantMessage: string;
  needsClarification: boolean;
  widget: RoadmapWidget | null;
  extracted: RoadmapDraftState;
  clearedFields: RoadmapDraftField[];
  suggestedNextSection: RoadmapSection | null;
};

export type RoadmapContentCandidate = {
  title: string;
  isFree: boolean;
  contentId: string;
  tags?: string[];
  summary?: string | null;
  credits?: number | null;
  durationMinutes?: number | null;
  contentType: PlatformContentType;
  level?: PlatformSkillLevel | null;
};

export type RoadmapCpdContext = {
  organization: string;
  certificationName: string;
  reportingEnd?: Date | null;
  completedCredits: number;
  remainingCredits: number;
  totalRequiredCredits: number;
};

export type GenerateInput = {
  today: Date;
  maxPhases?: number;
  locale?: PlatformLocale;
  draft: RoadmapDraftState;
  cpd?: RoadmapCpdContext | null;
  candidates: RoadmapContentCandidate[];
  subjectOptions?: RoadmapSubjectOption[];
};

export type GeneratedRoadmapStep = {
  order: number;
  title: string;
  description: string;
  contentId: string | null;
  estimatedMinutes: number | null;
  contentType: PlatformContentType | null;
};

export type GeneratedRoadmapPhase = {
  order: number;
  title: string;
  description: string;
  estimatedWeeks: number;
  steps: GeneratedRoadmapStep[];
};

export type GenerateData = {
  title: string;
  description: string;
  estimatedWeeks: number;
  level: PlatformSkillLevel;
  coverageNote: string | null;
  phases: GeneratedRoadmapPhase[];
};

export type ServiceAiFailure =
  | {
      ok: false;
      kind: "unavailable";
      retryable: boolean;
      messageCode: RoadmapAiMessageCode.ROADMAP_AI_UNAVAILABLE;
    }
  | {
      ok: false;
      kind: "failed";
      retryable: boolean;
      messageCode: RoadmapAiMessageCode.ROADMAP_AI_FAILED;
    }
  | {
      ok: false;
      kind: "refused";
      retryable: boolean;
      messageCode: RoadmapAiMessageCode.ROADMAP_AI_REFUSED;
    }
  | {
      ok: false;
      kind: "busy";
      retryable: boolean;
      messageCode: RoadmapAiMessageCode.ROADMAP_AI_BUSY;
      /** The provider's advertised wait. Null when it advertised none. */
      retryAfterSeconds: number | null;
    }
  | {
      ok: false;
      kind: "truncated";
      retryable: boolean;
      messageCode: RoadmapAiMessageCode.ROADMAP_AI_FAILED;
      recovery: "REDUCE_CANDIDATES";
    };

export type ServiceAiResult<TData> =
  | { ok: true; data: TData }
  | ServiceAiFailure;

export class ServiceAiRequestError extends Error {
  constructor(
    readonly limit: string,
    readonly actual: number,
    readonly allowed: number,
  ) {
    super(
      `Roadmap AI request breaches ${limit}: ${actual} exceeds ${allowed}.`,
    );
    this.name = "ServiceAiRequestError";
  }
}

export interface ServiceAiPort {
  chatTurn(input: ChatTurnInput): Promise<ServiceAiResult<ChatTurnData>>;
  generate(input: GenerateInput): Promise<ServiceAiResult<GenerateData>>;
}
