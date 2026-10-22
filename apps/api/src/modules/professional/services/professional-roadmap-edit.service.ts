import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ProfessionalRoadmapDraftService } from "@professional/services/professional-roadmap-draft.service";
import { ProfessionalRoadmapChatService } from "@professional/services/professional-roadmap-chat.service";
import { PROFESSIONAL_ENGAGEMENT_API } from "@contentAction/public/professional-engagement-api";
import { PROFESSIONAL_CATALOG_API } from "@course/public/professional-catalog-api";
import { ProfessionalMessageCode } from "@professional/enums/message-code.enum";
import { RoadmapSource, Role } from "@prisma/client";
import { TUser } from "@common/types/user.types";

import { type ProfessionalEngagementApi } from "@contentAction/public/professional-engagement-api";
import { type ProfessionalCatalogApi } from "@course/public/professional-catalog-api";

@Injectable()
export class ProfessionalRoadmapEditService {
  constructor(
    @Inject(PROFESSIONAL_ENGAGEMENT_API)
    private readonly engagement: ProfessionalEngagementApi,
    @Inject(PROFESSIONAL_CATALOG_API)
    private readonly catalog: ProfessionalCatalogApi,
    private readonly drafts: ProfessionalRoadmapDraftService,
    private readonly chat: ProfessionalRoadmapChatService,
  ) {}

  private assertProfessional(user: TUser) {
    if (user.role !== Role.PROFESSIONAL)
      throw new ForbiddenException(
        ProfessionalMessageCode.PROFESSIONAL_ACCESS_REQUIRED,
      );
  }

  async startEdit(user: TUser, roadmapId: string) {
    this.assertProfessional(user);

    const open = await this.drafts.findOpenEditDraft(user.id, roadmapId);
    if (open) return this.chat.draft(user, open.id);

    const enrollment = await this.enrollmentOf(user, roadmapId);
    await this.assertEditable(user, roadmapId);

    const source =
      typeof enrollment.draftId === "string"
        ? await this.drafts.findDraft(user.id, enrollment.draftId)
        : null;
    if (!source)
      throw new BadRequestException({
        code: ProfessionalMessageCode.ROADMAP_BRIEF_UNAVAILABLE,
        message: ProfessionalMessageCode.ROADMAP_BRIEF_UNAVAILABLE,
      });

    const { draft } = await this.drafts.openEditDraft(
      user.id,
      roadmapId,
      source,
    );
    return this.chat.draft(user, draft.id);
  }

  async discardEdit(user: TUser, draftId: string) {
    this.assertProfessional(user);
    return this.drafts.discardEditDraft(user.id, draftId);
  }

  private async enrollmentOf(user: TUser, roadmapId: string) {
    const { rows } = await this.engagement.roadmapEnrollments({
      userId: user.id,
      roadmapIds: [roadmapId],
      take: 1,
    });
    const [enrollment] = rows;
    if (!enrollment)
      throw new NotFoundException(
        ProfessionalMessageCode.ROADMAP_ENROLLMENT_NOT_FOUND,
      );
    return enrollment;
  }

  private async assertEditable(user: TUser, roadmapId: string) {
    const [roadmap] = await this.catalog.roadmaps([roadmapId]);
    if (
      !roadmap ||
      roadmap.source !== RoadmapSource.GENERATED ||
      roadmap.ownerId !== user.id
    )
      throw new BadRequestException({
        code: ProfessionalMessageCode.ROADMAP_NOT_EDITABLE,
        message: ProfessionalMessageCode.ROADMAP_NOT_EDITABLE,
      });
  }
}
