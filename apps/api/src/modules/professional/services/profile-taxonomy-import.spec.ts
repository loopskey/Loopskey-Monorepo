import { ProfileTaxonomyKind } from "@prisma/client";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

import { buildTaxonomyCatalog } from "../../../../prisma/seeds/profile-taxonomy-import";
import { parseTaxonomySheet } from "../../../../prisma/seeds/profile-taxonomy-import";
import { toTaxonomyKey } from "../../../../prisma/seeds/profile-taxonomy-import";
import { TaxonomyImportError } from "../../../../prisma/seeds/profile-taxonomy-import";
import { ROLE_SKILL_GROUP_MAPPING } from "../../../../prisma/seeds/profile-taxonomy-mapping";
import { buildProfileTaxonomySeed } from "../../../../prisma/seeds/profile-taxonomy.seed";
import { PROFILE_TAXONOMY_CATALOG } from "../../../../prisma/seeds/profile-taxonomy.seed";

const SEEDS_DIR = join(__dirname, "../../../../prisma/seeds");
const MIGRATIONS_DIR = join(__dirname, "../../../../prisma/migrations");

const ROLE = ProfileTaxonomyKind.ROLE;

const sheet = (...rows: string[]) => ["Current Role", ...rows];

const failureOf = (rows: string[]) => {
  try {
    parseTaxonomySheet(ROLE, rows);
  } catch (error) {
    return error;
  }
  return null;
};

describe("profile taxonomy sheet parsing", () => {
  it("groups terms under the category marker that closes them", () => {
    const groups = parseTaxonomySheet(
      ROLE,
      sheet(
        "Software Engineer",
        "Frontend Developer",
        "Other – Software Engineering",
        "Data Analyst",
        "Other – Data & Analytics",
        "Other (type your own)",
      ),
    );

    expect(groups).toEqual([
      {
        key: "SOFTWARE_ENGINEERING",
        label: "Software Engineering",
        sortOrder: 0,
        terms: [
          {
            key: "SOFTWARE_ENGINEER",
            label: "Software Engineer",
            sortOrder: 0,
          },
          {
            key: "FRONTEND_DEVELOPER",
            label: "Frontend Developer",
            sortOrder: 1,
          },
        ],
      },
      {
        key: "DATA_ANALYTICS",
        label: "Data & Analytics",
        sortOrder: 1,
        terms: [
          { key: "DATA_ANALYST", label: "Data Analyst", sortOrder: 1000 },
        ],
      },
    ]);
  });

  it("normalises unicode whitespace in labels", () => {
    const [group] = parseTaxonomySheet(
      ROLE,
      sheet(" Data  Analyst​ ", "Other – Data", "Other (type your own)"),
    );
    expect(group.terms[0].label).toBe("Data Analyst");
  });

  it("never stores a marker row as a term", () => {
    const groups = parseTaxonomySheet(
      ROLE,
      sheet("Analyst", "Other – Data", "Other (type your own)"),
    );
    const labels = groups.flatMap((group) => group.terms.map((t) => t.label));
    expect(labels).toEqual(["Analyst"]);
  });

  it.each([
    [
      "a missing header",
      ["Role", "Analyst", "Other – Data", "Other (type your own)"],
    ],
    [
      "a blank row",
      sheet("Analyst", "  ", "Other – Data", "Other (type your own)"),
    ],
    ["an empty category", sheet("Other – Data", "Other (type your own)")],
    [
      "terms left open",
      sheet("Analyst", "Other – Data", "Orphan", "Other (type your own)"),
    ],
    ["a missing custom-entry marker", sheet("Analyst", "Other – Data")],
    [
      "data after the custom-entry marker",
      sheet("Analyst", "Other – Data", "Other (type your own)", "Late"),
    ],
    [
      "an unanchored marker",
      sheet("Analyst", "Other - Data", "Other (type your own)"),
    ],
    [
      "a duplicate label",
      sheet("Analyst", "analyst", "Other – Data", "Other (type your own)"),
    ],
    [
      "a key collision",
      sheet("C++ Dev", "C Dev", "Other – Data", "Other (type your own)"),
    ],
    [
      "a duplicate category",
      sheet(
        "A1",
        "Other – Data",
        "B1",
        "Other – Data",
        "Other (type your own)",
      ),
    ],
  ])("fails closed on %s", (_case, rows) => {
    expect(failureOf(rows as string[])).toBeInstanceOf(TaxonomyImportError);
  });

  it("derives keys the way the existing seed always has", () => {
    expect(toTaxonomyKey("UX / UI & Product Design")).toBe(
      "UX_UI_PRODUCT_DESIGN",
    );
    expect(toTaxonomyKey("Engineering (Non-Software)")).toBe(
      "ENGINEERING_NON_SOFTWARE",
    );
  });
});

