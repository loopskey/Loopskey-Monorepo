import {
  CourseCategory,
  EventCategory,
  PodcastCategory,
  YouTubeCategory,
} from "@prisma/client";

import { normalizeContentCategory } from "./content-category.util";

const CONTENT_CATEGORIES = [
  "ACCOUNTING",
  "AI",
  "BUSINESS",
  "CAREER",
  "CERTIFICATION",
  "CLOUD",
  "COMMUNICATION",
  "COMPLIANCE",
  "CONSTRUCTION",
  "CYBERSECURITY",
  "DATA",
  "DESIGN",
  "EDUCATION",
  "ENGINEERING",
  "FINANCE",
  "GENERAL",
  "HEALTHCARE",
  "HEALTH_SAFETY",
  "HUMAN_RESOURCES",
  "LEADERSHIP",
  "LEGAL",
  "MARKETING",
  "NURSING",
  "PRODUCT_MANAGEMENT",
  "PROJECT_MANAGEMENT",
  "QUALITY",
  "SALES",
  "SOFTWARE_DEVELOPMENT",
  "SUPPLY_CHAIN",
  "SUSTAINABILITY",
  "TECHNOLOGY",
];

describe("content categories", () => {
  it.each([
    ["CourseCategory", CourseCategory],
    ["EventCategory", EventCategory],
    ["PodcastCategory", PodcastCategory],
    ["YouTubeCategory", YouTubeCategory],
  ])("%s holds exactly the shared category set", (_name, category) => {
    expect(Object.values(category).sort()).toEqual(CONTENT_CATEGORIES);
  });
});

describe("normalizeContentCategory", () => {
  it.each(CONTENT_CATEGORIES)("keeps the canonical value %s", (category) => {
    expect(normalizeContentCategory(category)).toBe(category);
    expect(normalizeContentCategory(category.toLowerCase())).toBe(category);
  });

  it.each([
    ["CPD", "CERTIFICATION"],
    ["cpd", "CERTIFICATION"],
    ["OTHER", "GENERAL"],
    ["other", "GENERAL"],
    ["CPD & Certification", "CERTIFICATION"],
    ["AI & Machine Learning", "AI"],
    ["Data & Analytics", "DATA"],
    ["Civil & Construction", "CONSTRUCTION"],
    ["Health & Safety", "HEALTH_SAFETY"],
    ["health-safety", "HEALTH_SAFETY"],
    ["Nursing & Care", "NURSING"],
    ["Quality Management", "QUALITY"],
    ["human resources", "HUMAN_RESOURCES"],
    ["HR", "HUMAN_RESOURCES"],
    ["law", "LEGAL"],
    ["software", "SOFTWARE_DEVELOPMENT"],
    ["computer science", "TECHNOLOGY"],
    ["machine learning", "AI"],
    ["investing", "FINANCE"],
    ["medicine", "HEALTHCARE"],
  ])("maps %p to %s", (value, expected) => {
    expect(normalizeContentCategory(value)).toBe(expected);
  });

  it.each([null, undefined, "", "   ", "unknown category", "&&&"])(
    "falls back to GENERAL for %p",
    (value) => {
      expect(normalizeContentCategory(value)).toBe("GENERAL");
    },
  );
});
