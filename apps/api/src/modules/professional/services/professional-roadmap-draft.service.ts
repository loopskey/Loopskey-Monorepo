import { RoadmapDraftStatus, RoadmapDraftStep } from "@prisma/client";
import { Prisma, RoadmapChatRole } from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";
import { Injectable } from "@nestjs/common";

const DEFAULT_TRANSCRIPT_PAGE = 30;

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
  certificationId: null,
  certificationName: null,
  cpdPlanId: null,
  requiredCredits: null,
  completedCredits: null,
  needsClarification: false,
  wasRefused: false,
  failureReason: null,
};

export type ResetInPlaceResult =
  | { outcome: "reset"; draft: Prisma.RoadmapDraftGetPayload<object> }
  | { outcome: "not_found" }
  | { outcome: "locked" };

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
        status: { in: ProfessionalRoadmapDraftService.EDITABLE },
      },
      orderBy: { updatedAt: "desc" },
    });
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
        { id: string; status: RoadmapDraftStatus }[]
      >`SELECT id, status FROM "RoadmapDraft" WHERE id = ${draftId} AND "userId" = ${userId} FOR UPDATE`;
      const row = rows[0];
      if (!row) return { outcome: "not_found" };
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
  ) {
    const draft = await this.findDraft(userId, draftId);
    if (!draft) return null;
    const take = pagination?.take ?? DEFAULT_TRANSCRIPT_PAGE;
    const [totalCount, rows] = await Promise.all([
      this.prismaService.roadmapChatMessage.count({ where: { draftId } }),
      this.prismaService.roadmapChatMessage.findMany({
        where: { draftId },
        orderBy: { createdAt: "asc" },
        take: take + 1,
        ...(pagination?.cursor
          ? { cursor: { id: pagination.cursor }, skip: 1 }
          : {}),
      }),
    ]);
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
