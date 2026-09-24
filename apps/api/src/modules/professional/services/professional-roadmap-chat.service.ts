import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import {
  AppLanguage,
  Prisma,
  ProfileTaxonomyKind,
  ProfileTermUsage,
  RoadmapChatRole,
  RoadmapDraftStatus,
  RoadmapDraftStep,
  Role,
} from "@prisma/client";
import {
  RoadmapAiMessageCode,
  SERVICE_AI_PORT,
  type ChatTurnData,
  type RoadmapChatEntry,
  type RoadmapDraftField,
  type RoadmapDraftState,
  type RoadmapWidget,
  type RoadmapWidgetField,
  type ServiceAiPort,
  SERVICE_AI_LIMITS,
} from "@infrastructure/service-ai/service-ai.port";
import { ProfessionalRoadmapDraftService } from "@professional/services/professional-roadmap-draft.service";
import { RoadmapSuggestionOptionsInput } from "@professional/dtos/roadmap-suggestion-options.input";
import { ProfessionalPaginationInput } from "@professional/dtos/professional-pagination.input";
import { firstMissingPreferenceField } from "@professional/utils/roadmap-preference-fields.util";
import { ProfessionalCpdPlanService } from "@professional/services/professional-cpd-plan.service";
import { ProfessionalProfileService } from "@professional/services/professional-profile.service";
import { CertificationSearchService } from "@professional/services/certification-search.service";
import { isPreferenceFieldAnswered } from "@professional/utils/roadmap-preference-fields.util";
import { PatchRoadmapCpdSetupInput } from "@professional/dtos/patch-roadmap-cpd-setup.input";
import { ProfessionalMessageCode } from "@professional/enums/message-code.enum";
import { draftCompletionSummary } from "@professional/utils/roadmap-step-machine.util";
import { PatchRoadmapDraftInput } from "@professional/dtos/patch-roadmap-draft.input";
import { RoadmapDraftFieldKey } from "@professional/enums/roadmap-draft.enum";
import { mergeExtractedFields } from "@professional/utils/roadmap-draft-merge.util";
import { RoadmapChatTurnInput } from "@professional/dtos/roadmap-chat-turn.input";
import { mapGenerationFailure } from "@professional/utils/roadmap-generation-failure.util";
import { COACH_QUESTION_CODE } from "@professional/utils/roadmap-coach.util";
import { PREFERENCE_FIELDS } from "@professional/utils/roadmap-preference-fields.util";
import { groupKeysMatching } from "@professional/utils/roadmap-relevance.util";
import { COACH_INTRO_CODE } from "@professional/utils/roadmap-coach.util";
import { defaultWidgetFor } from "@professional/utils/roadmap-coach.util";
import { subjectLabelsOf } from "@professional/utils/roadmap-draft-merge.util";
import { isDraftComplete } from "@professional/utils/roadmap-step-machine.util";
import { requestContext } from "@infrastructure/observability/request-context";
import { validateWidget } from "@professional/utils/roadmap-widget-validation.util";
import { isCoachMessage } from "@professional/utils/roadmap-coach.util";
import { PrismaService } from "@prisma/prisma.service";
import { fieldForStep } from "@professional/utils/roadmap-coach.util";
import { rankTerms } from "@professional/utils/roadmap-relevance.util";
import { hadValue } from "@professional/utils/roadmap-coach.util";
import { nextStep } from "@professional/utils/roadmap-step-machine.util";
import { TUser } from "@common/types/user.types";

import { type RankableTerm } from "@professional/utils/roadmap-relevance.util";
import { type CertificationOption } from "@professional/utils/roadmap-widget-validation.util";

import * as T from "@professional/types/professional-roadmap-chat.types";

const CHIP_LIMIT = 8;
const CERTIFICATION_SEARCH_LIMIT = 8;

type DraftRow = Prisma.RoadmapDraftGetPayload<object>;
type MessageRow = Prisma.RoadmapChatMessageGetPayload<object>;

const PATCHABLE_FIELDS = [
  "goal",
  "targetRole",
  "goalReason",
  "context",
  "targetDate",
  "skillLevel",
  "timeCommitment",
  "budgetPreference",
  "subjects",
  "preferredFormats",
  "preferredContentTypes",
  "preferredDeliveryFormats",
  "cpdEnabled",
  "certificationId",
  "certificationName",
  "requiredCredits",
  "completedCredits",
] as const satisfies readonly (keyof T.RoadmapDraftFields)[];

type PatchableField = (typeof PATCHABLE_FIELDS)[number];

