import { BadRequestException, GoneException } from "@nestjs/common";
import {
  CATALOG_SEARCH_ORDER,
  CatalogCursorError,
  catalogPageSize,
  clampSearchCount,
  decodeCatalogCursor,
  encodeCatalogCursor,
  readCatalogPage,
  readPrismaWindowAfter,
  readSearchWindowAfter,
} from "@utils/catalog-pagination.util";

const binding = { kind: "course", order: "createdAt:desc" } as const;

const rows = Array.from({ length: 10 }, (_, index) => ({ id: `row${index}` }));

const sourceOver = (
  cursor: string | null,
  take: number,
  overrides: { missing?: boolean } = {},
) => ({
  ...binding,
  take,
  cursor,
  count: async () => rows.length,
  readAfter: async (anchorId: string | null, limit: number) => {
    if (anchorId === null)
      return { rows: rows.slice(0, limit), anchorFound: true };
    const position = rows.findIndex((row) => row.id === anchorId);
    if (overrides.missing || position < 0)
      return { rows: [], anchorFound: false };
    return {
      rows: rows.slice(position + 1, position + 1 + limit),
      anchorFound: true,
    };
  },
  readThrough: async (anchorId: string, limit: number) => {
    const position = rows.findIndex((row) => row.id === anchorId);
    return rows.slice(Math.max(position + 1 - limit, 0), position + 1);
  },
});

const invalidCode = (action: () => unknown) => {
  try {
    action();
  } catch (error) {
    expect(error).toBeInstanceOf(BadRequestException);
    return (error as BadRequestException).getResponse();
  }
  throw new Error("expected the cursor to be rejected");
};

