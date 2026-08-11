import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { NotFoundException } from "@nestjs/common";
import { ProfessionalGoal, ProfileTermUsage, Role } from "@prisma/client";

import type { ProfessionalProfileService } from "./professional-profile.service";
import type { PrismaService } from "@prisma/prisma.service";

import { CompleteProfessionalOnboardingInput } from "../dtos/complete-professional-onboarding.input";
import { ProfessionalOnboardingService } from "./professional-onboarding.service";

const professional = { id: "user-1", role: Role.PROFESSIONAL };

const buildInput = (
  overrides: Partial<CompleteProfessionalOnboardingInput> = {},
): CompleteProfessionalOnboardingInput => ({
  professionalGoal: ProfessionalGoal.GROW_IN_CURRENT_ROLE,
  currentRole: "Project Manager",
  skillsToImproveIds: [],
  suggestSkills: false,
  ...overrides,
});

const createTx = () => ({
  professionalProfile: {
    upsert: jest.fn().mockResolvedValue({ id: "profile-1" }),
  },
  professionalProfileTerm: {
    deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    createMany: jest.fn().mockResolvedValue({ count: 0 }),
  },
  professionalCredential: {
    upsert: jest.fn().mockResolvedValue({ id: "cred-1" }),
    findFirst: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({ id: "cred-1" }),
    update: jest.fn().mockResolvedValue({ id: "cred-1" }),
  },
});

type TTx = ReturnType<typeof createTx>;

const createPrismaMock = (tx: TTx) => ({
  $transaction: jest.fn(async (callback: (client: TTx) => Promise<unknown>) =>
    callback(tx),
  ),
  professionalProfile: {
    upsert: jest
      .fn()
      .mockResolvedValue({ id: "profile-1", onboardingStartedAt: null }),
    update: jest.fn().mockResolvedValue({ id: "profile-1" }),
  },
  profileTaxonomyTerm: {
    findMany: jest.fn().mockResolvedValue([]),
    findFirst: jest.fn().mockResolvedValue(null),
  },
  certification: {
    findUnique: jest.fn().mockResolvedValue(null),
  },
});

const createService = () => {
  const tx = createTx();
  const prisma = createPrismaMock(tx);
  const profileService = {
    profile: jest.fn().mockResolvedValue({ id: "user-1" }),
  };
  const service = new ProfessionalOnboardingService(
    prisma as unknown as PrismaService,
    profileService as unknown as ProfessionalProfileService,
  );
  return { service, prisma, tx, profileService };
};

