import {
  validateCatalogueSource,
  importCertificationCatalogue,
} from "../../../../prisma/seeds/certification-catalogue-import";
import type { TCertificationSourceItem } from "../../../../prisma/seeds/certification-catalogue.source";
import { CreditType } from "@prisma/client";

const item = (
  overrides: Partial<TCertificationSourceItem> = {},
): TCertificationSourceItem => ({
  id: "cert-a",
  name: "Certification A",
  abbreviation: "CA",
  organization: "Org A",
  organizationAbbr: null,
  association: null,
  aliases: [],
  creditType: CreditType.CPD,
  renewalCycleLabel: "Annual",
  renewalCycleMonths: 12,
  totalRequiredCredits: 20,
  categories: [],
  isActive: true,
  ...overrides,
});

describe("validateCatalogueSource", () => {
  it("accepts a well-formed catalogue", () => {
    expect(validateCatalogueSource([item()])).toEqual([]);
  });

  it("rejects a duplicate id", () => {
    const issues = validateCatalogueSource([
      item({ id: "cert-a" }),
      item({ id: "cert-a", abbreviation: "CB" }),
    ]);
    expect(issues.some((issue) => /Duplicate id/.test(issue.message))).toBe(
      true,
    );
  });

  it("rejects a missing required field", () => {
    const issues = validateCatalogueSource([item({ name: "" })]);
    expect(
      issues.some((issue) =>
        /Missing required field "name"/.test(issue.message),
      ),
    ).toBe(true);
  });

  it("rejects a negative totalRequiredCredits", () => {
    const issues = validateCatalogueSource([
      item({ totalRequiredCredits: -1 }),
    ]);
    expect(
      issues.some((issue) => /must not be negative/.test(issue.message)),
    ).toBe(true);
  });

  it("rejects category credits that do not sum to totalRequiredCredits", () => {
    const issues = validateCatalogueSource([
      item({
        totalRequiredCredits: 20,
        categories: [{ name: "One", requiredCredits: 5 }],
      }),
    ]);
    expect(
      issues.some((issue) => /Category credits sum to/.test(issue.message)),
    ).toBe(true);
  });

  it("accepts category credits that sum exactly to totalRequiredCredits", () => {
    const issues = validateCatalogueSource([
      item({
        totalRequiredCredits: 20,
        categories: [
          { name: "One", requiredCredits: 12 },
          { name: "Two", requiredCredits: 8 },
        ],
      }),
    ]);
    expect(issues).toEqual([]);
  });

  it("rejects two items with colliding abbreviations", () => {
    const issues = validateCatalogueSource([
      item({ id: "cert-a", abbreviation: "SAME" }),
      item({ id: "cert-b", abbreviation: "same" }),
    ]);
    expect(issues.some((issue) => /collides with/.test(issue.message))).toBe(
      true,
    );
  });

  it("rejects an alias that collides with another item's name", () => {
    const issues = validateCatalogueSource([
      item({ id: "cert-a", name: "Shared Name" }),
      item({ id: "cert-b", aliases: ["Shared Name"] }),
    ]);
    expect(
      issues.some(
        (issue) =>
          issue.itemId === "cert-b" && /collides with/.test(issue.message),
      ),
    ).toBe(true);
  });

  it("rejects an invalid creditType", () => {
    const issues = validateCatalogueSource([
      item({ creditType: "NOT_REAL" as CreditType }),
    ]);
    expect(
      issues.some((issue) => /Invalid creditType/.test(issue.message)),
    ).toBe(true);
  });

  it("rejects text containing the Unicode replacement character", () => {
    const issues = validateCatalogueSource([item({ name: "Broken�Name" })]);
    expect(
      issues.some((issue) =>
        /Invalid\/undecodable characters/.test(issue.message),
      ),
    ).toBe(true);
  });
});

type TTx = {
  certification: {
    findMany: jest.Mock;
    upsert: jest.Mock;
    update: jest.Mock;
  };
  certificationCategory: {
    deleteMany: jest.Mock;
    createMany: jest.Mock;
  };
  cPDPlan: { count: jest.Mock };
  professionalCredential: { count: jest.Mock };
  roadmapDraft: { count: jest.Mock };
};

