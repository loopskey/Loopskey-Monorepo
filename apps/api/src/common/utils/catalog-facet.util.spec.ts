import { Logger } from "@nestjs/common";

import { measureCatalogFacets, toEnumFacets } from "./catalog-facet.util";

describe("toEnumFacets", () => {
  it("keeps only values backed by a record, in a deterministic order", () => {
    expect(
      toEnumFacets([
        { value: "TECHNOLOGY", count: 4 },
        { value: "BUSINESS", count: 2 },
      ]),
    ).toEqual([
      { value: "BUSINESS", count: 2 },
      { value: "TECHNOLOGY", count: 4 },
    ]);
  });

  it("omits a value with no public records rather than offering an empty filter", () => {
    expect(
      toEnumFacets([
        { value: "TECHNOLOGY", count: 1 },
        { value: "DESIGN", count: 0 },
      ]),
    ).toEqual([{ value: "TECHNOLOGY", count: 1 }]);
  });

  it("returns nothing for an empty catalogue", () => {
    expect(toEnumFacets([])).toEqual([]);
  });
});

describe("measureCatalogFacets", () => {
  const logger = new Logger("test");

  beforeEach(() => jest.restoreAllMocks());

  it("logs the kind and option count without any catalogue content", async () => {
    const log = jest.spyOn(logger, "log").mockImplementation();

    await measureCatalogFacets(
      logger,
      "course",
      async () => ({ categories: ["TECHNOLOGY"] }),
      (facets) => facets.categories.length,
    );

    const [message, context] = log.mock.calls[0];
    expect(message).toBe("Catalogue facets computed");
    expect(context).toMatchObject({ kind: "course", options: 1 });
    expect(JSON.stringify(context)).not.toContain("TECHNOLOGY");
  });

  it("warns instead when the aggregate passes the slow-query threshold", async () => {
    const warn = jest.spyOn(logger, "warn").mockImplementation();
    jest.spyOn(logger, "log").mockImplementation();
    const clock = jest.spyOn(Date, "now");
    clock.mockReturnValueOnce(0).mockReturnValueOnce(5_000);

    await measureCatalogFacets(
      logger,
      "podcast",
      async () => ({ categories: [] }),
      (facets) => facets.categories.length,
    );

    expect(warn).toHaveBeenCalledWith(
      "Catalogue facet query exceeded slow-query threshold",
      expect.objectContaining({ kind: "podcast", durationMs: 5_000 }),
    );
  });

  it("returns the facets the caller computed", async () => {
    jest.spyOn(logger, "log").mockImplementation();

    await expect(
      measureCatalogFacets(
        logger,
        "event",
        async () => ({ types: ["ONLINE"] }),
        (facets) => facets.types.length,
      ),
    ).resolves.toEqual({ types: ["ONLINE"] });
  });
});
