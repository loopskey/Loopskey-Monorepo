import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { ProfileTaxonomyKind, Role } from "@prisma/client";

import { ProfessionalMessageCode } from "@professional/enums/message-code.enum";
import { ProfessionalTaxonomyService } from "./professional-taxonomy.service";

const professional = { id: "user-1", role: Role.PROFESSIONAL };

const row = (
  id: string,
  groupKey = "DATA",
  kind: ProfileTaxonomyKind = ProfileTaxonomyKind.SKILL_AREA,
) => ({
  id,
  kind,
  key: id.toUpperCase(),
  label: id,
  sortOrder: 0,
  isActive: true,
  group: { id: `g-${groupKey}`, key: groupKey, label: groupKey },
});

const setup = () => {
  const prisma = {
    profileTaxonomyGroup: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue({ id: "g-DATA", isActive: true }),
    },
    profileTaxonomyTerm: {
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn().mockResolvedValue(null),
      count: jest.fn().mockResolvedValue(0),
    },
    profileTaxonomyGroupMapping: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    professionalProfileTerm: {
      groupBy: jest.fn().mockResolvedValue([]),
    },
    professionalProfile: {
      findUnique: jest.fn().mockResolvedValue(null),
    },
    $queryRaw: jest.fn().mockResolvedValue([]),
  };
  return {
    prisma,
    service: new ProfessionalTaxonomyService(prisma as never),
  };
};

const codeOf = async (work: Promise<unknown>) => {
  try {
    await work;
  } catch (error) {
    return error instanceof BadRequestException ? error.message : error;
  }
  return null;
};

describe("ProfessionalTaxonomyService access", () => {
  it("refuses a caller who is not a professional", async () => {
    const { service } = setup();
    await expect(
      service.groups(
        { id: "u", role: Role.PROVIDER },
        ProfileTaxonomyKind.ROLE,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});

describe("ProfessionalTaxonomyService groups", () => {
  it("lists active categories of one kind with their active-term count, hiding empty ones", async () => {
    const { service, prisma } = setup();
    prisma.profileTaxonomyGroup.findMany.mockResolvedValue([
      {
        id: "g1",
        kind: "ROLE",
        key: "A",
        label: "A",
        sortOrder: 0,
        _count: { terms: 3 },
      },
      {
        id: "g2",
        kind: "ROLE",
        key: "B",
        label: "B",
        sortOrder: 1,
        _count: { terms: 0 },
      },
    ]);

    const groups = await service.groups(professional, ProfileTaxonomyKind.ROLE);

    expect(prisma.profileTaxonomyGroup.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { kind: ProfileTaxonomyKind.ROLE, isActive: true },
      }),
    );
    expect(groups).toEqual([
      {
        id: "g1",
        kind: "ROLE",
        key: "A",
        label: "A",
        sortOrder: 0,
        termCount: 3,
      },
    ]);
  });
});

describe("ProfessionalTaxonomyService terms", () => {
  it("rejects a search shorter than two non-space characters", async () => {
    const { service } = setup();
    await expect(
      codeOf(
        service.terms(professional, {
          kind: ProfileTaxonomyKind.ROLE,
          search: " a ",
        }),
      ),
    ).resolves.toBe(ProfessionalMessageCode.PROFILE_TAXONOMY_SEARCH_TOO_SHORT);
  });

  it("searches active terms of the kind case-insensitively and in a stable order", async () => {
    const { service, prisma } = setup();

    await service.terms(professional, {
      kind: ProfileTaxonomyKind.ROLE,
      search: "  data   analyst ",
    });

    expect(prisma.profileTaxonomyTerm.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          kind: ProfileTaxonomyKind.ROLE,
          isActive: true,
          label: { contains: "data analyst", mode: "insensitive" },
        },
        orderBy: [{ sortOrder: "asc" }, { label: "asc" }, { id: "asc" }],
      }),
    );
  });

  it("filters a category through its group id", async () => {
    const { service, prisma } = setup();

    await service.terms(professional, {
      kind: ProfileTaxonomyKind.SKILL_AREA,
      groupKey: "DATA",
    });

    expect(prisma.profileTaxonomyGroup.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          kind_key: { kind: ProfileTaxonomyKind.SKILL_AREA, key: "DATA" },
        },
      }),
    );
    expect(prisma.profileTaxonomyTerm.findMany.mock.calls[0][0].where).toEqual({
      kind: ProfileTaxonomyKind.SKILL_AREA,
      isActive: true,
      groupId: "g-DATA",
    });
  });

  it("returns an empty page for an unknown or inactive category", async () => {
    const { service, prisma } = setup();
    prisma.profileTaxonomyGroup.findUnique.mockResolvedValue({
      id: "g-OLD",
      isActive: false,
    });

    await expect(
      service.terms(professional, {
        kind: ProfileTaxonomyKind.SKILL_AREA,
        groupKey: "OLD",
      }),
    ).resolves.toMatchObject({ items: [], totalCount: 0 });
    expect(prisma.profileTaxonomyTerm.findMany).not.toHaveBeenCalled();
  });

  it("pages with a cursor and reports the next one", async () => {
    const { service, prisma } = setup();
    prisma.profileTaxonomyTerm.findMany.mockResolvedValue([
      row("a"),
      row("b"),
      row("c"),
    ]);
    prisma.profileTaxonomyTerm.count.mockResolvedValue(9);

    const page = await service.terms(professional, {
      kind: ProfileTaxonomyKind.SKILL_AREA,
      cursor: "z",
      take: 2,
    });

    expect(prisma.profileTaxonomyTerm.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 3, cursor: { id: "z" }, skip: 1 }),
    );
    expect(page.items.map((item) => item.id)).toEqual(["a", "b"]);
    expect(page.items[0]).toMatchObject({
      groupKey: "DATA",
      groupLabel: "DATA",
    });
    expect(page.totalCount).toBe(9);
    expect(page.pageInfo).toEqual({ hasNextPage: true, nextCursor: "b" });
  });

  it("caps a page at the server maximum", async () => {
    const { service, prisma } = setup();

    await service.terms(professional, {
      kind: ProfileTaxonomyKind.SKILL_AREA,
      take: 5000,
    });

    expect(prisma.profileTaxonomyTerm.findMany.mock.calls[0][0].take).toBe(51);
  });
});