const PATCHABLE_STATUS: RoadmapDraftStatus[] = [
  RoadmapDraftStatus.COLLECTING,
  RoadmapDraftStatus.READY,
  RoadmapDraftStatus.FAILED,
];

const PATCH_ANSWERS: Partial<Record<PatchableField, RoadmapDraftField>> = {
  goal: "goal",
  targetRole: "targetRole",
  goalReason: "goalReason",
  context: "context",
  targetDate: "targetDate",
  skillLevel: "skillLevel",
  timeCommitment: "timeCommitment",
  budgetPreference: "budgetPreference",
  subjects: "subjects",
  preferredFormats: "preferredFormats",
  preferredContentTypes: "preferredContentTypes",
  cpdEnabled: "cpdEnabled",
  certificationName: "certificationName",
};

class RoadmapDraftLockedException extends HttpException {
  constructor() {
    super(
      {
        code: ProfessionalMessageCode.ROADMAP_DRAFT_LOCKED,
        message: ProfessionalMessageCode.ROADMAP_DRAFT_LOCKED,
      },
      409,
    );
  }
}

@Injectable()
export class ProfessionalRoadmapChatService {
  private readonly logger = new Logger(ProfessionalRoadmapChatService.name);
  private readonly inFlight = new Map<string, Promise<unknown>>();

  constructor(
    @Inject(SERVICE_AI_PORT) private readonly serviceAi: ServiceAiPort,
    private readonly drafts: ProfessionalRoadmapDraftService,
    private readonly profiles: ProfessionalProfileService,
    private readonly cpdPlans: ProfessionalCpdPlanService,
    private readonly certifications: CertificationSearchService,
    private readonly prisma: PrismaService,
  ) {}

  private assertProfessional(user: TUser) {
    if (user.role !== Role.PROFESSIONAL)
      throw new ForbiddenException(
        ProfessionalMessageCode.PROFESSIONAL_ACCESS_REQUIRED,
      );
  }

  private serialize<TResult>(
    draftId: string,
    run: () => Promise<TResult>,
  ): Promise<TResult> {
    const previous = this.inFlight.get(draftId) ?? Promise.resolve();
    const next = previous.then(run, run);
    this.inFlight.set(
      draftId,
      next.catch(() => undefined),
    );
    return next.finally(() => {
      if (this.inFlight.get(draftId) === next) this.inFlight.delete(draftId);
    });
  }

  private async ownedDraft(user: TUser, draftId: string) {
    const draft = await this.drafts.findDraft(user.id, draftId);
    if (!draft)
      throw new NotFoundException(
        ProfessionalMessageCode.ROADMAP_DRAFT_NOT_FOUND,
      );
    return draft;
  }

  private async subjectOptions(user: TUser): Promise<T.RoadmapSubjectOption[]> {
    const groups = await this.profiles.taxonomy(
      user,
      ProfileTaxonomyKind.SUBJECT,
    );
    return groups
      .flatMap((group) => group.terms)
      .map((term) => ({
        id: term.id.slice(0, SERVICE_AI_LIMITS.subjectOptionIdMaxLength),
        label: term.label.slice(
          0,
          SERVICE_AI_LIMITS.subjectOptionLabelMaxLength,
        ),
      }))
      .slice(0, SERVICE_AI_LIMITS.subjectOptionsMaxItems);
  }

  private toRankableTerms(
    groups: Awaited<ReturnType<ProfessionalProfileService["taxonomy"]>>,
  ): RankableTerm[] {
    return groups.flatMap((group) =>
      group.terms.map((term) => ({
        id: term.id,
        label: term.label,
        groupKey: group.groupKey,
        groupLabel: group.groupLabel,
      })),
    );
  }

  private async favoredGroupKeys(
    user: TUser,
    targetRole: string | null,
    candidateTerms: readonly RankableTerm[],
  ): Promise<string[]> {
    const owned = await this.prisma.professionalProfileTerm.findMany({
      where: {
        profile: { userId: user.id },
        usage: {
          in: [ProfileTermUsage.MAIN_SKILL, ProfileTermUsage.FAVORITE_SUBJECT],
        },
      },
      select: { term: { select: { groupKey: true } } },
    });
    const direct = owned.map((row) => row.term.groupKey);
    const inferred = groupKeysMatching(targetRole, candidateTerms);
    return [...new Set([...direct, ...inferred])];
  }

