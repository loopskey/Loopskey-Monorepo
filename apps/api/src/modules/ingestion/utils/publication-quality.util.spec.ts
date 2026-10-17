import { IngestionReviewReason } from "@prisma/client";
import {
  assessPublicationQuality,
  holdsPublication,
} from "./publication-quality.util";

const LONG_DESCRIPTION =
  "A practical introduction to the techniques professionals use every day.";

const assess = (
  title: string,
  description: string | null = LONG_DESCRIPTION,
  urls: Array<string | null> = ["https://www.coursera.org/learn/x"],
) => assessPublicationQuality({ title, description, urls });

describe("assessPublicationQuality", () => {
  it.each([
    ["probe", "connectivity probe"],
    ["probe via tunnel", "tunnel connectivity probe"],
    ["Test", null],
    ["TEST 123", "test"],
    ["Lorem ipsum", "Lorem ipsum dolor"],
    ["!!!", ""],
  ])("holds placeholder content %p / %p for review", (title, description) => {
    const reasons = assess(title, description);
    expect(reasons).toContain(IngestionReviewReason.PLACEHOLDER_CONTENT);
    expect(holdsPublication(reasons)).toBe(true);
  });

  it.each([
    ["Software Testing Fundamentals", "Short."],
    ["Test Automation with Selenium", LONG_DESCRIPTION],
    ["Sample Size and Statistical Power", LONG_DESCRIPTION],
    ["Probability and Probes in Data Science", LONG_DESCRIPTION],
    ["Testing", LONG_DESCRIPTION],
    [
      "Gestion de projet agile",
      "Une introduction complète à la gestion de projet.",
    ],
    [
      "プロジェクト管理入門",
      "プロジェクト管理の基礎を学ぶ実践的なコースです。",
    ],
    [
      "Введение в управление проектами",
      "Курс по основам управления проектами для начинающих.",
    ],
  ])("publishes legitimate content %p", (title, description) => {
    const reasons = assess(title, description);
    expect(reasons).not.toContain(IngestionReviewReason.PLACEHOLDER_CONTENT);
    expect(holdsPublication(reasons)).toBe(false);
  });

  it.each([
    "https://example.com/course",
    "https://learn.example.org/x",
    "http://localhost:3000/x",
    "http://127.0.0.1/x",
    "https://course.test/x",
    "https://site.invalid/x",
    "ftp://files.coursera.org/x",
    "not a url",
  ])("holds the placeholder URL %p", (url) => {
    const reasons = assess("Applied Machine Learning", LONG_DESCRIPTION, [url]);
    expect(reasons).toEqual([IngestionReviewReason.PLACEHOLDER_URL]);
  });

  it("accepts real external URLs and ignores absent ones", () => {
    expect(
      assess("Applied Machine Learning", LONG_DESCRIPTION, [
        "https://www.coursera.org/learn/applied-ml",
        "https://examples-of-design.com/x",
        null,
        "",
      ]),
    ).toEqual([]);
  });

  it("only recommends a description without holding publication", () => {
    const reasons = assess("Applied Machine Learning", "Short");
    expect(reasons).toEqual([IngestionReviewReason.MISSING_DESCRIPTION]);
    expect(holdsPublication(reasons)).toBe(false);
  });

  it("holds a previously rejected item", () => {
    expect(holdsPublication([IngestionReviewReason.PREVIOUSLY_REJECTED])).toBe(
      true,
    );
  });
});
