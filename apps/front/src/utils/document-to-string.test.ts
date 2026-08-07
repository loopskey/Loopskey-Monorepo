import { PopularCategoriesDocument } from "@/lib/graphql/generated";
import { describe, expect, it } from "vitest";
import { documentToString } from "@/utils/function-helper";

describe("documentToString", () => {
  it("returns the query text of a generated document", () => {
    const query = documentToString(PopularCategoriesDocument);

    expect(typeof query).toBe("string");
    expect(query).toContain("query PopularCategories");
  });

  it("inlines fragment definitions the operation depends on", () => {
    const query = documentToString(PopularCategoriesDocument);

    for (const spread of query.matchAll(/\.\.\.(\w+)/g)) {
      expect(query).toContain(`fragment ${spread[1]} on`);
    }
  });

  it("passes plain query strings through unchanged", () => {
    expect(documentToString("query Ping { ping }")).toBe("query Ping { ping }");
  });
});
