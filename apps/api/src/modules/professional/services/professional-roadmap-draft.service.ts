import { RoadmapDraftStatus, RoadmapDraftStep } from "@prisma/client";
import { Prisma, RoadmapChatRole } from "@prisma/client";
import { ResetInPlaceResult } from "@professional/types/professional-roadmap-chat.types";
import { TranscriptPage } from "@professional/types/professional-roadmap-chat.types";
import { PrismaService } from "@prisma/prisma.service";
import { Injectable } from "@nestjs/common";

const DEFAULT_TRANSCRIPT_PAGE = 30;
const MAX_EDIT_CHAIN_DEPTH = 10;

const OPEN_EDIT_STATUSES: RoadmapDraftStatus[] = [
  RoadmapDraftStatus.COLLECTING,
  RoadmapDraftStatus.READY,
  RoadmapDraftStatus.GENERATING,
  RoadmapDraftStatus.FAILED,
];

const DISCARDABLE_EDIT_STATUSES: RoadmapDraftStatus[] = [
  RoadmapDraftStatus.COLLECTING,
  RoadmapDraftStatus.READY,
  RoadmapDraftStatus.FAILED,
];

export type OpenEditDraftResult = {
  draft: Prisma.RoadmapDraftGetPayload<object>;
  created: boolean;
};

const RESETTABLE_STATUSES: RoadmapDraftStatus[] = [
  RoadmapDraftStatus.COLLECTING,
  RoadmapDraftStatus.READY,
  RoadmapDraftStatus.FAILED,
];

const RESET_FIELDS: Prisma.RoadmapDraftUncheckedUpdateInput = {
  goal: null,
  targetRole: null,
  goalReason: null,
  context: null,
  targetDate: null,
  skillLevel: null,
  timeCommitment: null,
  budgetPreference: null,
  subjects: [],
  preferredFormats: [],
  preferredContentTypes: [],
  preferredDeliveryFormats: [],
  cpdEnabled: false,
  cpdAnswered: false,
  certificationId: null,
  certificationName: null,
  cpdPlanId: null,
  requiredCredits: null,
  completedCredits: null,
  needsClarification: false,
  wasRefused: false,
  failureReason: null,
};

@Injectable()
export class ProfessionalRoadmapDraftService {
  constructor(private readonly prismaService: PrismaService) {}

  private static readonly EDITABLE: RoadmapDraftStatus[] = [
    RoadmapDraftStatus.COLLECTING,
    RoadmapDraftStatus.READY,
  ];

  async createDraft(userId: string, seed?: Prisma.RoadmapDraftCreateInput) {
    const { user: _ignored, ...rest } = seed ?? {};
    return this.prismaService.roadmapDraft.create({
      data: { ...rest, user: { connect: { id: userId } } },
    });
  }

  async findDraft(userId: string, draftId: string) {
    return this.prismaService.roadmapDraft.findFirst({
      where: { id: draftId, userId },
    });
  }

  async deleteDraft(userId: string, draftId: string) {
    const result = await this.prismaService.roadmapDraft.deleteMany({
      where: {
        id: draftId,
        userId,
        status: { in: ProfessionalRoadmapDraftService.EDITABLE },
      },
    });
    return result.count > 0;
  }

  async findRequiredCreditsByIds(draftIds: string[]) {
    if (!draftIds.length) return new Map<string, number | null>();
    const rows = await this.prismaService.roadmapDraft.findMany({
      where: { id: { in: draftIds } },
      select: { id: true, requiredCredits: true },
    });
    return new Map(rows.map((row) => [row.id, row.requiredCredits]));
  }

