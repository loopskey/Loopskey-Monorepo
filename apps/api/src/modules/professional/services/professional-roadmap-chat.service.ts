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
  Prisma,
  ProfileTaxonomyKind,
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
  type ServiceAiPort,
  SERVICE_AI_LIMITS,
} from "@infrastructure/service-ai/service-ai.port";
import { ProfessionalRoadmapDraftService } from "@professional/services/professional-roadmap-draft.service";
import { ProfessionalPaginationInput } from "@professional/dtos/professional-pagination.input";
import { ProfessionalCpdPlanService } from "@professional/services/professional-cpd-plan.service";
import { ProfessionalProfileService } from "@professional/services/professional-profile.service";
import { PatchRoadmapCpdSetupInput } from "@professional/dtos/patch-roadmap-cpd-setup.input";
import { ProfessionalMessageCode } from "@professional/enums/message-code.enum";
import { draftCompletionSummary } from "@professional/utils/roadmap-step-machine.util";
import { PatchRoadmapDraftInput } from "@professional/dtos/patch-roadmap-draft.input";
import { mergeExtractedFields } from "@professional/utils/roadmap-draft-merge.util";
import { RoadmapChatTurnInput } from "@professional/dtos/roadmap-chat-turn.input";
import { mapGenerationFailure } from "@professional/utils/roadmap-generation-failure.util";
import { COACH_QUESTION_CODE } from "@professional/utils/roadmap-coach.util";
import { COACH_INTRO_CODE } from "@professional/utils/roadmap-coach.util";
import { subjectLabelsOf } from "@professional/utils/roadmap-draft-merge.util";
import { isDraftComplete } from "@professional/utils/roadmap-step-machine.util";
import { requestContext } from "@infrastructure/observability/request-context";
import { coachWidgetFor } from "@professional/utils/roadmap-coach.util";
import { isCoachMessage } from "@professional/utils/roadmap-coach.util";
import { hadValue } from "@professional/utils/roadmap-coach.util";
import { nextStep } from "@professional/utils/roadmap-step-machine.util";
import { TUser } from "@common/types/user.types";

import * as T from "@professional/types/professional-roadmap-chat.types";

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
      // `fields.subjects` holds taxonomy term ids; the provider's DraftState
      // expects the text those terms name, same as the catalogue search does.
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
    const [messages, subjectOptions] = await Promise.all([
      this.drafts.transcript(user.id, draft.id),
      this.subjectOptions(user),
    ]);
    return {
      subjectOptions,
      today: new Date(),
      currentStep: draft.currentStep,
      draft: this.toProviderDraft(this.fields(draft), subjectOptions),
      history: this.toHistory(messages ?? []),
      userMessage,
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
    subjectOptions: T.RoadmapSubjectOption[],
  ) {
    const current = this.fields(draft);
    const previousStep = draft.currentStep;
    const { changes, answered } = mergeExtractedFields({
      current,
      subjectOptions,
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

    // The provider's wording is kept only where it says something the coach's
    // fixed script cannot: a clarification, the confirmation of a correction,
    // or the reply to a turn that moved nowhere. A plain answer that advances
    // the wizard is followed by the coach's own next question instead.
    if (
      data.assistantMessage.trim() &&
      (data.needsClarification || isCorrection || !stepChanged)
    )
      await this.drafts.appendMessage(user.id, draft.id, {
        stepKey: step,
        content: data.assistantMessage,
        role: RoadmapChatRole.ASSISTANT,
        widget: this.toWidgetJson(data.widget),
      });

    if (stepChanged && !data.needsClarification)
      await this.askCoachQuestion(user, draft.id, step);
    return updated ?? draft;
  }

  private async askCoachQuestion(
    user: TUser,
    draftId: string,
    step: RoadmapDraftStep,
    code: string = COACH_QUESTION_CODE,
  ) {
    await this.drafts.appendMessage(user.id, draftId, {
      content: code,
      stepKey: step,
      role: RoadmapChatRole.ASSISTANT,
      widget: this.toWidgetJson(coachWidgetFor(step)),
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
        await this.askCoachQuestion(
          user,
          draft.id,
          draft.currentStep,
          COACH_INTRO_CODE,
        );
        await this.askCoachQuestion(user, draft.id, draft.currentStep);
      }
      return this.view(user, draft, pagination);
    });
  }

  /**
   * `draftId` is optional only for backward compatibility: an omitted id
   * keeps resolving the professional's current editable (`COLLECTING`/
   * `READY`) draft, same as before this reset became in-place. The updated
   * frontend always sends the draft id actually on screen, which is what
   * makes resetting a `FAILED` draft reachable at all.
   */
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
      const updated = await this.applyTurn(
        user,
        draft,
        result.data,
        turn.subjectOptions,
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
      if (updated && updated.currentStep !== previousStep)
        await this.askCoachQuestion(user, draft.id, updated.currentStep);
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
        // `upsertDraftPlan` defaults an unset requirement to 0 on first
        // create; a real CPD requirement is always positive (matching
        // CreateCpdPlanInput's @IsPositive()), so 0 still reads as
        // "not answered yet" to the step machine, exactly like the
        // certificationName default above.
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
        await this.askCoachQuestion(user, draft.id, updated.currentStep);
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
