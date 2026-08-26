import { Role, RoadmapStepProgressStatus } from "@prisma/client";

import { ProfessionalRoadmapProgressService } from "./professional-roadmap-progress.service";
import { TUser } from "@common/types/user.types";

const USER = { id: "user-1", role: Role.PROFESSIONAL } as TUser;

const ROADMAP = {
  id: "roadmap-1",
  phases: [
    { id: "p1", steps: [{ id: "s1" }, { id: "s2" }] },
    { id: "p2", steps: [{ id: "s3" }] },
  ],
};

const ENROLLMENT = {
  id: "enrollment-1",
  userId: "user-1",
  roadmapId: "roadmap-1",
  progress: 0,
  status: "ACTIVE",
  targetDate: null,
  completedAt: null,
  draftId: null,
};

const record = (stepId: string) => ({
  stepId,
  enrollmentId: "enrollment-1",
  status: RoadmapStepProgressStatus.COMPLETED,
  completedAt: new Date("2026-08-01"),
});

const buildHarness = (options: { records?: unknown[] } = {}) => {
  const engagement = {
    roadmapEnrollmentById: jest.fn().mockResolvedValue(ENROLLMENT),
    roadmapStepProgress: jest.fn().mockResolvedValue(options.records ?? []),
    startRoadmapStep: jest.fn().mockResolvedValue({}),
    completeRoadmapStep: jest.fn().mockResolvedValue({}),
    completeRoadmapEnrollment: jest.fn().mockResolvedValue(undefined),
  };
  const catalog = { roadmaps: jest.fn().mockResolvedValue([ROADMAP]) };
  const candidates = { build: jest.fn().mockResolvedValue([]) };
  const prisma = {
    roadmapDraft: { findUnique: jest.fn().mockResolvedValue(null) },
  };
  const service = new ProfessionalRoadmapProgressService(
    engagement as never,
    catalog as never,
    candidates as never,
    prisma as never,
  );
  return { service, engagement, catalog, candidates, prisma };
};

describe("ProfessionalRoadmapProgressService", () => {
  describe("guards", () => {
    it("refuses an actor who is not a professional", async () => {
      const { service, engagement } = buildHarness();

      await expect(
        service.completeStep(
          { id: "user-1", role: Role.ADMIN } as TUser,
          "enrollment-1",
          "s1",
        ),
      ).rejects.toThrow("Only professional users");
      expect(engagement.completeRoadmapStep).not.toHaveBeenCalled();
    });

    it("refuses an enrollment that is not the caller's", async () => {
      const { service, engagement } = buildHarness();
      engagement.roadmapEnrollmentById.mockResolvedValue(null);

      await expect(
        service.completeStep(USER, "enrollment-1", "s1"),
      ).rejects.toThrow("ROADMAP_ENROLLMENT_NOT_FOUND");
      expect(engagement.completeRoadmapStep).not.toHaveBeenCalled();
    });

    it("rejects a step that belongs to another roadmap without writing", async () => {
      // Ownership of the enrollment is not enough: the progress row is keyed on
      // (enrollment, step) and would happily accept a foreign step.
      const { service, engagement } = buildHarness();

      await expect(
        service.completeStep(USER, "enrollment-1", "step-from-elsewhere"),
      ).rejects.toThrow("ROADMAP_STEP_NOT_IN_ENROLLMENT");
      expect(engagement.completeRoadmapStep).not.toHaveBeenCalled();
    });

    it("applies the same rejection to starting a step", async () => {
      const { service, engagement } = buildHarness();

      await expect(
        service.startStep(USER, "enrollment-1", "step-from-elsewhere"),
      ).rejects.toThrow("ROADMAP_STEP_NOT_IN_ENROLLMENT");
      expect(engagement.startRoadmapStep).not.toHaveBeenCalled();
    });
  });

  describe("completeStep", () => {
    it("returns the step, its phase and the roadmap total together", async () => {
      const { service } = buildHarness({ records: [record("s1")] });

      const result = await service.completeStep(USER, "enrollment-1", "s1");

      expect(result).toMatchObject({
        stepId: "s1",
        phaseId: "p1",
        totalSteps: 3,
        completedSteps: 1,
        progress: 33,
        phaseProgress: 50,
        phaseCompleted: false,
        status: RoadmapStepProgressStatus.COMPLETED,
      });
    });

    it("completes the enrollment when the last step is done", async () => {
      const { service, engagement } = buildHarness({
        records: [record("s1"), record("s2"), record("s3")],
      });

      const result = await service.completeStep(USER, "enrollment-1", "s3");

      expect(result.progress).toBe(100);
      expect(engagement.completeRoadmapEnrollment).toHaveBeenCalledWith({
        userId: "user-1",
        enrollmentId: "enrollment-1",
      });
    });

    it("does not complete the enrollment while steps remain", async () => {
      const { service, engagement } = buildHarness({ records: [record("s1")] });

      await service.completeStep(USER, "enrollment-1", "s1");

      expect(engagement.completeRoadmapEnrollment).not.toHaveBeenCalled();
    });

    it("is unchanged by a repeat of the same completion", async () => {
      const { service } = buildHarness({ records: [record("s1")] });

      const first = await service.completeStep(USER, "enrollment-1", "s1");
      const second = await service.completeStep(USER, "enrollment-1", "s1");

      expect(second.progress).toBe(first.progress);
      expect(second.completedSteps).toBe(first.completedSteps);
    });
  });

  describe("startStep", () => {
    it("records the start and reports the step in progress", async () => {
      const { service, engagement } = buildHarness();

      const result = await service.startStep(USER, "enrollment-1", "s1");

      expect(engagement.startRoadmapStep).toHaveBeenCalledWith({
        userId: "user-1",
        enrollmentId: "enrollment-1",
        stepId: "s1",
      });
      expect(result.status).toBe(RoadmapStepProgressStatus.IN_PROGRESS);
    });

    it("does not move the roadmap percentage", async () => {
      const { service } = buildHarness();

      const result = await service.startStep(USER, "enrollment-1", "s1");

      expect(result.progress).toBe(0);
    });
  });
});
