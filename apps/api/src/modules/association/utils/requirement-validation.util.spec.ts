import { AssociationReportingCycle, PDUCategory } from "@prisma/client";
import { AssociationMessageCode } from "@association/enums/association-message-code.enum";

import * as V from "./requirement-validation.util";

const category = (over: Partial<V.CategoryShape> = {}): V.CategoryShape => ({
  name: "Technical",
  mappedCategory: PDUCategory.TECHNICAL,
  requiredCredits: 10,
  ...over,
});

const requirement = (
  over: Partial<V.RequirementShape> = {},
): V.RequirementShape => ({
  name: "PMP renewal",
  totalRequiredCredits: 60,
  deadline: new Date("2026-12-31"),
  reportingCycle: AssociationReportingCycle.ONE_TIME,
  cycleLengthYears: null,
  categories: [],
  ...over,
});

const codes = (problems: V.RequirementProblem[]) =>
  problems.map((problem) => problem.code);

describe("validateCycle", () => {
  it("requires a length for a multi-year cycle", () => {
    expect(
      codes(
        V.validateCycle({
          reportingCycle: AssociationReportingCycle.MULTI_YEAR,
          cycleLengthYears: null,
        }),
      ),
    ).toEqual([AssociationMessageCode.CYCLE_LENGTH_REQUIRED]);
  });

  it("refuses a length on a cycle that does not take one", () => {
    expect(
      codes(
        V.validateCycle({
          reportingCycle: AssociationReportingCycle.ANNUAL,
          cycleLengthYears: 3,
        }),
      ),
    ).toEqual([AssociationMessageCode.CYCLE_LENGTH_NOT_ALLOWED]);
  });

  it("accepts a multi-year cycle that names its length", () => {
    expect(
      V.validateCycle({
        reportingCycle: AssociationReportingCycle.MULTI_YEAR,
        cycleLengthYears: 3,
      }),
    ).toEqual([]);
  });

  it("accepts a one-time cycle with no length", () => {
    expect(
      V.validateCycle({
        reportingCycle: AssociationReportingCycle.ONE_TIME,
        cycleLengthYears: null,
      }),
    ).toEqual([]);
  });
});

describe("validateCategories", () => {
  it("accepts no categories at all", () => {
    expect(V.validateCategories([], 60)).toEqual([]);
  });

  it("refuses a total above the requirement's own", () => {
    expect(
      codes(
        V.validateCategories(
          [
            category({ requiredCredits: 40 }),
            category({
              name: "Business",
              mappedCategory: PDUCategory.BUSINESS,
              requiredCredits: 30,
            }),
          ],
          60,
        ),
      ),
    ).toContain(AssociationMessageCode.CATEGORY_CREDITS_EXCEED_TOTAL);
  });

  it("accepts a total below the requirement's own, leaving a remainder", () => {
    expect(
      V.validateCategories([category({ requiredCredits: 20 })], 60),
    ).toEqual([]);
  });

  it("refuses a category missing its credit value", () => {
    expect(
      codes(V.validateCategories([category({ requiredCredits: null })], 60)),
    ).toContain(AssociationMessageCode.CATEGORY_INCOMPLETE);
  });

  it("refuses a category missing its mapping", () => {
    expect(
      codes(V.validateCategories([category({ mappedCategory: null })], 60)),
    ).toContain(AssociationMessageCode.CATEGORY_INCOMPLETE);
  });

  it("refuses two categories sharing a name", () => {
    expect(
      codes(
        V.validateCategories(
          [category(), category({ mappedCategory: PDUCategory.BUSINESS })],
          60,
        ),
      ),
    ).toContain(AssociationMessageCode.CATEGORY_NAME_DUPLICATE);
  });

  it("refuses two categories claiming the same mapping", () => {
    expect(
      codes(
        V.validateCategories([category(), category({ name: "Other" })], 60),
      ),
    ).toContain(AssociationMessageCode.CATEGORY_MAPPING_DUPLICATE);
  });
});

describe("validateForPublish", () => {
  it("passes a complete requirement with no categories", () => {
    expect(V.validateForPublish(requirement())).toEqual([]);
  });

  it("reports every problem in one pass rather than the first", () => {
    const problems = V.validateForPublish(
      requirement({
        name: "  ",
        totalRequiredCredits: 0,
        deadline: null,
        reportingCycle: AssociationReportingCycle.MULTI_YEAR,
        cycleLengthYears: null,
      }),
    );

    expect(problems.map((problem) => problem.field)).toEqual([
      "name",
      "totalRequiredCredits",
      "deadline",
      "cycleLengthYears",
    ]);
  });

  it("carries the category refusal through to publication", () => {
    expect(
      codes(
        V.validateForPublish(
          requirement({
            totalRequiredCredits: 10,
            categories: [category({ requiredCredits: 40 })],
          }),
        ),
      ),
    ).toContain(AssociationMessageCode.CATEGORY_CREDITS_EXCEED_TOTAL);
  });
});

describe("immutableFieldsTouched", () => {
  it("names the frozen fields a patch tries to change", () => {
    expect(
      V.immutableFieldsTouched({ totalRequiredCredits: 80, name: "New name" }),
    ).toEqual(["totalRequiredCredits"]);
  });

  it("says nothing about a patch that only touches editable fields", () => {
    expect(
      V.immutableFieldsTouched({
        name: "New name",
        description: "Longer",
        remindersEnabled: true,
      }),
    ).toEqual([]);
  });
});
