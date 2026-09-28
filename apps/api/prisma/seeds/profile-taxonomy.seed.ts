import { PrismaClient, ProfileTaxonomyKind } from "@prisma/client";

import { ROLE_SKILL_GROUP_MAPPING } from "./profile-taxonomy-mapping";
import { ROLE_SKILL_MAPPING_VERSION } from "./profile-taxonomy-mapping";
import { toTaxonomyKey } from "./profile-taxonomy-import";
import { type TCatalogGroup } from "./profile-taxonomy-import";
import { type TProfileTaxonomyCatalog } from "./profile-taxonomy-import";

import catalogue from "./data/profile-taxonomy.catalog.json";

export type TProfileTaxonomySeedGroup = {
  id: string;
  kind: ProfileTaxonomyKind;
  key: string;
  label: string;
  sortOrder: number;
};

export type TProfileTaxonomySeedTerm = {
  id: string;
  kind: ProfileTaxonomyKind;
  key: string;
  label: string;
  groupId: string;
  sortOrder: number;
};

export type TProfileTaxonomySeedMapping = {
  id: string;
  roleGroupId: string;
  skillGroupId: string;
  priority: number;
  version: number;
};

export const PROFILE_TAXONOMY_CATALOG =
  catalogue as unknown as TProfileTaxonomyCatalog;

const LEGACY_GROUP_STRIDE = 100;

const subjects: [string, string, string[]][] = [
  [
    "TECHNOLOGY",
    "Technology",
    [
      "Software Development",
      "Data Science",
      "Cloud Computing",
      "Cybersecurity",
      "AI & Machine Learning",
    ],
  ],
  [
    "BUSINESS",
    "Business",
    [
      "Entrepreneurship",
      "Project Management",
      "Product Management",
      "Strategy",
    ],
  ],
  ["FINANCE", "Finance", ["Corporate Finance", "Investing", "Accounting"]],
  [
    "HEALTHCARE",
    "Healthcare",
    ["Clinical Practice", "Patient Safety", "Public Health"],
  ],
  [
    "ENGINEERING",
    "Engineering",
    ["Civil Engineering", "Mechanical Engineering", "Electrical Engineering"],
  ],
  ["DESIGN", "Design", ["UX Design", "Graphic Design"]],
  [
    "MARKETING",
    "Marketing",
    ["Digital Marketing", "Brand Management", "Content Marketing"],
  ],
  ["LEADERSHIP", "Leadership", ["People Management", "Organisational Culture"]],
  ["COMPLIANCE", "Compliance", ["Regulatory Affairs", "Risk & Governance"]],
  ["EDUCATION", "Education", ["Instructional Design", "Adult Learning"]],
];

const ID_PREFIX: Record<ProfileTaxonomyKind, string> = {
  [ProfileTaxonomyKind.SKILL_AREA]: "skill",
  [ProfileTaxonomyKind.SUBJECT]: "subject",
  [ProfileTaxonomyKind.ROLE]: "role",
};

export const taxonomyGroupId = (kind: ProfileTaxonomyKind, key: string) =>
  `ptg_${ID_PREFIX[kind]}_${key.toLowerCase()}`;

export const taxonomyTermId = (kind: ProfileTaxonomyKind, key: string) =>
  `pt_${ID_PREFIX[kind]}_${key.toLowerCase()}`;

const fromCatalogue = (
  kind: ProfileTaxonomyKind,
  groups: readonly TCatalogGroup[],
) => ({
  groups: groups.map((group) => ({
    id: taxonomyGroupId(kind, group.key),
    kind,
    key: group.key,
    label: group.label,
    sortOrder: group.sortOrder,
  })),
  terms: groups.flatMap((group) =>
    group.terms.map((term) => ({
      id: taxonomyTermId(kind, term.key),
      kind,
      key: term.key,
      label: term.label,
      groupId: taxonomyGroupId(kind, group.key),
      sortOrder: term.sortOrder,
    })),
  ),
});

const fromLegacyLists = (
  kind: ProfileTaxonomyKind,
  groups: [string, string, string[]][],
) => ({
  groups: groups.map(([key, label], index) => ({
    id: taxonomyGroupId(kind, key),
    kind,
    key,
    label,
    sortOrder: index,
  })),
  terms: groups.flatMap(([groupKey, , labels], groupIndex) =>
    labels.map((label, index) => {
      const key = toTaxonomyKey(label);
      return {
        id: taxonomyTermId(kind, key),
        kind,
        key,
        label,
        groupId: taxonomyGroupId(kind, groupKey),
        sortOrder: groupIndex * LEGACY_GROUP_STRIDE + index,
      };
    }),
  ),
});