const createTx = (existingRows: unknown[] = []): TTx => ({
  certification: {
    findMany: jest
      .fn()
      .mockResolvedValueOnce(existingRows)
      .mockResolvedValue([]),
    upsert: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
  },
  certificationCategory: {
    deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    createMany: jest.fn().mockResolvedValue({ count: 0 }),
  },
  cPDPlan: { count: jest.fn().mockResolvedValue(0) },
  professionalCredential: { count: jest.fn().mockResolvedValue(0) },
  roadmapDraft: { count: jest.fn().mockResolvedValue(0) },
});

const createPrismaMock = (existingRows: unknown[] = []) => {
  const tx = createTx(existingRows);
  return {
    tx,
    prisma: {
      $transaction: jest.fn(
        async (callback: (client: TTx) => Promise<unknown>) => callback(tx),
      ),
    },
  };
};

describe("importCertificationCatalogue", () => {
  it("writes nothing and reports rejected issues when validation fails", async () => {
    const { prisma, tx } = createPrismaMock();

    const result = await importCertificationCatalogue(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prisma as any,
      [item({ name: "" })],
      "v1",
    );

    expect(result.rejected.length).toBeGreaterThan(0);
    expect(tx.certification.upsert).not.toHaveBeenCalled();
  });

  it("creates every item on first import", async () => {
    const { prisma, tx } = createPrismaMock([]);

    const result = await importCertificationCatalogue(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prisma as any,
      [
        item({ id: "cert-a" }),
        item({ id: "cert-b", name: "Certification B", abbreviation: "CB" }),
      ],
      "v1",
    );

    expect(result.created).toEqual(["cert-a", "cert-b"]);
    expect(result.updated).toEqual([]);
    expect(result.unchanged).toEqual([]);
    expect(tx.certification.upsert).toHaveBeenCalledTimes(2);
  });

  it("reports an identical re-import as fully unchanged and writes nothing for it", async () => {
    const existing = {
      id: "cert-a",
      name: "Certification A",
      abbreviation: "CA",
      organization: "Org A",
      organizationAbbr: null,
      association: null,
      aliases: [],
      creditType: CreditType.CPD,
      renewalCycleLabel: "Annual",
      renewalCycleMonths: 12,
      totalRequiredCredits: 20,
      isActive: true,
      categories: [],
    };
    const { prisma, tx } = createPrismaMock([existing]);

    const result = await importCertificationCatalogue(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prisma as any,
      [item({ id: "cert-a" })],
      "v1",
    );

    expect(result.unchanged).toEqual(["cert-a"]);
    expect(result.created).toEqual([]);
    expect(result.updated).toEqual([]);
    expect(tx.certification.upsert).not.toHaveBeenCalled();
  });

  it("retires a previously managed row the new version no longer lists, without hard-deleting it", async () => {
    const existing = {
      id: "cert-old",
      name: "Old Cert",
      abbreviation: "OLD",
      organization: "Org",
      organizationAbbr: null,
      association: null,
      aliases: [],
      creditType: CreditType.CPD,
      renewalCycleLabel: "Annual",
      renewalCycleMonths: 12,
      totalRequiredCredits: 20,
      isActive: true,
      sourceVersion: "v1",
      categories: [],
    };
    const { prisma, tx } = createPrismaMock([]);
    tx.certification.findMany
      .mockReset()
      .mockResolvedValueOnce([]) // items in this version (none match cert-old)
      .mockResolvedValueOnce([existing]); // previously-managed rows no longer listed
    tx.cPDPlan.count.mockResolvedValue(1); // cert-old is referenced by a plan

    const result = await importCertificationCatalogue(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prisma as any,
      [item({ id: "cert-new" })],
      "v2",
    );

    expect(result.retired).toEqual(["cert-old"]);
    expect(result.referencedRetired).toEqual(["cert-old"]);
    expect(tx.certification.update).toHaveBeenCalledWith({
      where: { id: "cert-old" },
      data: { isActive: false },
    });
  });
});
