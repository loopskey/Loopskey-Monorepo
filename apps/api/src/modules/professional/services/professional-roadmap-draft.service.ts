import { Prisma, RoadmapChatRole, RoadmapDraftStatus } from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";
import { Injectable } from "@nestjs/common";

const DEFAULT_TRANSCRIPT_PAGE = 30;

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
