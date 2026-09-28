import { BadRequestException } from "@nestjs/common";
import { ProfileTaxonomyKind, Role } from "@prisma/client";

import { ProfessionalProfileService } from "./professional-profile.service";

const professional = { id: "user-1", role: Role.PROFESSIONAL };

const setup = () => {
  const prisma = {
    professionalProfile: {
      upsert: jest.fn().mockResolvedValue({ id: "profile-1" }),
    },
    profileTaxonomyTerm: {
      findMany: jest.fn().mockResolvedValue([]),
    },
  };
  const taxonomy = {
    resolveCurrentRole: jest.fn().mockResolvedValue({
      currentRole: "Data Analyst",
      currentRoleTermId: "role-1",
    }),
  };
  const service = new ProfessionalProfileService(
    prisma as never,
    {} as never,
    taxonomy as never,
    {} as never,
    {} as never,
  );
  jest.spyOn(service, "profile").mockResolvedValue({} as never);
  return { service, prisma, taxonomy };
};

describe("ProfessionalProfileService updateDetails", () => {
  it("stores a resolved canonical role alongside the other details", async () => {
    const { service, prisma, taxonomy } = setup();

    await service.updateDetails(professional, {
      currentRoleTermId: "role-1",
      currentRole: null,
      workLocation: "Paris",
    });

    expect(taxonomy.resolveCurrentRole).toHaveBeenCalledWith({
      currentRoleTermId: "role-1",
      currentRole: null,
    });
    expect(prisma.professionalProfile.upsert.mock.calls[0][0].update).toEqual({
      workLocation: "Paris",
      currentRole: "Data Analyst",
      currentRoleTermId: "role-1",
    });
  });

  it("leaves the role untouched when the edit does not mention it", async () => {
    const { service, prisma, taxonomy } = setup();

    await service.updateDetails(professional, { workLocation: "Lyon" });

    expect(taxonomy.resolveCurrentRole).not.toHaveBeenCalled();
    expect(prisma.professionalProfile.upsert.mock.calls[0][0].update).toEqual({
      workLocation: "Lyon",
    });
  });

  it("writes nothing when the role is rejected", async () => {
    const { service, prisma, taxonomy } = setup();
    taxonomy.resolveCurrentRole.mockRejectedValue(new BadRequestException());

    await expect(
      service.updateDetails(professional, { currentRoleTermId: "skill-1" }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.professionalProfile.upsert).not.toHaveBeenCalled();
  });
});

describe("ProfessionalProfileService taxonomy", () => {
  it("serves the small subject list grouped by category", async () => {
    const { service, prisma } = setup();
    prisma.profileTaxonomyTerm.findMany.mockResolvedValue([
      {
        id: "s1",
        kind: ProfileTaxonomyKind.SUBJECT,
        key: "S1",
        label: "Data Science",
        sortOrder: 0,
        isActive: true,
        group: { id: "g1", key: "TECHNOLOGY", label: "Technology" },
      },
    ]);

    const groups = await service.taxonomy(
      professional,
      ProfileTaxonomyKind.SUBJECT,
    );

    expect(groups).toEqual([
      expect.objectContaining({
        groupKey: "TECHNOLOGY",
        groupLabel: "Technology",
        terms: [expect.objectContaining({ id: "s1", groupKey: "TECHNOLOGY" })],
      }),
    ]);
  });

  it.each([ProfileTaxonomyKind.ROLE, ProfileTaxonomyKind.SKILL_AREA])(
    "refuses to download the whole %s catalogue",
    async (kind) => {
      const { service, prisma } = setup();
      await expect(service.taxonomy(professional, kind)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(prisma.profileTaxonomyTerm.findMany).not.toHaveBeenCalled();
    },
  );
});