describe("the committed taxonomy catalogue", () => {
  const count = (groups: { terms: unknown[] }[]) =>
    groups.reduce((total, group) => total + group.terms.length, 0);

  it("holds exactly the audited categories and terms", () => {
    expect(PROFILE_TAXONOMY_CATALOG.roles).toHaveLength(37);
    expect(count(PROFILE_TAXONOMY_CATALOG.roles)).toBe(710);
    expect(PROFILE_TAXONOMY_CATALOG.skills).toHaveLength(47);
    expect(count(PROFILE_TAXONOMY_CATALOG.skills)).toBe(713);
  });

  it("is exactly what the importer produces from the workbook", async () => {
    const rebuilt = await buildTaxonomyCatalog(
      join(SEEDS_DIR, "data", "LoopsKey_Roles_Skills.xlsx"),
    );
    expect(rebuilt).toEqual(PROFILE_TAXONOMY_CATALOG);
  });

  it("contains no Other marker as a selectable term", () => {
    const labels = [
      ...PROFILE_TAXONOMY_CATALOG.roles,
      ...PROFILE_TAXONOMY_CATALOG.skills,
    ].flatMap((group) => group.terms.map((term) => term.label));
    expect(labels.filter((label) => /^other\b/i.test(label))).toEqual([]);
  });

  it("maps every role category to existing skill categories only", () => {
    const roleKeys = PROFILE_TAXONOMY_CATALOG.roles.map((group) => group.key);
    const skillKeys = new Set(
      PROFILE_TAXONOMY_CATALOG.skills.map((group) => group.key),
    );

    expect(Object.keys(ROLE_SKILL_GROUP_MAPPING).sort()).toEqual(
      [...roleKeys].sort(),
    );
    for (const skills of Object.values(ROLE_SKILL_GROUP_MAPPING)) {
      expect(skills.length).toBeGreaterThan(0);
      expect(new Set(skills).size).toBe(skills.length);
      for (const skill of skills) expect(skillKeys.has(skill)).toBe(true);
    }
  });

  it("builds a seed with unique ids and every term inside a seeded group", () => {
    const { groups, terms, mappings } = buildProfileTaxonomySeed();
    const groupIds = new Set(groups.map((group) => group.id));

    expect(groupIds.size).toBe(groups.length);
    expect(new Set(terms.map((term) => term.id)).size).toBe(terms.length);
    expect(terms.every((term) => groupIds.has(term.groupId))).toBe(true);
    expect(
      mappings.every(
        (mapping) =>
          groupIds.has(mapping.roleGroupId) &&
          groupIds.has(mapping.skillGroupId),
      ),
    ).toBe(true);
  });

  it("ships every catalogue row and mapping in the migration production applies", () => {
    const directory = readdirSync(MIGRATIONS_DIR).find((name) =>
      name.endsWith("_profile_taxonomy_catalogue"),
    );
    expect(directory).toBeDefined();
    const sql = readFileSync(
      join(MIGRATIONS_DIR, directory!, "migration.sql"),
      "utf8",
    );
    const { groups, terms, mappings } = buildProfileTaxonomySeed();

    for (const group of groups.filter(
      (one) => one.kind !== ProfileTaxonomyKind.SUBJECT,
    ))
      expect(sql).toContain(`'${group.id}'`);
    for (const term of terms.filter(
      (one) => one.kind !== ProfileTaxonomyKind.SUBJECT,
    ))
      expect(sql).toContain(`'${term.id}', '${term.kind}', '${term.key}'`);
    expect(sql.match(/^\s+\('[A-Z_]+', '[A-Z_]+', \d+\)/gm)).toHaveLength(
      mappings.length,
    );
  });
});
