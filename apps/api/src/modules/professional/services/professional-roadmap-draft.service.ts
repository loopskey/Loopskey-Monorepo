import { RoadmapDraftStatus, RoadmapDraftStep } from "@prisma/client";
import { Prisma, RoadmapChatRole } from "@prisma/client";
import { COACH_QUESTION_CODE } from "@professional/utils/roadmap-coach.util";
import { COACH_INTRO_CODE } from "@professional/utils/roadmap-coach.util";
import { coachWidgetFor } from "@professional/utils/roadmap-coach.util";
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
    seeded: Partial<Prisma.RoadmapDraftUncheckedUpdateInput>,
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
          ...seeded,
          status: RoadmapDraftStatus.COLLECTING,
          currentStep: firstStep,
        },
      });
      await tx.roadmapChatMessage.deleteMany({ where: { draftId } });
      await tx.roadmapChatMessage.createMany({
        data: [
          {
            draftId,
            stepKey: firstStep,
            content: COACH_INTRO_CODE,
            role: RoadmapChatRole.ASSISTANT,
          },
          {
            draftId,
            stepKey: firstStep,
            content: COACH_QUESTION_CODE,
            role: RoadmapChatRole.ASSISTANT,
            widget: (coachWidgetFor(firstStep) ??
              Prisma.JsonNull) as unknown as Prisma.InputJsonValue,
          },
        ],
      });

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
  ) {
    const updated = await this.prismaService.roadmapDraft.updateMany({
      where: { id: draftId, userId },
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

  /**
   * The chat service's in-process `serialize()` only orders calls within one
   * API instance; with more than one instance, two near-simultaneous turns
   * for the same draft can each read the same "last message" and both decide
   * to append it, producing a visible duplicate question. Locking the draft
   * row for the duration of the read-then-insert makes that check-then-act
   * atomic across every instance, the way `resetInPlace` already locks it
   * for a reset.
   *
   * `Prisma.JsonNull` is the write-side sentinel for a literal JSON null; a
   * value read back out of the column is the plain JS `null` instead. Without
   * normalising, `JSON.stringify(Prisma.JsonNull)` ("{}") never equals
   * `JSON.stringify(null)` ("null"), so every widget-less message compared
   * itself as "different" and the guard below never caught a real repeat.
   *
   * `content` is frequently just the generic `ROADMAP_COACH_QUESTION` code —
   * the frontend resolves the actual question text from `stepKey`, not from
   * `content` — so `stepKey` must be part of the comparison too. Without it,
   * two different widget-less questions in a row (same code, different step)
   * would compare equal and the second would be silently dropped instead of
   * appended.
   */
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