  private async relevanceContext(user: TUser, draft: T.RoadmapDraftFields) {
    const [subjectGroups, roleGroups] = await Promise.all([
      this.profiles.taxonomy(user, ProfileTaxonomyKind.SUBJECT),
      this.profiles.taxonomy(user, ProfileTaxonomyKind.ROLE),
    ]);
    const subjectTerms = this.toRankableTerms(subjectGroups);
    const roleTerms = this.toRankableTerms(roleGroups);
    const favored = await this.favoredGroupKeys(user, draft.targetRole, [
      ...subjectTerms,
      ...roleTerms,
    ]);
    const text = [draft.goal, draft.targetRole, draft.context];

    return {
      rankedSubjects: rankTerms(subjectTerms, {
        text,
        favoredGroupKeys: favored,
        selectedIds: draft.subjects,
      }),
      rankedRoles: rankTerms(roleTerms, {
        text,
        favoredGroupKeys: favored,
        selectedIds: [],
      }),
    };
  }

  private async rankedCertifications(
    user: TUser,
    draft: T.RoadmapDraftFields,
    subjectOptions: T.RoadmapSubjectOption[],
  ): Promise<CertificationOption[]> {
    const seed = [
      draft.goal,
      draft.targetRole,
      ...subjectLabelsOf(draft.subjects, subjectOptions),
    ]
      .filter((value): value is string => Boolean(value?.trim()))
      .join(" ");
    if (!seed.trim()) return [];

    const results = await this.certifications.search(user, {
      query: seed.slice(0, 120),
      limit: CERTIFICATION_SEARCH_LIMIT,
    });
    return results.map((certification) => ({
      value: certification.name,
      label: certification.abbreviation
        ? `${certification.abbreviation} — ${certification.name}`
        : certification.name,
    }));
  }

  private async widgetContext(
    user: TUser,
    draft: T.RoadmapDraftFields,
    subjectOptions: T.RoadmapSubjectOption[],
  ) {
    const { rankedSubjects, rankedRoles } = await this.relevanceContext(
      user,
      draft,
    );
    const rankedCertifications = await this.rankedCertifications(
      user,
      draft,
      subjectOptions,
    );
    return { rankedSubjects, rankedRoles, rankedCertifications };
  }

  private async userLocale(user: TUser): Promise<AppLanguage> {
    const settings = await this.prisma.professionalSettings.findUnique({
      where: { userId: user.id },
      select: { interfaceLanguage: true },
    });
    return settings?.interfaceLanguage ?? AppLanguage.EN;
  }

  private fields(draft: DraftRow): T.RoadmapDraftFields {
    return {
      goal: draft.goal,
      targetRole: draft.targetRole,
      goalReason: draft.goalReason,
      context: draft.context,
      targetDate: draft.targetDate,
      skillLevel: draft.skillLevel,
      timeCommitment: draft.timeCommitment,
      budgetPreference: draft.budgetPreference,
      subjects: draft.subjects,
      preferredFormats: draft.preferredFormats,
      preferredContentTypes: draft.preferredContentTypes,
      preferredDeliveryFormats: draft.preferredDeliveryFormats,
      cpdEnabled: draft.cpdEnabled,
      certificationId: draft.certificationId,
      certificationName: draft.certificationName,
      requiredCredits: draft.requiredCredits,
      completedCredits: draft.completedCredits,
    };
  }

  private toProviderDraft(
    fields: T.RoadmapDraftFields,
    subjectOptions: T.RoadmapSubjectOption[],
  ): RoadmapDraftState {
    return {
      goal: fields.goal,
      context: fields.context,
      subjects: subjectLabelsOf(fields.subjects, subjectOptions),
      goalReason: fields.goalReason,
      targetRole: fields.targetRole,
      targetDate: fields.targetDate,
      cpdEnabled: fields.cpdEnabled,
      certificationName: fields.certificationName,
      skillLevel: fields.skillLevel,
      timeCommitment: fields.timeCommitment,
      preferredFormats: fields.preferredFormats,
      budgetPreference: fields.budgetPreference,
      preferredContentTypes: fields.preferredContentTypes,
    };
  }

  private toHistory(messages: MessageRow[]): RoadmapChatEntry[] {
    return messages
      .filter((message) => message.role !== RoadmapChatRole.SYSTEM)
      .filter((message) => !isCoachMessage(message.content))
      .filter((message) => message.content.trim().length > 0)
      .slice(-SERVICE_AI_LIMITS.historyMaxItems)
      .map((message) => ({
        role: message.role,
        content: message.content.slice(
          0,
          SERVICE_AI_LIMITS.historyMessageMaxLength,
        ),
      }));
  }

