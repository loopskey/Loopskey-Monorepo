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
import {
  isDraftComplete,
  nextStep,
} from "@professional/utils/roadmap-step-machine.util";
import { mergeExtractedFields } from "@professional/utils/roadmap-draft-merge.util";
import { ProfessionalRoadmapDraftService } from "@professional/services/professional-roadmap-draft.service";
import { ProfessionalCpdPlanService } from "@professional/services/professional-cpd-plan.service";
import { ProfessionalProfileService } from "@professional/services/professional-profile.service";
import { PatchRoadmapDraftInput } from "@professional/dtos/patch-roadmap-draft.input";
import { ProfessionalPaginationInput } from "@professional/dtos/professional-pagination.input";
import { ProfessionalMessageCode } from "@professional/enums/message-code.enum";
import { RoadmapChatTurnInput } from "@professional/dtos/roadmap-chat-turn.input";
import { requestContext } from "@infrastructure/observability/request-context";
import { TUser } from "@common/types/user.types";

import * as T from "@professional/types/professional-roadmap-chat.types";

type DraftRow = Prisma.RoadmapDraftGetPayload<object>;
type MessageRow = Prisma.RoadmapChatMessageGetPayload<object>;

/** Every field the patch mutation may carry, in the order they are asked. */
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
  "cpdEnabled",
  "certificationId",
  "certificationName",
  "requiredCredits",
  "completedCredits",
] as const satisfies readonly (keyof T.RoadmapDraftFields)[];

type PatchableField = (typeof PATCHABLE_FIELDS)[number];

/** A patch is never applied to a draft the generator is already reading. */
const PATCHABLE_STATUS: RoadmapDraftStatus[] = [
  RoadmapDraftStatus.COLLECTING,
  RoadmapDraftStatus.READY,
  RoadmapDraftStatus.FAILED,
];

/**
 * Which collected field a patch actually answers, in the provider's own
 * vocabulary. The three credit and identifier columns have no counterpart
 * there because the provider never extracts them.
 */
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

