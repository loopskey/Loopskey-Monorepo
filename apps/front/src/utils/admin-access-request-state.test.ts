import { describe, expect, it } from "vitest";

import { getAdminAccessRequestListState } from "./admin-access-request-state";

describe("getAdminAccessRequestListState", () => {
  it.each([
    [{ isLoading: true }, "loading"],
    [{ isError: true, errorStatus: 403 }, "unauthorized"],
    [{ isError: true, errorStatus: 500 }, "error"],
    [{ itemCount: 1 }, "content"],
    [{ hasActiveFilters: true }, "no-results"],
    [{}, "empty"],
  ] as const)("returns the expected list state", (overrides, expected) => {
    expect(
      getAdminAccessRequestListState({
        errorStatus: null,
        hasActiveFilters: false,
        isError: false,
        isLoading: false,
        itemCount: 0,
        ...overrides,
      }),
    ).toBe(expected);
  });
});