  private toWidget(value: Prisma.JsonValue | null): RoadmapWidget | null {
    if (!value || typeof value !== "object" || Array.isArray(value))
      return null;
    return value as unknown as RoadmapWidget;
  }

  private toWidgetJson(widget: RoadmapWidget | null): Prisma.InputJsonValue {
    return (widget ?? Prisma.JsonNull) as unknown as Prisma.InputJsonValue;
  }

  private async view(
    user: TUser,
    draft: DraftRow,
    pagination?: ProfessionalPaginationInput,
  ) {
    const fields = this.fields(draft);
    const [transcript, subjectOptions, cpdPlan] = await Promise.all([
      this.drafts.transcriptPage(user.id, draft.id, pagination),
      this.subjectOptions(user),
      draft.cpdPlanId ? this.cpdPlans.plan(user, draft.cpdPlanId) : null,
    ]);
    const pending = await this.drafts.lastAssistantMessage(user.id, draft.id);
    const completion = draftCompletionSummary({
      draft: fields,
      currentStep: draft.currentStep,
    });
    return {
      ...fields,
      id: draft.id,
      status: draft.status,
      failureReason: draft.failureReason,
      failure: mapGenerationFailure(draft.failureReason),
      updatedAt: draft.updatedAt,
      currentStep: draft.currentStep,
      needsClarification: draft.needsClarification,
      wasRefused: draft.wasRefused,
      isComplete: isDraftComplete(fields),
      completedFieldCount: completion.completedFieldCount,
      requiredFieldCount: completion.requiredFieldCount,
      remainingFields: completion.remainingFields,
      widget: pending ? this.toWidget(pending.widget) : null,
      subjectOptions,
      cpdPlan,
      transcript: transcript ?? {
        items: [],
        totalCount: 0,
        pageInfo: { hasNextPage: false, nextCursor: null },
      },
    };
  }

  private async turnInput(
    user: TUser,
    draft: DraftRow,
    userMessage: string | null,
  ) {
    const fields = this.fields(draft);
    const [messages, fullSubjectOptions] = await Promise.all([
      this.drafts.transcript(user.id, draft.id),
      this.subjectOptions(user),
    ]);
    const widgetContext = await this.widgetContext(
      user,
      fields,
      fullSubjectOptions,
    );

    const rankedSubjectOptions = widgetContext.rankedSubjects
      .slice(0, CHIP_LIMIT)
      .map((term) => ({ id: term.id, label: term.label }));

    return {
      today: new Date(),
      currentStep: draft.currentStep,
      draft: this.toProviderDraft(fields, fullSubjectOptions),
      history: this.toHistory(messages ?? []),
      locale: "en" as const,
      subjectOptions: rankedSubjectOptions,
      userMessage,
      fullSubjectOptions,
      widgetContext,
    };
  }

  private raise(failure: {
    kind: string;
    messageCode: RoadmapAiMessageCode;
    retryAfterSeconds?: number | null;
  }): never {
    if (failure.messageCode === RoadmapAiMessageCode.ROADMAP_AI_BUSY)
      throw new HttpException(
        {
          code: failure.messageCode,
          message: failure.messageCode,
          details: { retryAfterSeconds: failure.retryAfterSeconds ?? null },
        },
        429,
      );
    throw new ServiceUnavailableException({
      code: failure.messageCode,
      message: failure.messageCode,
    });
  }

  private async recordProfessionalMessage(
    user: TUser,
    draft: DraftRow,
    content: string,
  ) {
    const messages = (await this.drafts.transcript(user.id, draft.id)) ?? [];
    const last = messages.at(-1);
    if (last?.role === RoadmapChatRole.PROFESSIONAL && last.content === content)
      return;
    await this.drafts.appendMessage(user.id, draft.id, {
      content,
      role: RoadmapChatRole.PROFESSIONAL,
      stepKey: draft.currentStep,
    });
  }

