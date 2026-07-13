import { PrismaClient, ProfileTaxonomyKind } from "@prisma/client";

export type TProfileTaxonomySeedTerm = {
  id: string;
  kind: ProfileTaxonomyKind;
  key: string;
  label: string;
  groupKey: string;
  groupLabel: string;
  sortOrder: number;
};

const skillAreas: [string, string, string[]][] = [
  [
    "TECHNOLOGY",
    "Technology",
    [
      "Software Engineering",
      "Data & Analytics",
      "Cloud & Infrastructure",
      "Cybersecurity",
      "Artificial Intelligence",
      "Quality & Testing",
    ],
  ],
  [
    "LEADERSHIP",
    "Leadership",
    [
      "Team Leadership",
      "Coaching & Mentoring",
      "Change Management",
      "Conflict Resolution",
    ],
  ],
  [
    "BUSINESS",
    "Business",
    [
      "Project Management",
      "Risk Management",
      "Product Management",
      "Business Strategy",
      "Finance & Accounting",
      "Operations",
    ],
  ],
  [
    "COMMUNICATION",
    "Communication",
    [
      "Presentation Skills",
      "Technical Writing",
      "Negotiation",
      "Facilitation",
    ],
  ],
  [
    "COMPLIANCE",
    "Compliance & Ethics",
    [
      "Regulatory Compliance",
      "Health & Safety",
      "Privacy & Data Protection",
      "Professional Ethics",
    ],
  ],
  [
    "DESIGN",
    "Design",
    ["UX Research", "UI Design", "Design Thinking"],
  ],
];

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
    [
      "Civil Engineering",
      "Mechanical Engineering",
      "Electrical Engineering",
    ],
  ],
  ["DESIGN", "Design", ["UX Design", "Graphic Design"]],
  [
    "MARKETING",
    "Marketing",
    ["Digital Marketing", "Brand Management", "Content Marketing"],
  ],
  [
    "LEADERSHIP",
    "Leadership",
    ["People Management", "Organisational Culture"],
  ],
  [
    "COMPLIANCE",
    "Compliance",
    ["Regulatory Affairs", "Risk & Governance"],
  ],
  [
    "EDUCATION",
    "Education",
    ["Instructional Design", "Adult Learning"],
  ],
];

const toKey = (label: string) =>
  label
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const buildTerms = (
  kind: ProfileTaxonomyKind,
  groups: [string, string, string[]][],
): TProfileTaxonomySeedTerm[] => {
  const prefix = kind === ProfileTaxonomyKind.SKILL_AREA ? "skill" : "subject";
  const terms: TProfileTaxonomySeedTerm[] = [];
  groups.forEach(([groupKey, groupLabel, labels], groupIndex) => {
    labels.forEach((label, index) => {
      const key = toKey(label);
      terms.push({
        id: `pt_${prefix}_${key.toLowerCase()}`,
        kind,
        key,
        label,
        groupKey,
        groupLabel,
        sortOrder: groupIndex * 100 + index,
      });
    });
  });
  return terms;
};

export const PROFILE_TAXONOMY_TERMS: TProfileTaxonomySeedTerm[] = [
  ...buildTerms(ProfileTaxonomyKind.SKILL_AREA, skillAreas),
  ...buildTerms(ProfileTaxonomyKind.SUBJECT, subjects),
];

export const seedProfileTaxonomy = async (prisma: PrismaClient) => {
  for (const term of PROFILE_TAXONOMY_TERMS) {
    await prisma.profileTaxonomyTerm.upsert({
      where: { kind_key: { kind: term.kind, key: term.key } },
      create: term,
      update: {
        label: term.label,
        groupKey: term.groupKey,
        groupLabel: term.groupLabel,
        sortOrder: term.sortOrder,
        isActive: true,
      },
    });
  }
  return PROFILE_TAXONOMY_TERMS.length;
};
