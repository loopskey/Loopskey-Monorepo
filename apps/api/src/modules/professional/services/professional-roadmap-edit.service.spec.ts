import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { BadRequestException } from "@nestjs/common";
import { RoadmapSource, Role } from "@prisma/client";
import { ProfessionalMessageCode } from "@professional/enums/message-code.enum";
import { TUser } from "@common/types/user.types";

import { ProfessionalRoadmapDraftService } from "@professional/services/professional-roadmap-draft.service";
import { ProfessionalRoadmapChatService } from "@professional/services/professional-roadmap-chat.service";
import { ProfessionalRoadmapEditService } from "@professional/services/professional-roadmap-edit.service";

const USER = { id: "user-1", role: Role.PROFESSIONAL } as TUser;

type TSetup = {
  open?: { id: string } | null;
  enrollment?: { id: string; draftId: string | null } | null;
  roadmap?: Record<string, unknown> | null;
  source?: Record<string, unknown> | null;
};

const setup = (options: TSetup = {}) => {
  const enrollment =
    options.enrollment === undefined
      ? { id: "enrollment-1", draftId: "draft-1" }
      : options.enrollment;
  const roadmap =
    options.roadmap === undefined
      ? { id: "roadmap-1", source: RoadmapSource.GENERATED, ownerId: "user-1" }
      : options.roadmap;
  const source =
    options.source === undefined ? { id: "draft-1" } : options.source;

  const engagement = {
    roadmapEnrollments: jest.fn().mockResolvedValue({
      rows: enrollment ? [enrollment] : [],
      totalCount: enrollment ? 1 : 0,
    }),
  };
  const catalog = {
    roadmaps: jest.fn().mockResolvedValue(roadmap ? [roadmap] : []),
  };
  const drafts = {
    findOpenEditDraft: jest.fn().mockResolvedValue(options.open ?? null),
    findDraft: jest.fn().mockResolvedValue(source),
    openEditDraft: jest
      .fn()
      .mockResolvedValue({ draft: { id: "edit-1" }, created: true }),
    discardEditDraft: jest.fn().mockResolvedValue(true),
  };
  const chat = {
    draft: jest.fn(async (_user: TUser, draftId: string) => ({ id: draftId })),
  };
  const service = new ProfessionalRoadmapEditService(
    engagement as never,
    catalog as never,
    drafts as unknown as ProfessionalRoadmapDraftService,
    chat as unknown as ProfessionalRoadmapChatService,
  );
  return { service, engagement, catalog, drafts, chat };
};

describe("ProfessionalRoadmapEditService.startEdit", () => {
  it("copies the saved brief into a new edit draft and returns its view", async () => {
    const { service, drafts, chat } = setup();

    const view = await service.startEdit(USER, "roadmap-1");

    expect(drafts.findDraft).toHaveBeenCalledWith("user-1", "draft-1");
    expect(drafts.openEditDraft).toHaveBeenCalledWith("user-1", "roadmap-1", {
      id: "draft-1",
    });
    expect(chat.draft).toHaveBeenCalledWith(USER, "edit-1");
    expect(view).toEqual({ id: "edit-1" });
  });

  it("returns the edit that is already open instead of starting another", async () => {
    const { service, drafts, engagement, chat } = setup({
      open: { id: "edit-existing" },
    });

    const view = await service.startEdit(USER, "roadmap-1");

    expect(view).toEqual({ id: "edit-existing" });
    expect(chat.draft).toHaveBeenCalledWith(USER, "edit-existing");
    expect(engagement.roadmapEnrollments).not.toHaveBeenCalled();
    expect(drafts.openEditDraft).not.toHaveBeenCalled();
  });

  it("looks the open edit up for the owner and the roadmap together", async () => {
    const { service, drafts } = setup();

    await service.startEdit(USER, "roadmap-1");

    expect(drafts.findOpenEditDraft).toHaveBeenCalledWith(
      "user-1",
      "roadmap-1",
    );
  });

  it("refuses a roadmap the professional is not enrolled in", async () => {
    const { service, drafts } = setup({ enrollment: null });

    await expect(service.startEdit(USER, "roadmap-1")).rejects.toThrow(
      NotFoundException,
    );
    expect(drafts.openEditDraft).not.toHaveBeenCalled();
  });

  it.each([
    ["a catalog roadmap", { source: RoadmapSource.CATALOG, ownerId: null }],
    [
      "a roadmap owned by someone else",
      { source: RoadmapSource.GENERATED, ownerId: "user-2" },
    ],
  ])("refuses %s", async (_name, roadmap) => {
    const { service, drafts } = setup({ roadmap });

    await expect(service.startEdit(USER, "roadmap-1")).rejects.toThrow(
      ProfessionalMessageCode.ROADMAP_NOT_EDITABLE,
    );
    expect(drafts.openEditDraft).not.toHaveBeenCalled();
  });

  it("refuses a roadmap whose saved brief is gone", async () => {
    const { service, drafts } = setup({ source: null });

    await expect(service.startEdit(USER, "roadmap-1")).rejects.toThrow(
      ProfessionalMessageCode.ROADMAP_BRIEF_UNAVAILABLE,
    );
    expect(drafts.openEditDraft).not.toHaveBeenCalled();
  });

  it("refuses an enrollment that has no draft behind it", async () => {
    const { service, drafts } = setup({
      enrollment: { id: "enrollment-1", draftId: null },
    });

    await expect(service.startEdit(USER, "roadmap-1")).rejects.toThrow(
      BadRequestException,
    );
    expect(drafts.findDraft).not.toHaveBeenCalled();
  });

  it("refuses an actor who is not a professional", async () => {
    const { service } = setup();

    await expect(
      service.startEdit(
        { id: "user-9", role: Role.PROVIDER } as TUser,
        "roadmap-1",
      ),
    ).rejects.toThrow(ForbiddenException);
  });
});

describe("ProfessionalRoadmapEditService.discardEdit", () => {
  it("discards the draft for its owner", async () => {
    const { service, drafts } = setup();

    await expect(service.discardEdit(USER, "edit-1")).resolves.toBe(true);
    expect(drafts.discardEditDraft).toHaveBeenCalledWith("user-1", "edit-1");
  });

  it("refuses an actor who is not a professional", async () => {
    const { service, drafts } = setup();

    await expect(
      service.discardEdit(
        { id: "user-9", role: Role.ADMIN } as TUser,
        "edit-1",
      ),
    ).rejects.toThrow(ForbiddenException);
    expect(drafts.discardEditDraft).not.toHaveBeenCalled();
  });
});