  private async applyTurn(
    user: TUser,
    draft: DraftRow,
    data: ChatTurnData,
    turn: Awaited<ReturnType<ProfessionalRoadmapChatService["turnInput"]>>,
  ) {
    const { fullSubjectOptions, widgetContext } = turn;
    const current = this.fields(draft);
    const previousStep = draft.currentStep;
    const { changes, answered } = mergeExtractedFields({
      current,
      subjectOptions: fullSubjectOptions,
      extracted: data.extracted,
      cleared: data.clearedFields,
    });
    const merged = { ...current, ...changes };
    const credits = await this.creditsFor(user, current, merged);
    Object.assign(merged, credits);

    const step = data.needsClarification
      ? draft.currentStep
      : nextStep({ draft: merged, currentStep: draft.currentStep, answered });

    const updated = await this.drafts.updateDraft(user.id, draft.id, {
      ...changes,
      ...credits,
      currentStep: step,
      needsClarification: data.needsClarification,
      wasRefused: false,
      status: isDraftComplete(merged)
        ? RoadmapDraftStatus.READY
        : RoadmapDraftStatus.COLLECTING,
    });

    const stepChanged = step !== previousStep;
    const isCorrection = (
      Object.keys(changes) as (keyof T.RoadmapDraftFields)[]
    ).some((key) => hadValue(current[key]));
    const touchedPreference =
      step === RoadmapDraftStep.PREFERENCES &&
      [...answered].some((field) => PREFERENCE_FIELDS.has(field));
    const madeProgress = stepChanged || touchedPreference;

    const validatedWidget = validateWidget(data.widget, widgetContext);
    const locale = data.assistantMessage.trim()
      ? await this.userLocale(user)
      : AppLanguage.EN;
    const providerText =
      locale === AppLanguage.EN ? data.assistantMessage : null;

    if (
      data.assistantMessage.trim() &&
      (data.needsClarification || isCorrection || !madeProgress)
    )
      await this.appendAssistantIfNew(
        user,
        draft.id,
        step,
        providerText ?? COACH_QUESTION_CODE,
        validatedWidget,
      );

    if (!data.needsClarification && madeProgress)
      await this.askProviderAwareQuestion(
        user,
        draft.id,
        step,
        merged,
        widgetContext,
        validatedWidget,
        providerText,
      );

    return updated ?? draft;
  }

  private resolveField(
    step: RoadmapDraftStep,
    merged: T.RoadmapDraftFields,
    providerField: RoadmapWidgetField | null,
  ): RoadmapWidgetField | null {
    if (step === RoadmapDraftStep.PREFERENCES) {
      if (
        providerField &&
        PREFERENCE_FIELDS.has(providerField) &&
        !isPreferenceFieldAnswered(merged, providerField)
      )
        return providerField;
      return firstMissingPreferenceField(merged);
    }
    return fieldForStep(step);
  }

  private async askProviderAwareQuestion(
    user: TUser,
    draftId: string,
    step: RoadmapDraftStep,
    merged: T.RoadmapDraftFields,
    widgetContext: {
      rankedSubjects: readonly RankableTerm[];
      rankedCertifications: readonly CertificationOption[];
    },
    providerWidget: RoadmapWidget | null,
    providerText: string | null,
  ) {
    const field = this.resolveField(
      step,
      merged,
      providerWidget?.field ?? null,
    );
    if (!field) {
      await this.appendAssistantIfNew(
        user,
        draftId,
        step,
        COACH_QUESTION_CODE,
        null,
      );
      return;
    }

    const usesProviderWidget = providerWidget?.field === field;
    const widget: RoadmapWidget | null = usesProviderWidget
      ? providerWidget
      : defaultWidgetFor(field, {
          rankedSubjects: widgetContext.rankedSubjects.slice(0, CHIP_LIMIT),
          rankedCertifications: widgetContext.rankedCertifications,
        });
    const content =
      usesProviderWidget && providerText ? providerText : COACH_QUESTION_CODE;
    await this.appendAssistantIfNew(user, draftId, step, content, widget);
  }

  private async askCoachQuestion(
    user: TUser,
    draftId: string,
    step: RoadmapDraftStep,
    merged: T.RoadmapDraftFields,
    code: string = COACH_QUESTION_CODE,
  ) {
    if (code !== COACH_QUESTION_CODE) {
      await this.appendAssistantIfNew(user, draftId, step, code, null);
      return;
    }
    const field = this.resolveField(step, merged, null);
    const needsRankedContext =
      field === "subjects" || field === "certificationName";
    const fullSubjectOptions = needsRankedContext
      ? await this.subjectOptions(user)
      : [];
    const widgetContext = needsRankedContext
      ? await this.widgetContext(user, merged, fullSubjectOptions)
      : { rankedSubjects: [], rankedCertifications: [] };
    await this.askProviderAwareQuestion(
      user,
      draftId,
      step,
      merged,
      widgetContext,
      null,
      null,
    );
  }

