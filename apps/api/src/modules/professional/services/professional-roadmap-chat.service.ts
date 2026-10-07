import { getRoadmapDraftContractReadiness } from "@professional/utils/roadmap-draft-readiness.util";
import { ProfessionalRoadmapDraftService } from "@professional/services/professional-roadmap-draft.service";
import { RoadmapSuggestionOptionsInput } from "@professional/dtos/roadmap-suggestion-options.input";
import { ServiceUnavailableException } from "@nestjs/common";
import { ProfessionalPaginationInput } from "@professional/dtos/professional-pagination.input";
import { ProfessionalTaxonomyService } from "@professional/services/professional-taxonomy.service";
import { ProfessionalCpdPlanService } from "@professional/services/professional-cpd-plan.service";
import { ProfessionalProfileService } from "@professional/services/professional-profile.service";
import { CertificationSearchService } from "@professional/services/certification-search.service";
import { PatchRoadmapCpdSetupInput } from "@professional/dtos/patch-roadmap-cpd-setup.input";
import { ProfessionalMessageCode } from "@professional/enums/message-code.enum";
import { roadmapContractProgress } from "@professional/utils/roadmap-draft-readiness.util";
import { stepOfFirstMissingField } from "@professional/utils/roadmap-draft-readiness.util";
import { PatchRoadmapDraftInput } from "@professional/dtos/patch-roadmap-draft.input";
import { widgetRejectionReason } from "@professional/utils/roadmap-widget-validation.util";
import { RoadmapDraftFieldKey } from "@professional/enums/roadmap-draft.enum";
import { mergeExtractedFields } from "@professional/utils/roadmap-draft-merge.util";
import { RoadmapChatTurnInput } from "@professional/dtos/roadmap-chat-turn.input";
import { mapGenerationFailure } from "@professional/utils/roadmap-generation-failure.util";
import { RoadmapAiMessageCode } from "@infrastructure/service-ai/service-ai.port";
import { BadRequestException } from "@nestjs/common";
import { ProfileTaxonomyKind } from "@prisma/client";
import { ForbiddenException } from "@nestjs/common";
import { RoadmapDraftStatus } from "@prisma/client";
import { NotFoundException } from "@nestjs/common";
import { TAXONOMY_PAGE_MAX } from "@professional/enums/profile-section.enum";
import { groupKeysMatching } from "@professional/utils/roadmap-relevance.util";
import { SERVICE_AI_LIMITS } from "@infrastructure/service-ai/service-ai.port";
import { ProfileTermUsage } from "@prisma/client";
import { RoadmapDraftStep } from "@prisma/client";
import { RoadmapChatRole } from "@prisma/client";
import { subjectLabelsOf } from "@professional/utils/roadmap-draft-merge.util";
import { SERVICE_AI_PORT } from "@infrastructure/service-ai/service-ai.port";
import { requestContext } from "@infrastructure/observability/request-context";
import { validateWidget } from "@professional/utils/roadmap-widget-validation.util";
import { isCoachMessage } from "@professional/utils/roadmap-coach.util";
import { HttpException } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { rankTerms } from "@professional/utils/roadmap-relevance.util";
import { Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { Inject } from "@nestjs/common";
import { TUser } from "@common/types/user.types";
import { Role } from "@prisma/client";

import { type WidgetValidationContext } from "@professional/utils/roadmap-widget-validation.util";
import { type CertificationOption } from "@professional/utils/roadmap-widget-validation.util";
import { type RankableTerm } from "@professional/utils/roadmap-relevance.util";
import { type TaxonomyTerm } from "@professional/utils/profile-taxonomy.util";

import {
  type ChatTurnData,
  type ServiceAiFailureTrace,
  type ServiceAiPort,
  type RoadmapWidget,
  type RoadmapChatEntry,
  type RoadmapDraftState,
} from "@infrastructure/service-ai/service-ai.port";

import * as T from "@professional/types/professional-roadmap-chat.types";

const CERTIFICATION_SEARCH_LIMIT = 8;

type DraftRow = Prisma.RoadmapDraftGetPayload<object>;
type MessageRow = Prisma.RoadmapChatMessageGetPayload<object>;

const PATCHABLE_FIELDS = [
  "goal",
  "context",
  "subjects",
  "targetRole",
  "goalReason",
  "cpdEnabled",
  "targetDate",
  "skillLevel",
  "timeCommitment",
  "requiredCredits",
  "certificationId",
  "budgetPreference",
  "completedCredits",
  "preferredFormats",
  "certificationName",
  "preferredContentTypes",
  "preferredDeliveryFormats",
] as const satisfies readonly (keyof T.RoadmapDraftFields)[];

type PatchableField = (typeof PATCHABLE_FIELDS)[number];

const PATCHABLE_STATUS: RoadmapDraftStatus[] = [
  RoadmapDraftStatus.COLLECTING,
  RoadmapDraftStatus.READY,
  RoadmapDraftStatus.FAILED,
];

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
    private readonly taxonomy: ProfessionalTaxonomyService,
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

  private async subjectCatalogue(user: TUser) {
    const groups = await this.profiles.taxonomy(
      user,
      ProfileTaxonomyKind.SUBJECT,
    );
    const terms = groups.flatMap((group) => group.terms);
    return {
      knownIds: new Set(terms.map((term) => term.id)),
      options: terms
        .map((term) => ({
          id: term.id.slice(0, SERVICE_AI_LIMITS.subjectOptionIdMaxLength),
          label: term.label.slice(
            0,
            SERVICE_AI_LIMITS.subjectOptionLabelMaxLength,
          ),
        }))
        .slice(0, SERVICE_AI_LIMITS.subjectOptionsMaxItems),
    };
  }

  private async subjectOptions(user: TUser): Promise<T.RoadmapSubjectOption[]> {
    return (await this.subjectCatalogue(user)).options;
  }

  private toRankableTerms(terms: readonly TaxonomyTerm[]): RankableTerm[] {
    return terms.map((term) => ({
      id: term.id,
      label: term.label,
      groupKey: term.groupKey,
      groupLabel: term.groupLabel,
    }));
  }

  private async roleRankables(
    user: TUser,
    targetRole: string | null,
    includeIds: readonly string[] = [],
  ) {
    const favoredGroupIds = await this.taxonomy.favoredRoleGroupIds(user.id);
    return this.toRankableTerms(
      await this.taxonomy.roleCandidates({
        text: targetRole,
        favoredGroupIds,
        includeIds,
      }),
    );
  }

  private async withProposedRoles(
    widget: RoadmapWidget | null,
    context: WidgetValidationContext,
  ): Promise<WidgetValidationContext> {
    if (widget?.field !== "targetRole" || !widget.options.length)
      return context;
    const known = new Set(context.rankedRoles.map((term) => term.id));
    const missing = widget.options
      .map((option) => option.value)
      .filter((value) => !known.has(value));
    if (!missing.length) return context;
    const proposed = this.toRankableTerms(
      await this.taxonomy.roleCandidates({
        text: null,
        favoredGroupIds: [],
        includeIds: missing,
      }),
    );
    return { ...context, rankedRoles: [...context.rankedRoles, ...proposed] };
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
      select: { term: { select: { group: { select: { key: true } } } } },
    });
    const direct = owned.map((row) => row.term.group.key);
    const inferred = groupKeysMatching(targetRole, candidateTerms);
    return [...new Set([...direct, ...inferred])];
  }

  private async relevanceContext(user: TUser, draft: T.RoadmapDraftFields) {
    const [subjectGroups, roleTerms] = await Promise.all([
      this.profiles.taxonomy(user, ProfileTaxonomyKind.SUBJECT),
      this.roleRankables(user, draft.targetRole),
    ]);
    const subjectTerms = this.toRankableTerms(
      subjectGroups.flatMap((group) => group.terms),
    );
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
      cpdAnswered: draft.cpdAnswered,
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
      subjects: fields.subjects.length
        ? subjectLabelsOf(fields.subjects, subjectOptions)
        : null,
      goalReason: fields.goalReason,
      targetRole: fields.targetRole,
      targetDate: fields.targetDate,
      cpdEnabled: fields.cpdAnswered ? fields.cpdEnabled : null,
      certificationName: fields.certificationName,
      skillLevel: fields.skillLevel,
      timeCommitment: fields.timeCommitment,
      preferredFormats: fields.preferredFormats,
      budgetPreference: fields.budgetPreference,
      preferredContentTypes: fields.preferredContentTypes,
    };
  }

  private toHistory(
    messages: MessageRow[],
    currentMessageId: string | null,
  ): RoadmapChatEntry[] {
    return messages
      .filter((message) => message.id !== currentMessageId)
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
    const [transcript, catalogue, cpdPlan] = await Promise.all([
      this.drafts.transcriptPage(user.id, draft.id, pagination),
      this.subjectCatalogue(user),
      draft.cpdPlanId ? this.cpdPlans.plan(user, draft.cpdPlanId) : null,
    ]);
    const subjectOptions = catalogue.options;
    const pending = await this.drafts.lastAssistantMessage(user.id, draft.id);
    const completion = roadmapContractProgress(fields, catalogue.knownIds);
    const canGenerate =
      (draft.status === RoadmapDraftStatus.READY ||
        draft.status === RoadmapDraftStatus.FAILED) &&
      completion.missingFields.length === 0;
    const isComplete =
      canGenerate ||
      draft.status === RoadmapDraftStatus.GENERATING ||
      draft.status === RoadmapDraftStatus.COMPLETED;
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
      isComplete,
      canGenerate,
      completedFieldCount: completion.completedFieldCount,
      requiredFieldCount: completion.requiredFieldCount,
      remainingFields: completion.remainingFields,
      missingFields: completion.missingFields,
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
    options: { isInitialTurn?: boolean; currentMessageId?: string | null } = {},
  ) {
    const { isInitialTurn = false, currentMessageId = null } = options;
    const fields = this.fields(draft);
    const [messages, catalogue] = await Promise.all([
      this.drafts.transcript(user.id, draft.id),
      this.subjectCatalogue(user),
    ]);
    const fullSubjectOptions = catalogue.options;
    const widgetContext = await this.widgetContext(
      user,
      fields,
      fullSubjectOptions,
    );

    return {
      today: new Date(),
      currentStep: draft.currentStep,
      draft: isInitialTurn
        ? {}
        : this.toProviderDraft(fields, fullSubjectOptions),
      history: isInitialTurn
        ? []
        : this.toHistory(messages ?? [], currentMessageId),
      locale: "en" as const,
      subjectOptions: fullSubjectOptions,
      userMessage,
      fullSubjectOptions,
      knownSubjectIds: catalogue.knownIds,
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
      return last.id;
    const created = await this.drafts.appendMessage(user.id, draft.id, {
      content,
      role: RoadmapChatRole.PROFESSIONAL,
      stepKey: draft.currentStep,
    });
    return created?.id ?? null;
  }

  private async appendMessageIfNew(
    user: TUser,
    draftId: string,
    message: {
      role: RoadmapChatRole;
      content: string;
      stepKey: RoadmapDraftStep;
    },
  ) {
    const messages = (await this.drafts.transcript(user.id, draftId)) ?? [];
    const last = messages.at(-1);
    if (
      last &&
      last.role === message.role &&
      last.content === message.content &&
      last.stepKey === message.stepKey
    )
      return;
    await this.drafts.appendMessage(user.id, draftId, message);
  }

  private async applyTurn(
    user: TUser,
    draft: DraftRow,
    data: ChatTurnData,
    turn: Awaited<ReturnType<ProfessionalRoadmapChatService["turnInput"]>>,
    expectedUpdatedAt: Date,
  ) {
    const { fullSubjectOptions, widgetContext } = turn;
    const current = this.fields(draft);
    const { changes } = mergeExtractedFields({
      current,
      subjectOptions: fullSubjectOptions,
      extracted: data.extracted,
      cleared: data.clearedFields,
    });
    const merged = { ...current, ...changes };
    const credits = await this.creditsFor(user, current, merged);
    Object.assign(merged, credits);

    const readiness = getRoadmapDraftContractReadiness(
      merged,
      turn.knownSubjectIds,
    );
    const isReady =
      data.isComplete && !data.needsClarification && readiness.isValid;
    if (data.isComplete && !readiness.isValid)
      this.logger.warn({
        event: "roadmap-chat.completion-contract-mismatch",
        draftId: draft.id,
        missingMandatoryFields: readiness.missingFields,
        correlationId: requestContext.correlationId() ?? null,
      });

    const step = isReady
      ? RoadmapDraftStep.REVIEW
      : this.stepForProviderSection(
          data.suggestedNextSection,
          draft.currentStep,
        );

    const updated = await this.drafts.updateDraft(
      user.id,
      draft.id,
      {
        ...changes,
        ...credits,
        currentStep: step,
        needsClarification: data.needsClarification,
        wasRefused: false,
        status: isReady
          ? RoadmapDraftStatus.READY
          : RoadmapDraftStatus.COLLECTING,
      },
      expectedUpdatedAt,
    );
    if (!updated) {
      this.logger.warn({
        event: "roadmap-chat.turn-superseded",
        draftId: draft.id,
        correlationId: requestContext.correlationId() ?? null,
      });
      throw new RoadmapDraftLockedException();
    }

    const proposedContext = await this.withProposedRoles(
      data.widget,
      widgetContext,
    );
    const validatedWidget = validateWidget(data.widget, proposedContext);
    if (data.widget && !validatedWidget)
      this.logger.warn({
        event: "roadmap-chat.widget-rejected",
        draftId: draft.id,
        field: data.widget.field,
        type: data.widget.type,
        reason: widgetRejectionReason(data.widget, proposedContext),
        correlationId: requestContext.correlationId() ?? null,
      });
    this.logState("turn", draft, updated, merged, readiness);
    await this.appendAssistantIfNew(
      user,
      draft.id,
      step,
      data.assistantMessage,
      validatedWidget,
    );

    return updated;
  }

  private stepForProviderSection(
    section: ChatTurnData["suggestedNextSection"],
    currentStep: RoadmapDraftStep,
  ) {
    switch (section) {
      case "GOAL":
        return RoadmapDraftStep.GOAL;
      case "PREFERENCES":
        return RoadmapDraftStep.PREFERENCES;
      case "CPD_SETUP":
        return RoadmapDraftStep.CPD_TRACKING;
      case "REVIEW":
        return RoadmapDraftStep.REVIEW;
      case null:
        return currentStep;
    }
  }

  private async appendAssistantIfNew(
    user: TUser,
    draftId: string,
    step: RoadmapDraftStep,
    content: string,
    widget: RoadmapWidget | null,
  ) {
    await this.drafts.appendAssistantMessageIfNew(user.id, draftId, {
      content,
      stepKey: step,
      widget: this.toWidgetJson(widget),
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
    const search = input.search?.trim().toLowerCase();
    if (input.field !== RoadmapDraftFieldKey.SUBJECTS && search) {
      const page = await this.taxonomy.terms(user, {
        kind: ProfileTaxonomyKind.ROLE,
        search,
        take: TAXONOMY_PAGE_MAX,
      });
      return page.items.map((term) => ({
        value: term.id,
        label: term.label,
        groupLabel: term.groupLabel,
      }));
    }
    const terms =
      input.field === RoadmapDraftFieldKey.SUBJECTS
        ? rankedSubjects
        : rankedRoles;
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
    const draft = existing ?? (await this.drafts.createDraft(user.id));
    return this.serialize(draft.id, async () => {
      if ((await this.drafts.messageCount(user.id, draft.id)) === 0) {
        const fresh = await this.ownedDraft(user, draft.id);
        const updated = await this.initialTurn(user, fresh);
        return this.view(user, updated, pagination);
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
      const result = await this.drafts.resetInPlace(user.id, draftId);
      if (result.outcome === "not_found")
        throw new NotFoundException(
          ProfessionalMessageCode.ROADMAP_DRAFT_NOT_FOUND,
        );
      if (result.outcome === "locked") throw new RoadmapDraftLockedException();
      const updated = await this.initialTurn(user, result.draft);
      return this.view(user, updated, pagination);
    });
  }

  private async initialTurn(user: TUser, draft: DraftRow) {
    const started = Date.now();
    const turn = await this.turnInput(user, draft, null, {
      isInitialTurn: true,
    });
    const result = await this.serviceAi.chatTurn(turn);

    if (!result.ok) {
      this.log(draft, result.kind, started, result);
      this.raise(result);
    }

    this.log(draft, "ok", started);
    return this.applyTurn(user, draft, result.data, turn, draft.updatedAt);
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
      const expectedUpdatedAt = draft.updatedAt;
      const currentMessageId = await this.recordProfessionalMessage(
        user,
        draft,
        message,
      );
      const turn = await this.turnInput(user, draft, message, {
        currentMessageId,
      });
      const result = await this.serviceAi.chatTurn(turn);

      if (!result.ok) {
        this.log(draft, result.kind, started, result);
        if (result.kind === "refused")
          return this.applyRefusal(user, draft, result.messageCode);
        this.raise(result);
      }

      this.log(draft, "ok", started);
      const updated = await this.applyTurn(
        user,
        draft,
        result.data,
        turn,
        expectedUpdatedAt,
      );
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
      const changes = await this.patchChanges(user, field, input, current);
      const merged = { ...current, ...changes };
      const { knownIds: knownSubjectIds } = await this.subjectCatalogue(user);

      const updated = await this.drafts.updateDraft(user.id, draft.id, {
        ...changes,
        wasRefused: false,
        needsClarification: false,
        ...this.statusAfterEdit(draft, merged, knownSubjectIds),
      });
      if (updated)
        this.logState(
          "patch",
          draft,
          updated,
          merged,
          getRoadmapDraftContractReadiness(merged, knownSubjectIds),
        );

      const patchMessage = {
        stepKey: updated?.currentStep ?? draft.currentStep,
        role: input.selectionLabel
          ? RoadmapChatRole.PROFESSIONAL
          : RoadmapChatRole.SYSTEM,
        content:
          input.selectionLabel ??
          [ProfessionalMessageCode.ROADMAP_DRAFT_FIELD_UPDATED, field].join(
            ":",
          ),
      };
      if (input.selectionLabel)
        await this.appendMessageIfNew(user, draft.id, patchMessage);
      else await this.drafts.appendMessage(user.id, draft.id, patchMessage);
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
      const merged: T.RoadmapDraftFields = {
        ...current,
        certificationId: plan.certificationId ?? null,
        certificationName: plan.certificationName || current.certificationName,
        requiredCredits:
          plan.totalRequiredCredits > 0 ? plan.totalRequiredCredits : null,
      };

      const { knownIds: knownSubjectIds } = await this.subjectCatalogue(user);
      const updated = await this.drafts.updateDraft(user.id, draft.id, {
        cpdPlanId: plan.id,
        certificationId: merged.certificationId,
        certificationName: merged.certificationName,
        requiredCredits: merged.requiredCredits,
        ...this.statusAfterEdit(draft, merged, knownSubjectIds),
      });
      if (updated)
        this.logState(
          "cpd-setup",
          draft,
          updated,
          merged,
          getRoadmapDraftContractReadiness(merged, knownSubjectIds),
        );

      await this.drafts.appendMessage(user.id, draft.id, {
        role: RoadmapChatRole.SYSTEM,
        stepKey: updated?.currentStep ?? draft.currentStep,
        content: [
          ProfessionalMessageCode.ROADMAP_DRAFT_FIELD_UPDATED,
          "cpdSetup",
        ].join(":"),
      });
      return this.view(user, updated ?? draft);
    });
  }

  private statusAfterEdit(
    draft: DraftRow,
    merged: T.RoadmapDraftFields,
    knownSubjectIds: ReadonlySet<string>,
  ) {
    const readiness = getRoadmapDraftContractReadiness(merged, knownSubjectIds);
    const isOpen =
      draft.status === RoadmapDraftStatus.COLLECTING ||
      draft.status === RoadmapDraftStatus.FAILED;
    if (readiness.isValid)
      return isOpen ? { status: RoadmapDraftStatus.READY } : {};
    if (draft.status === RoadmapDraftStatus.COLLECTING) return {};
    return {
      status: RoadmapDraftStatus.COLLECTING,
      currentStep:
        stepOfFirstMissingField(readiness.missingFields) ?? draft.currentStep,
    };
  }

  private logState(
    trigger: "turn" | "patch" | "cpd-setup",
    before: DraftRow,
    after: DraftRow,
    merged: T.RoadmapDraftFields,
    readiness: ReturnType<typeof getRoadmapDraftContractReadiness>,
  ) {
    this.logger.log({
      event: "roadmap-chat.state",
      trigger,
      draftId: after.id,
      statusBefore: before.status,
      statusAfter: after.status,
      readinessValid: readiness.isValid,
      missingFields: readiness.missingFields,
      subjectsCount: merged.subjects.length,
      cpdEnabled: merged.cpdEnabled,
      cpdAnswered: merged.cpdAnswered,
      currentStep: after.currentStep,
      correlationId: requestContext.correlationId() ?? null,
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
    if (field === "cpdEnabled")
      return { cpdEnabled: value === true, cpdAnswered: value !== null };
    return { [field]: value };
  }

  private log(
    draft: DraftRow,
    outcome: string,
    started: number,
    failure?: ServiceAiFailureTrace & { retryable: boolean },
  ) {
    this.logger.log({
      outcome,
      event: "roadmap-chat.turn",
      draftId: draft.id,
      step: draft.currentStep,
      durationMs: Date.now() - started,
      correlationId: requestContext.correlationId() ?? null,
      ...(failure
        ? {
            retryable: failure.retryable,
            providerCode: failure.providerCode ?? null,
            providerCorrelationId: failure.providerCorrelationId ?? null,
          }
        : {}),
    });
  }
}