describe("catalog cursor", () => {
  it("round-trips the anchor id for the bound kind and order", () => {
    const token = encodeCatalogCursor(binding, "cm0abc-123_X");
    expect(decodeCatalogCursor(token, binding)).toBe("cm0abc-123_X");
  });

  it("is url safe and carries no padding", () => {
    expect(encodeCatalogCursor(binding, "row1")).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it.each([
    ["an empty string", ""],
    ["plain text", "hello"],
    ["a raw row id", "cm0abc123"],
    ["non-token characters", "abc def"],
    ["json that is not a cursor", Buffer.from("{}").toString("base64url")],
    ["an array", Buffer.from("[1,2]").toString("base64url")],
    ["an oversized token", "A".repeat(513)],
  ])("rejects %s", (_, token) => {
    expect(
      invalidCode(() => decodeCatalogCursor(token, binding)),
    ).toMatchObject({ code: CatalogCursorError.INVALID });
  });

  it("rejects a cursor minted for another kind", () => {
    const token = encodeCatalogCursor({ ...binding, kind: "event" }, "row1");
    expect(() => decodeCatalogCursor(token, binding)).toThrow(
      BadRequestException,
    );
  });

  it("rejects a cursor minted for another order", () => {
    const token = encodeCatalogCursor(
      { ...binding, order: CATALOG_SEARCH_ORDER },
      "row1",
    );
    expect(() => decodeCatalogCursor(token, binding)).toThrow(
      BadRequestException,
    );
  });

  it("rejects an unknown version and an unsafe anchor id", () => {
    const wrongVersion = Buffer.from(
      JSON.stringify({ v: 2, k: "course", o: "createdAt:desc", i: "row1" }),
    ).toString("base64url");
    const unsafeId = Buffer.from(
      JSON.stringify({ v: 1, k: "course", o: "createdAt:desc", i: "a'; --" }),
    ).toString("base64url");
    expect(() => decodeCatalogCursor(wrongVersion, binding)).toThrow(
      BadRequestException,
    );
    expect(() => decodeCatalogCursor(unsafeId, binding)).toThrow(
      BadRequestException,
    );
  });
});

describe("readCatalogPage", () => {
  it("returns the first page without previous navigation", async () => {
    const page = await readCatalogPage(sourceOver(null, 4));
    expect(page.items.map((row) => row.id)).toEqual([
      "row0",
      "row1",
      "row2",
      "row3",
    ]);
    expect(page.totalCount).toBe(10);
    expect(page.pageInfo).toMatchObject({
      hasNextPage: true,
      hasPreviousPage: false,
      previousCursor: null,
    });
    expect(
      decodeCatalogCursor(page.pageInfo.nextCursor as string, binding),
    ).toBe("row3");
  });

  it("links the second page back to the unanchored first page", async () => {
    const first = await readCatalogPage(sourceOver(null, 4));
    const second = await readCatalogPage(
      sourceOver(first.pageInfo.nextCursor, 4),
    );
    expect(second.items.map((row) => row.id)).toEqual([
      "row4",
      "row5",
      "row6",
      "row7",
    ]);
    expect(second.pageInfo.hasPreviousPage).toBe(true);
    expect(second.pageInfo.previousCursor).toBeNull();
  });

  it("links a deeper page to the cursor that reproduces the page before it", async () => {
    const first = await readCatalogPage(sourceOver(null, 3));
    const second = await readCatalogPage(
      sourceOver(first.pageInfo.nextCursor, 3),
    );
    const third = await readCatalogPage(
      sourceOver(second.pageInfo.nextCursor, 3),
    );
    const rebuilt = await readCatalogPage(
      sourceOver(third.pageInfo.previousCursor, 3),
    );
    expect(rebuilt.items).toEqual(second.items);
    expect(rebuilt.pageInfo.nextCursor).toBe(second.pageInfo.nextCursor);
  });

  it("ends without a next cursor on the last page", async () => {
    const first = await readCatalogPage(sourceOver(null, 8));
    const last = await readCatalogPage(
      sourceOver(first.pageInfo.nextCursor, 8),
    );
    expect(last.items.map((row) => row.id)).toEqual(["row8", "row9"]);
    expect(last.pageInfo.hasNextPage).toBe(false);
    expect(last.pageInfo.nextCursor).toBeNull();
  });

  it("reports an expired cursor when the anchor row is gone", async () => {
    const token = encodeCatalogCursor(binding, "row3");
    await expect(
      readCatalogPage(sourceOver(token, 4, { missing: true })),
    ).rejects.toBeInstanceOf(GoneException);
  });

  it("rejects a malformed cursor before reading anything", async () => {
    const source = sourceOver("nope", 4);
    const readAfter = jest.spyOn(source, "readAfter");
    await expect(readCatalogPage(source)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(readAfter).not.toHaveBeenCalled();
  });
});

describe("window helpers", () => {
  it("caps the page size and defaults when absent", () => {
    expect(catalogPageSize(undefined)).toBe(20);
    expect(catalogPageSize(null)).toBe(20);
    expect(catalogPageSize(500)).toBe(100);
    expect(catalogPageSize(7)).toBe(7);
  });

  it("detects a missing anchor in a prisma window", async () => {
    const missing = await readPrismaWindowAfter(
      "gone",
      async () => false,
      async () => [{ id: "never" }],
    );
    expect(missing).toEqual({ rows: [], anchorFound: false });
    const found = await readPrismaWindowAfter(
      "here",
      async () => true,
      async (position) => [{ id: String(position.skip) }],
    );
    expect(found).toEqual({ rows: [{ id: "1" }], anchorFound: true });
  });

  it("drops the anchor row from a search window and detects its absence", () => {
    const window = [{ id: "a" }, { id: "b" }, { id: "c" }];
    expect(readSearchWindowAfter(window, "a")).toEqual({
      rows: [{ id: "b" }, { id: "c" }],
      anchorFound: true,
    });
    expect(readSearchWindowAfter(window, "z")).toEqual({
      rows: [],
      anchorFound: false,
    });
    expect(readSearchWindowAfter(window, null)).toEqual({
      rows: window,
      anchorFound: true,
    });
  });

  it("clamps a search count to the reachable candidate set", () => {
    expect(clampSearchCount(undefined)).toBe(0);
    expect(clampSearchCount(12n)).toBe(12);
    expect(clampSearchCount(9_000n)).toBe(500);
  });
});