  async findEditableDraft(userId: string) {
    return this.prismaService.roadmapDraft.findFirst({
      where: {
        userId,
        replacesRoadmapId: null,
        status: { in: ProfessionalRoadmapDraftService.EDITABLE },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  async findOpenEditDraft(userId: string, roadmapId: string) {
    return this.prismaService.roadmapDraft.findFirst({
      where: {
        userId,
        replacesRoadmapId: roadmapId,
        status: { in: OPEN_EDIT_STATUSES },
      },
    });
  }

  async openEditDraft(
    userId: string,
    roadmapId: string,
    source: Prisma.RoadmapDraftGetPayload<object>,
  ): Promise<OpenEditDraftResult> {
    const data = {
      userId,
      goal: source.goal,
      context: source.context,
      subjects: source.subjects,
      targetRole: source.targetRole,
      goalReason: source.goalReason,
      targetDate: source.targetDate,
      skillLevel: source.skillLevel,
      cpdPlanId: source.cpdPlanId,
      cpdEnabled: source.cpdEnabled,
      cpdAnswered: source.cpdAnswered,
      timeCommitment: source.timeCommitment,
      requiredCredits: source.requiredCredits,
      certificationId: source.certificationId,
      budgetPreference: source.budgetPreference,
      completedCredits: source.completedCredits,
      preferredFormats: source.preferredFormats,
      certificationName: source.certificationName,
      preferredContentTypes: source.preferredContentTypes,
      preferredDeliveryFormats: source.preferredDeliveryFormats,
      replacesRoadmapId: roadmapId,
      status: RoadmapDraftStatus.READY,
      currentStep: RoadmapDraftStep.REVIEW,
    } satisfies Prisma.RoadmapDraftUncheckedCreateInput;
    try {
      const draft = await this.prismaService.roadmapDraft.create({ data });
      return { draft, created: true };
    } catch (error) {
      if (
        !(error instanceof Prisma.PrismaClientKnownRequestError) ||
        error.code !== "P2002"
      )
        throw error;
      const winner = await this.findOpenEditDraft(userId, roadmapId);
      if (!winner) throw error;
      return { draft: winner, created: false };
    }
  }

  async discardEditDraft(userId: string, draftId: string) {
    const result = await this.prismaService.roadmapDraft.deleteMany({
      where: {
        id: draftId,
        userId,
        replacesRoadmapId: { not: null },
        status: { in: DISCARDABLE_EDIT_STATUSES },
      },
    });
    return result.count > 0;
  }

  async findActiveGeneration(userId: string) {
    return this.prismaService.roadmapDraft.findFirst({
      where: {
        userId,
        status: {
          in: [RoadmapDraftStatus.GENERATING, RoadmapDraftStatus.FAILED],
        },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  async resetInPlace(
    userId: string,
    draftId: string,
  ): Promise<ResetInPlaceResult> {
    return this.prismaService.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<
        {
          id: string;
          status: RoadmapDraftStatus;
          replacesRoadmapId: string | null;
        }[]
      >`SELECT id, status, "replacesRoadmapId" FROM "RoadmapDraft" WHERE id = ${draftId} AND "userId" = ${userId} FOR UPDATE`;
      const row = rows[0];
      if (!row) return { outcome: "not_found" };
      if (row.replacesRoadmapId) return { outcome: "edit" };
      if (!RESETTABLE_STATUSES.includes(row.status))
        return { outcome: "locked" };

      const firstStep = RoadmapDraftStep.GOAL;
      await tx.roadmapDraft.update({
        where: { id: draftId },
        data: {
          ...RESET_FIELDS,
          status: RoadmapDraftStatus.COLLECTING,
          currentStep: firstStep,
        },
      });
      await tx.roadmapChatMessage.deleteMany({ where: { draftId } });

      const draft = await tx.roadmapDraft.findUniqueOrThrow({
        where: { id: draftId },
      });
      return { outcome: "reset", draft };
    });
  }

  async updateDraft(
    userId: string,
    draftId: string,
    data: Prisma.RoadmapDraftUncheckedUpdateManyInput,
    expectedUpdatedAt?: Date,
  ) {
    const updated = await this.prismaService.roadmapDraft.updateMany({
      where: {
        id: draftId,
        userId,
        ...(expectedUpdatedAt ? { updatedAt: expectedUpdatedAt } : {}),
      },
      data,
    });
    if (!updated.count) return null;
    return this.findDraft(userId, draftId);
  }

  async appendMessage(
    userId: string,
    draftId: string,
    message: Omit<Prisma.RoadmapChatMessageUncheckedCreateInput, "draftId">,
  ) {
    const draft = await this.findDraft(userId, draftId);
    if (!draft) return null;
    return this.prismaService.roadmapChatMessage.create({
      data: { ...message, draftId },
    });
  }

  async appendAssistantMessageIfNew(
    userId: string,
    draftId: string,
    message: Omit<
      Prisma.RoadmapChatMessageUncheckedCreateInput,
      "draftId" | "role"
    >,
  ) {
    const normalizeWidget = (value: unknown) =>
      value === Prisma.JsonNull || value === undefined ? null : value;
    const nextWidget = normalizeWidget(message.widget);

    return this.prismaService.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<{ id: string }[]>`
        SELECT id FROM "RoadmapDraft" WHERE id = ${draftId} AND "userId" = ${userId} FOR UPDATE`;
      if (!rows[0]) return null;

      const last = await tx.roadmapChatMessage.findFirst({
        where: { draftId, role: RoadmapChatRole.ASSISTANT },
        orderBy: { createdAt: "desc" },
      });
      if (
        last &&
        last.content === message.content &&
        last.stepKey === message.stepKey &&
        JSON.stringify(normalizeWidget(last.widget)) ===
          JSON.stringify(nextWidget)
      )
        return last;

      return tx.roadmapChatMessage.create({
        data: { ...message, draftId, role: RoadmapChatRole.ASSISTANT },
      });
    });
  }

  async transcript(userId: string, draftId: string) {
    const draft = await this.findDraft(userId, draftId);
    if (!draft) return null;
    return this.prismaService.roadmapChatMessage.findMany({
      where: { draftId },
      orderBy: { createdAt: "asc" },
    });
  }

  async messageCount(userId: string, draftId: string) {
    const draft = await this.findDraft(userId, draftId);
    if (!draft) return 0;
    return this.prismaService.roadmapChatMessage.count({ where: { draftId } });
  }

  async lastAssistantMessage(userId: string, draftId: string) {
    const draft = await this.findDraft(userId, draftId);
    if (!draft) return null;
    return this.prismaService.roadmapChatMessage.findFirst({
      where: { draftId, role: RoadmapChatRole.ASSISTANT },
      orderBy: { createdAt: "desc" },
    });
  }

  async transcriptPage(
    userId: string,
    draftId: string,
    pagination?: { take?: number; cursor?: string },
  ): Promise<TranscriptPage | null> {
    const draft = await this.findDraft(userId, draftId);
    if (!draft) return null;
    return this.messagePage({ draftId }, pagination);
  }

  async historyPage(
    userId: string,
    draftId: string,
    pagination?: { take?: number; cursor?: string },
  ): Promise<TranscriptPage | null> {
    const draft = await this.findDraft(userId, draftId);
    if (!draft) return null;
    const sourceIds = await this.editSourceChain(userId, draft);
    return this.messagePage({ draftId: { in: sourceIds } }, pagination);
  }

  async editSourceChain(
    userId: string,
    draft: { replacesRoadmapId: string | null },
  ) {
    const ids: string[] = [];
    let roadmapId = draft.replacesRoadmapId;
    while (roadmapId && ids.length < MAX_EDIT_CHAIN_DEPTH) {
      const source = await this.prismaService.roadmapDraft.findFirst({
        where: { userId, enrollment: { is: { userId, roadmapId } } },
        select: { id: true, replacesRoadmapId: true },
      });
      if (!source || ids.includes(source.id)) break;
      ids.unshift(source.id);
      roadmapId = source.replacesRoadmapId;
    }
    return ids;
  }

  async ensureEditGreeting(
    userId: string,
    draftId: string,
    message: Omit<
      Prisma.RoadmapChatMessageUncheckedCreateInput,
      "draftId" | "role"
    >,
  ) {
    return this.prismaService.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<{ id: string }[]>`
        SELECT id FROM "RoadmapDraft" WHERE id = ${draftId} AND "userId" = ${userId} AND "replacesRoadmapId" IS NOT NULL FOR UPDATE`;
      if (!rows[0]) return false;
      const existing = await tx.roadmapChatMessage.count({
        where: { draftId },
      });
      if (existing > 0) return false;
      await tx.roadmapChatMessage.create({
        data: { ...message, draftId, role: RoadmapChatRole.ASSISTANT },
      });
      return true;
    });
  }

  private async messagePage(
    where: Prisma.RoadmapChatMessageWhereInput,
    pagination?: { take?: number; cursor?: string },
  ): Promise<TranscriptPage> {
    const take = pagination?.take ?? DEFAULT_TRANSCRIPT_PAGE;
    const totalCount = await this.prismaService.roadmapChatMessage.count({
      where,
    });

    if (!pagination?.cursor) {
      const latest = await this.prismaService.roadmapChatMessage.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take,
      });
      return {
        totalCount,
        items: latest.reverse(),
        pageInfo: { hasNextPage: false, nextCursor: null },
      };
    }

    const rows = await this.prismaService.roadmapChatMessage.findMany({
      where,
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      take: take + 1,
      cursor: { id: pagination.cursor },
      skip: 1,
    });
    const items = rows.slice(0, take);
    return {
      items,
      totalCount,
      pageInfo: {
        hasNextPage: rows.length > take,
        nextCursor: rows.length > take ? (items.at(-1)?.id ?? null) : null,
      },
    };
  }

  async findCertificationByName(name: string) {
    return this.prismaService.certification.findFirst({
      where: { name: { equals: name.trim(), mode: "insensitive" } },
      select: { id: true, name: true },
    });
  }
}