describe("ProfessionalOnboardingService.complete", () => {
  it("rejects a caller who is not a professional", async () => {
    const { service } = createService();

    await expect(
      service.complete({ id: "user-2", role: Role.PROVIDER }, buildInput()),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("persists the goal and role on the existing professional profile", async () => {
    const { service, tx, profileService } = createService();

    await service.complete(
      professional,
      buildInput({ professionalGoal: ProfessionalGoal.PREPARE_FOR_NEXT_ROLE }),
    );

    const upsert = tx.professionalProfile.upsert.mock.calls[0][0];
    expect(upsert.where).toEqual({ userId: "user-1" });
    expect(upsert.update.currentRole).toBe("Project Manager");
    expect(upsert.update.professionalGoal).toBe(
      ProfessionalGoal.PREPARE_FOR_NEXT_ROLE,
    );
    expect(upsert.update.onboardingCompletedAt).toBeInstanceOf(Date);
    expect(profileService.profile).toHaveBeenCalledWith(professional);
  });

  it("stores selected skills as SKILL_TO_IMPROVE terms after clearing the old ones", async () => {
    const { service, prisma, tx } = createService();
    prisma.profileTaxonomyTerm.findMany.mockResolvedValueOnce([
      { id: "term-1" },
      { id: "term-2" },
    ]);

    await service.complete(
      professional,
      buildInput({ skillsToImproveIds: ["term-1", "term-2"] }),
    );

    expect(tx.professionalProfileTerm.deleteMany).toHaveBeenCalledWith({
      where: {
        profileId: "profile-1",
        usage: ProfileTermUsage.SKILL_TO_IMPROVE,
      },
    });
    expect(tx.professionalProfileTerm.createMany).toHaveBeenCalledWith({
      data: [
        {
          termId: "term-1",
          profileId: "profile-1",
          usage: ProfileTermUsage.SKILL_TO_IMPROVE,
        },
        {
          termId: "term-2",
          profileId: "profile-1",
          usage: ProfileTermUsage.SKILL_TO_IMPROVE,
        },
      ],
    });
  });

  it("rejects more than three skills", async () => {
    const { service } = createService();

    await expect(
      service.complete(
        professional,
        buildInput({ skillsToImproveIds: ["a", "b", "c", "d"] }),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("rejects a skill that is not an active skill-area term", async () => {
    const { service, prisma } = createService();
    prisma.profileTaxonomyTerm.findMany.mockResolvedValueOnce([
      { id: "term-1" },
    ]);

    await expect(
      service.complete(
        professional,
        buildInput({ skillsToImproveIds: ["term-1", "subject-1"] }),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("fills skills from the taxonomy when the professional asks for suggestions", async () => {
    const { service, prisma, tx } = createService();
    prisma.profileTaxonomyTerm.findFirst.mockResolvedValueOnce({
      groupKey: "BUSINESS",
    });
    prisma.profileTaxonomyTerm.findMany.mockResolvedValueOnce([
      { id: "term-9" },
    ]);

    await service.complete(professional, buildInput({ suggestSkills: true }));

    expect(tx.professionalProfileTerm.createMany).toHaveBeenCalledWith({
      data: [
        {
          termId: "term-9",
          profileId: "profile-1",
          usage: ProfileTermUsage.SKILL_TO_IMPROVE,
        },
      ],
    });
  });

  it("saves no skills when none are chosen and no suggestion was requested", async () => {
    const { service, tx } = createService();

    await service.complete(professional, buildInput());

    expect(tx.professionalProfileTerm.deleteMany).toHaveBeenCalled();
    expect(tx.professionalProfileTerm.createMany).not.toHaveBeenCalled();
  });

  it("ignores certification input when the goal is not certification maintenance", async () => {
    const { service, tx } = createService();

    await service.complete(
      professional,
      buildInput({ certificationName: "PMP" }),
    );

    expect(tx.professionalCredential.create).not.toHaveBeenCalled();
    expect(tx.professionalCredential.upsert).not.toHaveBeenCalled();
  });

  it("creates no credential when the professional has no certification yet", async () => {
    const { service, tx } = createService();

    await service.complete(
      professional,
      buildInput({ professionalGoal: ProfessionalGoal.MAINTAIN_CERTIFICATION }),
    );

    expect(tx.professionalCredential.create).not.toHaveBeenCalled();
    expect(tx.professionalCredential.upsert).not.toHaveBeenCalled();
  });

  it("upserts a catalogue certification on its unique user pair so retries do not duplicate", async () => {
    const { service, prisma, tx } = createService();
    prisma.certification.findUnique.mockResolvedValueOnce({
      id: "cert-1",
      name: "Project Management Professional",
      organization: "PMI",
    });

    await service.complete(
      professional,
      buildInput({
        professionalGoal: ProfessionalGoal.MAINTAIN_CERTIFICATION,
        certificationId: "cert-1",
      }),
    );

    expect(tx.professionalCredential.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId_certificationId: {
            userId: "user-1",
            certificationId: "cert-1",
          },
        },
      }),
    );
  });

  it("rejects an unknown catalogue certification", async () => {
    const { service } = createService();

    await expect(
      service.complete(
        professional,
        buildInput({
          professionalGoal: ProfessionalGoal.MAINTAIN_CERTIFICATION,
          certificationId: "missing",
        }),
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("creates a manually entered credential with an optional issuer", async () => {
    const { service, tx } = createService();

    await service.complete(
      professional,
      buildInput({
        professionalGoal: ProfessionalGoal.MAINTAIN_CERTIFICATION,
        certificationName: "Chartered Engineer",
      }),
    );

    expect(tx.professionalCredential.create).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        name: "Chartered Engineer",
        issuingOrganization: null,
      },
      select: { id: true },
    });
  });

  it("reuses an existing manual credential of the same name instead of duplicating it", async () => {
    const { service, tx } = createService();
    tx.professionalCredential.findFirst.mockResolvedValueOnce({
      id: "cred-existing",
    });

    await service.complete(
      professional,
      buildInput({
        professionalGoal: ProfessionalGoal.MAINTAIN_CERTIFICATION,
        certificationName: "Chartered Engineer",
        certificationIssuer: "Engineers Ireland",
      }),
    );

    expect(tx.professionalCredential.create).not.toHaveBeenCalled();
    expect(tx.professionalCredential.update).toHaveBeenCalledWith({
      where: { id: "cred-existing" },
      data: { issuingOrganization: "Engineers Ireland" },
    });
  });

  it("rejects an issuer supplied without a certification name", async () => {
    const { service } = createService();

    await expect(
      service.complete(
        professional,
        buildInput({
          professionalGoal: ProfessionalGoal.MAINTAIN_CERTIFICATION,
          certificationIssuer: "PMI",
        }),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("rejects an empty role", async () => {
    const { service } = createService();

    await expect(
      service.complete(professional, buildInput({ currentRole: "" })),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe("ProfessionalOnboardingService.start", () => {
  it("stamps the start time the first time the wizard is opened", async () => {
    const { service, prisma } = createService();

    await service.start(professional);

    expect(prisma.professionalProfile.update).toHaveBeenCalledWith({
      where: { id: "profile-1" },
      data: { onboardingStartedAt: expect.any(Date) },
    });
  });

  it("keeps the original start time when the wizard is reopened", async () => {
    const { service, prisma } = createService();
    prisma.professionalProfile.upsert.mockResolvedValueOnce({
      id: "profile-1",
      onboardingStartedAt: new Date("2026-08-01T00:00:00.000Z"),
    });

    await service.start(professional);

    expect(prisma.professionalProfile.update).not.toHaveBeenCalled();
  });
});