  private async appendAssistantIfNew(
    user: TUser,
    draftId: string,
    step: RoadmapDraftStep,
    content: string,
    widget: RoadmapWidget | null,
  ) {
    const last = await this.drafts.lastAssistantMessage(user.id, draftId);
    const widgetJson = this.toWidgetJson(widget);
    if (
      last &&
      last.content === content &&
      JSON.stringify(last.widget) === JSON.stringify(widgetJson)
    )
      return;
    await this.drafts.appendMessage(user.id, draftId, {
      content,
      stepKey: step,
      role: RoadmapChatRole.ASSISTANT,
      widget: widgetJson,
    });
  }

  private async creditsFor(
    user: TUser,
    before: T.RoadmapDraftFields,
    after: T.RoadmapDraftFields,
  ) {
    if (!after.cpdEnabled || !after.certificationName) return {};
    if (after.certificationName === before.certificationName) return {};
    const match = await this.drafts.findCertificationByName(
      after.certificationName,
    );
    if (!match) return { certificationId: null };
    const credits = await this.cpdPlans.certificationCredits(user, match.id);
    if (!credits) return { certificationId: null };
    return {
      certificationId: match.id,
      requiredCredits: credits.requiredCredits,
      completedCredits: credits.completedCredits,
    };
  }

  async draft(
    user: TUser,
    draftId?: string,
    pagination?: ProfessionalPaginationInput,
  ) {
    this.assertProfessional(user);
    const draft = draftId
      ? await this.ownedDraft(user, draftId)
      : await this.drafts.findEditableDraft(user.id);
    if (!draft) return null;
    return this.view(user, draft, pagination);
  }

  async suggestionOptions(user: TUser, input: RoadmapSuggestionOptionsInput) {
    this.assertProfessional(user);
    const draft = await this.ownedDraft(user, input.draftId);
    const fields = this.fields(draft);
    const { rankedSubjects, rankedRoles } = await this.relevanceContext(
      user,
      fields,
    );
    const terms =
      input.field === RoadmapDraftFieldKey.SUBJECTS
        ? rankedSubjects
        : rankedRoles;
    const search = input.search?.trim().toLowerCase();
    const filtered = search
      ? terms.filter((term) => term.label.toLowerCase().includes(search))
      : terms;
    return filtered.map((term) => ({
      value: term.id,
      label: term.label,
      groupLabel: term.groupLabel,
    }));
  }

  async startDraft(user: TUser, pagination?: ProfessionalPaginationInput) {
    this.assertProfessional(user);
    const existing = await this.drafts.findEditableDraft(user.id);
    const reusable =
      existing && (await this.drafts.messageCount(user.id, existing.id)) === 0
        ? existing
        : null;
    const draft = reusable ?? (await this.createSeededDraft(user));
    return this.serialize(draft.id, async () => {
      if ((await this.drafts.messageCount(user.id, draft.id)) === 0) {
        const fields = this.fields(draft);
        await this.askCoachQuestion(
          user,
          draft.id,
          draft.currentStep,
          fields,
          COACH_INTRO_CODE,
        );
        await this.askCoachQuestion(user, draft.id, draft.currentStep, fields);
      }
      return this.view(user, draft, pagination);
    });
  }

  async resetDraft(
    user: TUser,
    draftId?: string,
    pagination?: ProfessionalPaginationInput,
  ) {
    this.assertProfessional(user);
    const trimmed = draftId?.trim() || undefined;

    if (!trimmed) {
      const existing = await this.drafts.findEditableDraft(user.id);
      if (!existing) return this.startDraft(user, pagination);
      return this.resetOwnedDraft(user, existing.id, pagination);
    }

    await this.ownedDraft(user, trimmed);
    return this.resetOwnedDraft(user, trimmed, pagination);
  }

  private async resetOwnedDraft(
    user: TUser,
    draftId: string,
    pagination?: ProfessionalPaginationInput,
  ) {
    return this.serialize(draftId, async () => {
      const seeded = await this.seedFieldsFromProfile(user);
      const result = await this.drafts.resetInPlace(user.id, draftId, seeded);
      if (result.outcome === "not_found")
        throw new NotFoundException(
          ProfessionalMessageCode.ROADMAP_DRAFT_NOT_FOUND,
        );
      if (result.outcome === "locked") throw new RoadmapDraftLockedException();
      return this.view(user, result.draft, pagination);
    });
  }

