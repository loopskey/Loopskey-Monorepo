import { RoadmapSource, RoadmapStepProgressStatus } from "@prisma/client";
import { ProfessionalRoadmapDraftService } from "@professional/services/professional-roadmap-draft.service";
import { unidentifiableProtectedSteps } from "@professional/utils/roadmap-edit-preservation.util";
import { PROFESSIONAL_ENGAGEMENT_API } from "@contentAction/public/professional-engagement-api";
import { PROFESSIONAL_CATALOG_API } from "@course/public/professional-catalog-api";
import { validateChangeOperations } from "@professional/utils/roadmap-edit-operations.util";
import { parseStoredOperations } from "@professional/utils/roadmap-edit-operations.util";
import { Inject, Injectable } from "@nestjs/common";
import { changedDraftFields } from "@professional/utils/roadmap-draft-diff.util";
import { toEditableRoadmap } from "@professional/utils/roadmap-edit-shape.util";
import { protectedStepsOf } from "@professional/utils/roadmap-edit-preservation.util";
import { EditBlockReason } from "@professional/types/professional-roadmap-chat.types";
import { toDraftFields } from "@professional/utils/roadmap-draft-fields.util";
import { EditContext } from "@professional/types/professional-roadmap-chat.types";
import { EditState } from "@professional/types/professional-roadmap-chat.types";
import { DraftBase } from "@professional/types/professional-roadmap-chat.types";

import type { ProfessionalEngagementApi } from "@contentAction/public/professional-engagement-api";
import type { ProfessionalCatalogApi } from "@course/public/professional-catalog-api";
import type { CurrentStepProgress } from "@infrastructure/service-ai/service-ai.port";
import type { OperationValidation } from "@professional/utils/roadmap-edit-operations.util";

const EMPTY_VALIDATION: OperationValidation = { accepted: [], rejected: [] };

@Injectable()
export class ProfessionalRoadmapEditContextService {
  constructor(
    @Inject(PROFESSIONAL_ENGAGEMENT_API)
    private readonly engagement: ProfessionalEngagementApi,
    @Inject(PROFESSIONAL_CATALOG_API)
    private readonly catalog: ProfessionalCatalogApi,
    private readonly draftsService: ProfessionalRoadmapDraftService,
  ) {}

  async load(userId: string, roadmapId: string): Promise<EditContext | null> {
    const [row] = await this.catalog.roadmaps([roadmapId]);
    if (!row) return null;
    const roadmap = toEditableRoadmap(row);
    if (
      roadmap.ownerId !== userId ||
      roadmap.source !== RoadmapSource.GENERATED
    )
      return null;

    const { rows } = await this.engagement.roadmapEnrollments({
      userId,
      roadmapIds: [roadmapId],
      take: 1,
    });
    const enrollmentId =
      typeof rows[0]?.id === "string" ? (rows[0].id as string) : null;
    if (!enrollmentId) return null;
    const records = await this.engagement.roadmapStepProgress({
      userId,
      enrollmentIds: [enrollmentId],
    });

    const progress = new Map<string, CurrentStepProgress>();
    for (const record of records) {
      if (record.status === RoadmapStepProgressStatus.COMPLETED)
        progress.set(record.stepId, "COMPLETED");
      else if (record.status === RoadmapStepProgressStatus.IN_PROGRESS)
        progress.set(record.stepId, "IN_PROGRESS");
    }
    return { roadmap, enrollmentId, progress };
  }

  async state(draft: DraftBase): Promise<EditState | null> {
    if (!draft.replacesRoadmapId) return null;
    const context = await this.load(draft.userId, draft.replacesRoadmapId);
    const pending = parseStoredOperations(draft.pendingChanges);
    const validation = context
      ? validateChangeOperations(pending, context.roadmap, context.progress)
      : EMPTY_VALIDATION;
    const changedFields = await this.changedFields(draft);
    const protectedSteps = context
      ? protectedStepsOf(context.roadmap, context.progress)
      : [];
    return {
      context,
      pending,
      validation,
      changedFields,
      hasChanges: pending.length > 0 || changedFields.length > 0,
      protectedSteps,
      unidentifiable: unidentifiableProtectedSteps(protectedSteps),
    };
  }

  blockReason(
    draft: Pick<DraftBase, "needsClarification" | "readyToRegenerate">,
    state: EditState | null,
  ): EditBlockReason | null {
    if (!state?.context) return "NOT_EDITABLE";
    if (state.unidentifiable.length > 0) return "PRESERVATION_UNSUPPORTED";
    if (state.validation.rejected.length > 0) return "STALE_CHANGES";
    if (!state.hasChanges) return "NO_CHANGES";
    if (draft.needsClarification) return "AWAITING_CLARIFICATION";
    if (state.pending.length > 0 && !draft.readyToRegenerate)
      return "CHANGES_NOT_CONFIRMED";
    return null;
  }

  private async changedFields(draft: DraftBase) {
    const sourceIds = await this.draftsService.editSourceChain(
      draft.userId,
      draft,
    );
    const sourceId = sourceIds.at(-1);
    if (!sourceId) return [];
    const source = await this.draftsService.findDraft(draft.userId, sourceId);
    if (!source) return [];
    return changedDraftFields(toDraftFields(source), toDraftFields(draft));
  }
}
