import { Prisma, RoadmapDraftStatus } from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";
import { Injectable } from "@nestjs/common";

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
    data: Prisma.RoadmapDraftUpdateInput,
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
}