describe("ProfessionalTaxonomyService termsByIds", () => {
  it("hydrates saved ids in the requested order, inactive ones included", async () => {
    const { service, prisma } = setup();
    prisma.profileTaxonomyTerm.findMany.mockResolvedValue([
      { ...row("b"), isActive: false },
      row("a"),
    ]);

    const terms = await service.termsByIds(professional, [
      "a",
      "b",
      "a",
      "gone",
    ]);

    expect(prisma.profileTaxonomyTerm.findMany.mock.calls[0][0].where).toEqual({
      id: { in: ["a", "b", "gone"] },
    });
    expect(terms.map((term) => [term.id, term.isActive])).toEqual([
      ["a", true],
      ["b", false],
    ]);
  });

  it("refuses to hydrate more than fifty ids at once", async () => {
    const { service } = setup();
    const ids = Array.from({ length: 51 }, (_, index) => `t${index}`);
    await expect(service.termsByIds(professional, ids)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});

describe("ProfessionalTaxonomyService skill suggestions", () => {
  it("interleaves skills from the role's mapped categories in priority order", async () => {
    const { service, prisma } = setup();
    prisma.profileTaxonomyTerm.findFirst.mockResolvedValue({
      groupId: "g-role",
    });
    prisma.profileTaxonomyGroupMapping.findMany.mockResolvedValue([
      { skillGroupId: "g-first" },
      { skillGroupId: "g-second" },
    ]);
    prisma.profileTaxonomyTerm.findMany
      .mockResolvedValueOnce([
        row("f1", "FIRST"),
        row("f2", "FIRST"),
        row("f3", "FIRST"),
      ])
      .mockResolvedValueOnce([row("s1", "SECOND")]);

    const result = await service.suggestSkills("role-1", 4);

    expect(prisma.profileTaxonomyTerm.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "role-1", kind: ProfileTaxonomyKind.ROLE, isActive: true },
      }),
    );
    expect(result.isFallback).toBe(false);
    expect(result.items.map((item) => item.id)).toEqual([
      "f1",
      "s1",
      "f2",
      "f3",
    ]);
  });

  it("falls back to popular skills, and says so, for a custom role", async () => {
    const { service, prisma } = setup();
    prisma.professionalProfileTerm.groupBy.mockResolvedValue([
      { termId: "popular", _count: { termId: 7 } },
    ]);
    prisma.profileTaxonomyTerm.findMany
      .mockResolvedValueOnce([row("popular")])
      .mockResolvedValueOnce([row("filler")]);

    const result = await service.suggestSkills(null, 2);

    expect(result.isFallback).toBe(true);
    expect(result.items.map((item) => item.id)).toEqual(["popular", "filler"]);
    expect(prisma.profileTaxonomyGroupMapping.findMany).not.toHaveBeenCalled();
  });

  it("falls back when the role is not an active role term", async () => {
    const { service } = setup();
    await expect(service.suggestSkills("skill-1", 3)).resolves.toMatchObject({
      isFallback: true,
    });
  });
});

