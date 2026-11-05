import { ProfessionalMessageCode } from "@professional/enums/message-code.enum";
import { RoadmapDraftStatus } from "@prisma/client";
import { HttpException } from "@nestjs/common";

export const OPEN_DRAFT_STATUSES: readonly RoadmapDraftStatus[] = [
  RoadmapDraftStatus.COLLECTING,
  RoadmapDraftStatus.READY,
  RoadmapDraftStatus.FAILED,
];

const conflict = (code: ProfessionalMessageCode) =>
  new HttpException({ code, message: code }, 409);

export const draftLockedException = () =>
  conflict(ProfessionalMessageCode.ROADMAP_DRAFT_LOCKED);

export const draftClosedException = () =>
  conflict(ProfessionalMessageCode.ROADMAP_DRAFT_CLOSED);

export const isDraftOpen = (status: RoadmapDraftStatus) =>
  OPEN_DRAFT_STATUSES.includes(status);

export const assertDraftOpen = (status: RoadmapDraftStatus) => {
  if (status === RoadmapDraftStatus.COMPLETED) throw draftClosedException();
  if (!isDraftOpen(status)) throw draftLockedException();
};