/**
 * Generation is reading the draft; changing it underneath would produce a plan
 * for a state that never existed.
 */
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

  /**
   * Per-draft serialization. Two turns for the same draft would otherwise both
   * read the pre-turn step and the second would overwrite the first's answer.
   * This holds within one process; a multi-instance deployment needs the same
   * guarantee in the database, which is noted as a known gap rather than
   * pretended away.
   */
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
    /**
     * Not-found rather than forbidden: a professional who guesses another
     * draft's identifier must not learn that it exists.
     */
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
      cpdEnabled: draft.cpdEnabled,
      certificationId: draft.certificationId,
      certificationName: draft.certificationName,
      requiredCredits: draft.requiredCredits,
      completedCredits: draft.completedCredits,
    };
  }

  /**
   * What the provider is told about the draft. The accumulated state goes out
   * on every turn — sending an empty draft is documented as leaving the
   * interview unable to finish.
   */
  private toProviderDraft(fields: T.RoadmapDraftFields): RoadmapDraftState {
    return {
      goal: fields.goal,
      context: fields.context,
      subjects: fields.subjects,
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

  /**
   * The window the provider sees. System messages never leave: they carry
   * platform message codes rather than prose, and feeding those back as
   * conversation would teach the model to answer in codes.
   */
  private toHistory(messages: MessageRow[]): RoadmapChatEntry[] {
    return messages
      .filter((message) => message.role !== RoadmapChatRole.SYSTEM)
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
    const [transcript, subjectOptions] = await Promise.all([
      this.drafts.transcriptPage(user.id, draft.id, pagination),
      this.subjectOptions(user),
    ]);
    const pending = await this.drafts.lastAssistantMessage(user.id, draft.id);
    return {
      ...fields,
      id: draft.id,
      status: draft.status,
      updatedAt: draft.updatedAt,
      currentStep: draft.currentStep,
      needsClarification: draft.needsClarification,
      wasRefused: draft.wasRefused,
      isComplete: isDraftComplete(fields),
      widget: pending ? this.toWidget(pending.widget) : null,
      subjectOptions,
      transcript: transcript ?? {
        items: [],
        totalCount: 0,
        pageInfo: { hasNextPage: false, nextCursor: null },
      },
    };
  }

  /**
   * The AI service is stateless, so the whole conversation travels with every
   * call. Everything the provider needs is assembled here.
   */
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
      draft: this.toProviderDraft(this.fields(draft)),
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

  /**
   * A retried turn must not leave a second copy of the same answer behind. The
   * previous attempt persisted the message before calling the provider, so the
   * duplicate is always the message immediately preceding.
   */
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

  /**
   * Everything a completed turn changes about the draft, in one write: the
   * merged answers, the step the machine chose, and the two outcome flags a
   * reload restores the conversation from.
   */
  private async applyTurn(
    user: TUser,
    draft: DraftRow,
    data: ChatTurnData,
    subjectOptions: T.RoadmapSubjectOption[],
  ) {
    const current = this.fields(draft);
    const { changes, answered } = mergeExtractedFields({
      current,
      subjectOptions,
      extracted: data.extracted,
      cleared: data.clearedFields,
    });
    const merged = { ...current, ...changes };
    const credits = await this.creditsFor(user, current, merged);
    Object.assign(merged, credits);

    /**
     * A turn the provider could not understand asks the same question again.
     * Whatever it did manage to extract is still merged, so the professional
     * never has to repeat something they already said.
     */
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

    await this.drafts.appendMessage(user.id, draft.id, {
      stepKey: step,
      content: data.assistantMessage,
      role: RoadmapChatRole.ASSISTANT,
      widget: this.toWidgetJson(data.widget),
    });
    return updated ?? draft;
  }

  /**
   * A certification the professional named by hand carries no credits; one
   * that resolves to the catalogue brings its requirement and whatever they
   * have already banked against it.
   */
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

  /**
   * The introduction costs no model call on the provider's side because it
   * carries no professional message, which is why the wizard can open with a
   * real question rather than fixed copy.
   */
  async startDraft(user: TUser, pagination?: ProfessionalPaginationInput) {
    this.assertProfessional(user);
    const existing = await this.drafts.findEditableDraft(user.id);
    /**
     * A draft with no messages is a start whose introduction never arrived.
     * Reusing it stops a provider outage from leaving a trail of empty drafts.
     */
    const reusable =
      existing && (await this.drafts.messageCount(user.id, existing.id)) === 0
        ? existing
        : null;
    const draft = reusable ?? (await this.createSeededDraft(user));
    return this.serialize(draft.id, async () => {
      const started = Date.now();
      const input = await this.turnInput(user, draft, null);
      const result = await this.serviceAi.chatTurn(input);
      if (!result.ok) {
        this.log(draft, result.kind, started);
        this.raise(result);
      }
      this.log(draft, "ok", started);
      const updated = await this.applyTurn(
        user,
        draft,
        result.data,
        input.subjectOptions,
      );
      return this.view(user, updated, pagination);
    });
  }

  private async createSeededDraft(user: TUser) {
    const profile = await this.profiles.profile(user);
    return this.drafts.createDraft(user.id, {
      targetRole: profile.currentRole,
      skillLevel: profile.currentSkillLevel,
      timeCommitment: profile.learningTimeCommitment,
      budgetPreference: profile.learningBudgetPreference,
      preferredFormats: profile.preferredLearningFormats,
      subjects: profile.favoriteSubjects
        .map((term) => term.id)
        .slice(0, SERVICE_AI_LIMITS.subjectsMaxItems),
    } as Prisma.RoadmapDraftCreateInput);
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
        /**
         * An off-topic message is a normal thing to say, not a fault. The step
         * stands, the refusal is recorded, and the mutation succeeds so the
         * browser can show the rephrase prompt inside the conversation.
         */
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
    /**
     * The provider returns no text for a refusal, so the rephrase prompt is
     * ours. It is stored as the stable code rather than rendered prose, so the
     * browser translates it like any other copy and it never travels back to
     * the provider as conversation.
     */
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

    /**
     * Array columns are not nullable, so clearing one means emptying it. Every
     * other field takes the supplied value, null included.
     */
    if (field === "preferredFormats")
      return { preferredFormats: input.preferredFormats ?? [] };
    if (field === "preferredContentTypes")
      return { preferredContentTypes: input.preferredContentTypes ?? [] };
    if (field === "cpdEnabled") return { cpdEnabled: value === true };
    return { [field]: value };
  }

  /**
   * One line per turn. The correlation identifier comes from the ambient
   * request rather than back through the port, which is the same value the AI
   * client stamps on its own line and sends as `x-correlation-id`: one turn is
   * joinable across this log, the client's, and the provider's. Message
   * content never appears here.
   */
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