  private async seedFieldsFromProfile(user: TUser) {
    const profile = await this.profiles.profile(user);
    return {
      targetRole: profile.currentRole,
      skillLevel: profile.currentSkillLevel,
      timeCommitment: profile.learningTimeCommitment,
      budgetPreference: profile.learningBudgetPreference,
      preferredFormats: profile.preferredLearningFormats,
      subjects: profile.favoriteSubjects
        .map((term) => term.id)
        .slice(0, SERVICE_AI_LIMITS.subjectsMaxItems),
    };
  }

  private async createSeededDraft(user: TUser) {
    const seeded = await this.seedFieldsFromProfile(user);
    return this.drafts.createDraft(
      user.id,
      seeded as Prisma.RoadmapDraftCreateInput,
    );
  }

  async chatTurn(user: TUser, input: RoadmapChatTurnInput) {
    this.assertProfessional(user);
    const message = input.message.trim();
    if (!message)
      throw new BadRequestException(
        ProfessionalMessageCode.ROADMAP_MESSAGE_REQUIRED,
      );
    if (message.length > SERVICE_AI_LIMITS.userMessageMaxLength)
      throw new BadRequestException(
        ProfessionalMessageCode.ROADMAP_MESSAGE_TOO_LONG,
      );
    await this.ownedDraft(user, input.draftId);

    return this.serialize(input.draftId, async () => {
      const draft = await this.ownedDraft(user, input.draftId);
      if (draft.status === RoadmapDraftStatus.GENERATING)
        throw new RoadmapDraftLockedException();

      const started = Date.now();
      await this.recordProfessionalMessage(user, draft, message);
      const turn = await this.turnInput(user, draft, message);
      const result = await this.serviceAi.chatTurn(turn);

      if (!result.ok) {
        this.log(draft, result.kind, started);
        if (result.kind === "refused")
          return this.applyRefusal(user, draft, result.messageCode);
        this.raise(result);
      }

      this.log(draft, "ok", started);
      const updated = await this.applyTurn(user, draft, result.data, turn);
      return this.view(user, updated);
    });
  }

  private async applyRefusal(
    user: TUser,
    draft: DraftRow,
    code: RoadmapAiMessageCode,
  ) {
    const updated = await this.drafts.updateDraft(user.id, draft.id, {
      wasRefused: true,
      needsClarification: false,
    });
    await this.drafts.appendMessage(user.id, draft.id, {
      content: code,
      role: RoadmapChatRole.SYSTEM,
      stepKey: draft.currentStep,
    });
    return this.view(user, updated ?? draft);
  }

  async patchDraft(user: TUser, input: PatchRoadmapDraftInput) {
    this.assertProfessional(user);
    const supplied = PATCHABLE_FIELDS.filter(
      (field) => input[field] !== undefined,
    );
    if (!supplied.length)
      throw new BadRequestException(
        ProfessionalMessageCode.ROADMAP_DRAFT_FIELD_REQUIRED,
      );
    if (supplied.length > 1)
      throw new BadRequestException(
        ProfessionalMessageCode.ROADMAP_DRAFT_FIELD_INVALID,
      );
    const field = supplied[0];
    await this.ownedDraft(user, input.draftId);

    return this.serialize(input.draftId, async () => {
      const draft = await this.ownedDraft(user, input.draftId);
      if (!PATCHABLE_STATUS.includes(draft.status))
        throw new RoadmapDraftLockedException();

      const current = this.fields(draft);
      const previousStep = draft.currentStep;
      const changes = await this.patchChanges(user, field, input, current);
      const merged = { ...current, ...changes };

      const updated = await this.drafts.updateDraft(user.id, draft.id, {
        ...changes,
        wasRefused: false,
        needsClarification: false,
        currentStep: nextStep({
          draft: merged,
          currentStep: draft.currentStep,
          answered: new Set<RoadmapDraftField>(
            PATCH_ANSWERS[field] ? [PATCH_ANSWERS[field]] : [],
          ),
        }),
        status: isDraftComplete(merged)
          ? RoadmapDraftStatus.READY
          : RoadmapDraftStatus.COLLECTING,
      });

      await this.drafts.appendMessage(user.id, draft.id, {
        role: RoadmapChatRole.SYSTEM,
        stepKey: updated?.currentStep ?? draft.currentStep,
        content: [
          ProfessionalMessageCode.ROADMAP_DRAFT_FIELD_UPDATED,
          field,
        ].join(":"),
      });
      const stillOnPreferences =
        updated?.currentStep === RoadmapDraftStep.PREFERENCES &&
        PREFERENCE_FIELDS.has(field as RoadmapWidgetField);
      if (
        updated &&
        (updated.currentStep !== previousStep || stillOnPreferences)
      )
        await this.askCoachQuestion(
          user,
          draft.id,
          updated.currentStep,
          merged,
        );
      return this.view(user, updated ?? draft);
    });
  }