export const buildRoleSkillMappings = (): TProfileTaxonomySeedMapping[] =>
  Object.entries(ROLE_SKILL_GROUP_MAPPING).flatMap(([roleKey, skillKeys]) =>
    skillKeys.map((skillKey, priority) => ({
      id: `ptm_${roleKey.toLowerCase()}__${skillKey.toLowerCase()}`,
      roleGroupId: taxonomyGroupId(ProfileTaxonomyKind.ROLE, roleKey),
      skillGroupId: taxonomyGroupId(ProfileTaxonomyKind.SKILL_AREA, skillKey),
      priority,
      version: ROLE_SKILL_MAPPING_VERSION,
    })),
  );

export const buildProfileTaxonomySeed = () => {
  const parts = [
    fromCatalogue(ProfileTaxonomyKind.ROLE, PROFILE_TAXONOMY_CATALOG.roles),
    fromCatalogue(
      ProfileTaxonomyKind.SKILL_AREA,
      PROFILE_TAXONOMY_CATALOG.skills,
    ),
    fromLegacyLists(ProfileTaxonomyKind.SUBJECT, subjects),
  ];
  return {
    groups: parts.flatMap((part) => part.groups),
    terms: parts.flatMap((part) => part.terms),
    mappings: buildRoleSkillMappings(),
  };
};

const CATALOGUE_KINDS = [
  ProfileTaxonomyKind.ROLE,
  ProfileTaxonomyKind.SKILL_AREA,
];

export const seedProfileTaxonomy = async (prisma: PrismaClient) => {
  const { groups, terms, mappings } = buildProfileTaxonomySeed();

  for (const group of groups)
    await prisma.profileTaxonomyGroup.upsert({
      where: { kind_key: { kind: group.kind, key: group.key } },
      create: group,
      update: {
        label: group.label,
        sortOrder: group.sortOrder,
        isActive: true,
      },
    });

  const groupIds = new Map(
    (
      await prisma.profileTaxonomyGroup.findMany({
        select: { id: true, kind: true, key: true },
      })
    ).map((group) => [`${group.kind}:${group.key}`, group.id]),
  );
  const groupIdOf = (seedGroupId: string) => {
    const group = groups.find((one) => one.id === seedGroupId);
    const id = group ? groupIds.get(`${group.kind}:${group.key}`) : undefined;
    if (!id) throw new Error(`Taxonomy group ${seedGroupId} was not seeded.`);
    return id;
  };

  for (const term of terms) {
    const groupId = groupIdOf(term.groupId);
    await prisma.profileTaxonomyTerm.upsert({
      where: { kind_key: { kind: term.kind, key: term.key } },
      create: { ...term, groupId },
      update: {
        label: term.label,
        groupId,
        sortOrder: term.sortOrder,
        isActive: true,
      },
    });
  }

  for (const kind of CATALOGUE_KINDS) {
    await prisma.profileTaxonomyTerm.updateMany({
      where: {
        kind,
        isActive: true,
        key: {
          notIn: terms
            .filter((term) => term.kind === kind)
            .map((term) => term.key),
        },
      },
      data: { isActive: false },
    });
    await prisma.profileTaxonomyGroup.updateMany({
      where: {
        kind,
        isActive: true,
        key: {
          notIn: groups
            .filter((group) => group.kind === kind)
            .map((group) => group.key),
        },
      },
      data: { isActive: false },
    });
  }

  const seededMappings = new Set<string>();
  for (const mapping of mappings) {
    const roleGroupId = groupIdOf(mapping.roleGroupId);
    const skillGroupId = groupIdOf(mapping.skillGroupId);
    seededMappings.add(`${roleGroupId}:${skillGroupId}`);
    await prisma.profileTaxonomyGroupMapping.upsert({
      where: { roleGroupId_skillGroupId: { roleGroupId, skillGroupId } },
      create: { ...mapping, roleGroupId, skillGroupId },
      update: {
        priority: mapping.priority,
        version: mapping.version,
        isActive: true,
      },
    });
  }

  const staleMappings = (
    await prisma.profileTaxonomyGroupMapping.findMany({
      where: { isActive: true },
      select: { id: true, roleGroupId: true, skillGroupId: true },
    })
  ).filter(
    (mapping) =>
      !seededMappings.has(`${mapping.roleGroupId}:${mapping.skillGroupId}`),
  );
  if (staleMappings.length)
    await prisma.profileTaxonomyGroupMapping.updateMany({
      where: { id: { in: staleMappings.map((mapping) => mapping.id) } },
      data: { isActive: false },
    });

  return terms.length;
};