describe("ProfessionalTaxonomyService current role", () => {
  it("never accepts an id and a custom label together", async () => {
    const { service } = setup();
    await expect(
      codeOf(
        service.resolveCurrentRole({
          currentRoleTermId: "role-1",
          currentRole: "Something else",
        }),
      ),
    ).resolves.toBe(ProfessionalMessageCode.PROFILE_CURRENT_ROLE_CONFLICT);
  });

  it("stores the canonical label for an active role id", async () => {
    const { service, prisma } = setup();
    prisma.profileTaxonomyTerm.findFirst.mockResolvedValue({
      id: "role-1",
      label: "Data Analyst",
    });

    await expect(
      service.resolveCurrentRole({ currentRoleTermId: "role-1" }),
    ).resolves.toEqual({
      currentRole: "Data Analyst",
      currentRoleTermId: "role-1",
    });
    expect(prisma.profileTaxonomyTerm.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "role-1", kind: ProfileTaxonomyKind.ROLE, isActive: true },
      }),
    );
  });

  it("rejects an inactive or wrong-kind id", async () => {
    const { service } = setup();
    await expect(
      codeOf(service.resolveCurrentRole({ currentRoleTermId: "skill-1" })),
    ).resolves.toBe(ProfessionalMessageCode.PROFILE_TAXONOMY_TERM_INVALID);
  });

  it("stores custom text trimmed, with no term id", async () => {
    const { service } = setup();
    await expect(
      service.resolveCurrentRole({ currentRole: "  Chief   Tinkerer " }),
    ).resolves.toEqual({
      currentRole: "Chief Tinkerer",
      currentRoleTermId: null,
    });
  });
});

describe("ProfessionalTaxonomyService role candidates", () => {
  it("retrieves a bounded set by similarity, containment, favoured groups and explicit ids", async () => {
    const { service, prisma } = setup();
    prisma.$queryRaw.mockResolvedValue([{ id: "similar" }]);
    prisma.profileTaxonomyTerm.findMany
      .mockResolvedValueOnce([{ id: "contained" }])
      .mockResolvedValueOnce([{ id: "favoured" }])
      .mockResolvedValueOnce([
        row("similar", "R", ProfileTaxonomyKind.ROLE),
        row("contained", "R", ProfileTaxonomyKind.ROLE),
      ]);

    const roles = await service.roleCandidates({
      text: "Data Lead",
      favoredGroupIds: ["g-role"],
      includeIds: ["proposed"],
    });

    const hydrate = prisma.profileTaxonomyTerm.findMany.mock.calls[2][0];
    expect(hydrate.where).toEqual({
      id: { in: ["proposed", "similar", "contained", "favoured"] },
      kind: ProfileTaxonomyKind.ROLE,
      isActive: true,
    });
    expect(roles.map((role) => role.id)).toEqual(["similar", "contained"]);
  });

  it("skips text retrieval for text too short to search", async () => {
    const { service, prisma } = setup();

    await expect(
      service.roleCandidates({ text: "a", favoredGroupIds: [] }),
    ).resolves.toEqual([]);
    expect(prisma.$queryRaw).not.toHaveBeenCalled();
  });

  it("favours the current role's category and at most three categories mapped from the professional's skills", async () => {
    const { service, prisma } = setup();
    prisma.professionalProfile.findUnique.mockResolvedValue({
      currentRoleTerm: { groupId: "g-current" },
      terms: [{ term: { groupId: "s1" } }, { term: { groupId: "s2" } }],
    });
    prisma.profileTaxonomyGroupMapping.findMany.mockResolvedValue([
      { roleGroupId: "r-a" },
      { roleGroupId: "r-b" },
      { roleGroupId: "r-b" },
      { roleGroupId: "r-c" },
      { roleGroupId: "r-d" },
    ]);

    await expect(service.favoredRoleGroupIds("user-1")).resolves.toEqual([
      "g-current",
      "r-b",
      "r-a",
      "r-c",
    ]);
  });
});