  async patchCpdSetup(user: TUser, input: PatchRoadmapCpdSetupInput) {
    this.assertProfessional(user);
    await this.ownedDraft(user, input.draftId);

    return this.serialize(input.draftId, async () => {
      const draft = await this.ownedDraft(user, input.draftId);
      if (!PATCHABLE_STATUS.includes(draft.status))
        throw new RoadmapDraftLockedException();

      const { draftId: _draftId, ...changes } = input;
      const plan = await this.cpdPlans.upsertDraftPlan(user, {
        planId: draft.cpdPlanId,
        ...changes,
      });

      const current = this.fields(draft);
      const previousStep = draft.currentStep;
      const merged: T.RoadmapDraftFields = {
        ...current,
        certificationId: plan.certificationId ?? null,
        certificationName: plan.certificationName || null,
        requiredCredits:
          plan.totalRequiredCredits > 0 ? plan.totalRequiredCredits : null,
      };

      const updated = await this.drafts.updateDraft(user.id, draft.id, {
        cpdPlanId: plan.id,
        certificationId: merged.certificationId,
        certificationName: merged.certificationName,
        requiredCredits: merged.requiredCredits,
        wasRefused: false,
        needsClarification: false,
        currentStep: nextStep({
          draft: merged,
          currentStep: draft.currentStep,
          answered: new Set<RoadmapDraftField>(),
        }),
        status: isDraftComplete(merged)
          ? RoadmapDraftStatus.READY
          : RoadmapDraftStatus.COLLECTING,
      });

      await this.drafts.appendMessage(user.id, draft.id, {
        role: RoadmapChatRole.SYSTEM,
        stepKey: updated?.currentStep ?? draft.currentStep,
        content: [
          ProfessionalMessageCode.ROADMAP_DRAFT_FIELD_UPDATED,
          "cpdSetup",
        ].join(":"),
      });
      if (updated && updated.currentStep !== previousStep)
        await this.askCoachQuestion(
          user,
          draft.id,
          updated.currentStep,
          merged,
        );
      return this.view(user, updated ?? draft);
    });
  }

  private async patchChanges(
    user: TUser,
    field: PatchableField,
    input: PatchRoadmapDraftInput,
    current: T.RoadmapDraftFields,
  ): Promise<Partial<T.RoadmapDraftFields>> {
    const value = input[field] ?? null;

    if (field === "subjects") {
      const options = await this.subjectOptions(user);
      const { changes } = mergeExtractedFields({
        current,
        subjectOptions: options,
        cleared: value === null ? ["subjects"] : [],
        extracted: value === null ? {} : { subjects: input.subjects ?? [] },
      });
      return { subjects: changes.subjects ?? current.subjects };
    }

    if (field === "certificationId") {
      if (value === null)
        return {
          certificationId: null,
          requiredCredits: null,
          completedCredits: null,
        };
      const credits = await this.cpdPlans.certificationCredits(
        user,
        String(value),
      );
      if (!credits)
        throw new BadRequestException(
          ProfessionalMessageCode.CERTIFICATION_NOT_FOUND,
        );
      return {
        certificationId: String(value),
        certificationName: credits.certification.name,
        requiredCredits: credits.requiredCredits,
        completedCredits: credits.completedCredits,
      };
    }

    if (field === "certificationName") {
      const name = value === null ? null : String(value);
      return {
        certificationName: name,
        ...(await this.creditsFor(user, current, {
          ...current,
          certificationName: name,
        })),
      };
    }

    if (field === "preferredFormats")
      return { preferredFormats: input.preferredFormats ?? [] };
    if (field === "preferredContentTypes")
      return { preferredContentTypes: input.preferredContentTypes ?? [] };
    if (field === "preferredDeliveryFormats")
      return {
        preferredDeliveryFormats: input.preferredDeliveryFormats ?? [],
      };
    if (field === "cpdEnabled") return { cpdEnabled: value === true };
    return { [field]: value };
  }

  private log(draft: DraftRow, outcome: string, started: number) {
    this.logger.log({
      outcome,
      event: "roadmap-chat.turn",
      draftId: draft.id,
      step: draft.currentStep,
      durationMs: Date.now() - started,
      correlationId: requestContext.correlationId() ?? null,
    });
  }
}
