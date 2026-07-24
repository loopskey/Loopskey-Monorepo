import { CertificateSort, CertificateStatusFilter } from "@/lib/graphql/generated";
import { describe, expect, it } from "vitest";

import * as H from "@/utils/certificates.helper";

const filters = (overrides: Partial<H.TCertificateListState["filters"]> = {}) => ({
  ...H.CERTIFICATE_INITIAL_FILTERS,
  ...overrides,
});

describe("certificate filters", () => {
  it("starts with no filter applied", () => {
    expect(H.hasActiveCertificateFilters(H.CERTIFICATE_INITIAL_FILTERS)).toBe(
      false,
    );
    expect(H.CERTIFICATE_INITIAL_FILTERS.status).toBe(H.CERTIFICATE_ANY);
    expect(H.CERTIFICATE_INITIAL_FILTERS.sort).toBe(CertificateSort.Recent);
  });

  it("ignores a whitespace-only search", () => {
    expect(H.hasActiveCertificateFilters(filters({ search: "   " }))).toBe(
      false,
    );
  });

  it.each([
    ["search", filters({ search: "pmp" })],
    ["status", filters({ status: CertificateStatusFilter.Expired })],
    ["issuer", filters({ issuer: "PMI" })],
    ["cpdPlan", filters({ cpdPlan: "plan-1" })],
    ["sort", filters({ sort: CertificateSort.Name })],
  ])("treats a changed %s as an active filter", (_label, value) => {
    expect(H.hasActiveCertificateFilters(value)).toBe(true);
  });
});

describe("buildCertificateQueryVariables", () => {
  it("omits every optional argument when nothing is filtered", () => {
    const variables = H.buildCertificateQueryVariables({
      filters: H.CERTIFICATE_INITIAL_FILTERS,
      search: "",
      take: 12,
    });

    expect(variables.filter.search).toBeUndefined();
    expect(variables.status).toBeUndefined();
    expect(variables.issuer).toBeUndefined();
    expect(variables.cpdPlanId).toBeUndefined();
    expect(variables.unlinkedOnly).toBeUndefined();
    expect(variables.sort).toBe(CertificateSort.Recent);
    expect(variables.pagination).toEqual({ take: 12, cursor: undefined });
  });

  it("passes the trimmed search and the selected status through", () => {
    const variables = H.buildCertificateQueryVariables({
      filters: filters({ status: CertificateStatusFilter.ExpiringSoon }),
      search: "  scrum  ",
      cursor: "cursor-1",
      take: 12,
    });

    expect(variables.filter.search).toBe("scrum");
    expect(variables.status).toBe(CertificateStatusFilter.ExpiringSoon);
    expect(variables.pagination.cursor).toBe("cursor-1");
  });

  it("sends a plan id when a specific plan is chosen", () => {
    const variables = H.buildCertificateQueryVariables({
      filters: filters({ cpdPlan: "plan-9" }),
      search: "",
      take: 12,
    });

    expect(variables.cpdPlanId).toBe("plan-9");
    expect(variables.unlinkedOnly).toBeUndefined();
  });

  it("sends unlinkedOnly instead of a plan id for the NONE sentinel", () => {
    const variables = H.buildCertificateQueryVariables({
      filters: filters({ cpdPlan: H.CERTIFICATE_PLAN_NONE }),
      search: "",
      take: 12,
    });

    expect(variables.unlinkedOnly).toBe(true);
    expect(variables.cpdPlanId).toBeUndefined();
  });
});

describe("list-state url round trip", () => {
  it("returns defaults with no params", () => {
    const state = H.readCertificateListState(null);

    expect(state.filters).toEqual(H.CERTIFICATE_INITIAL_FILTERS);
    expect(state.cursorStack).toEqual([]);
    expect(state.page).toBe(1);
    expect(state.selectedId).toBeNull();
  });

  it("reads every supported parameter", () => {
    const state = H.readCertificateListState(
      new URLSearchParams({
        search: "pmp",
        status: CertificateStatusFilter.Expired,
        issuer: "PMI",
        plan: "plan-3",
        sort: CertificateSort.Name,
        cursors: "a,b",
        selected: "cert-7",
      }),
    );

    expect(state.filters.search).toBe("pmp");
    expect(state.filters.status).toBe(CertificateStatusFilter.Expired);
    expect(state.filters.issuer).toBe("PMI");
    expect(state.filters.cpdPlan).toBe("plan-3");
    expect(state.filters.sort).toBe(CertificateSort.Name);
    expect(state.cursorStack).toEqual(["a", "b"]);
    expect(state.page).toBe(3);
    expect(state.selectedId).toBe("cert-7");
  });

  it("rejects a hand-edited status or sort value", () => {
    const state = H.readCertificateListState(
      new URLSearchParams({ status: "NOT_A_STATUS", sort: "NOT_A_SORT" }),
    );

    expect(state.filters.status).toBe(H.CERTIFICATE_ANY);
    expect(state.filters.sort).toBe(CertificateSort.Recent);
  });

  it("survives an encode/decode round trip", () => {
    const original: H.TCertificateListState = {
      filters: filters({
        search: "agile",
        status: CertificateStatusFilter.Active,
        issuer: "Scrum Alliance",
        cpdPlan: H.CERTIFICATE_PLAN_NONE,
        sort: CertificateSort.ExpirySoonest,
      }),
      cursorStack: ["c1", "c2"],
      page: 3,
      selectedId: "cert-1",
    };

    const decoded = H.readCertificateListState(
      H.certificateListStateToSearchParams(original),
    );

    expect(decoded).toEqual(original);
  });

  it("writes nothing for default filters", () => {
    const params = H.certificateListStateToSearchParams({
      filters: H.CERTIFICATE_INITIAL_FILTERS,
      cursorStack: [],
      page: 1,
      selectedId: null,
    });

    expect(params.toString()).toBe("");
  });
});

describe("navigation hrefs", () => {
  const state: H.TCertificateListState = {
    filters: filters({ search: "pmp" }),
    cursorStack: [],
    page: 1,
    selectedId: null,
  };

  it("opens the form with the list state preserved", () => {
    const href = H.buildCertificateFormHref(state);

    expect(href).toContain(`tab=${H.CERTIFICATE_FORM_TAB}`);
    expect(href).toContain("search=pmp");
    expect(href).not.toContain("id=");
  });

  it("opens the form for a specific certificate", () => {
    expect(H.buildCertificateFormHref(state, "cert-2")).toContain("id=cert-2");
  });

  it("returns to the list and selects the saved certificate", () => {
    const href = H.buildCertificatesReturnHref(
      new URLSearchParams({ search: "pmp", cursors: "a" }),
      { selectedId: "cert-5" },
    );

    expect(href).toContain(`tab=${H.CERTIFICATES_TAB}`);
    expect(href).toContain("search=pmp");
    expect(href).toContain("cursors=a");
    expect(href).toContain("selected=cert-5");
  });

  it("drops the cursor stack when a new certificate must be visible", () => {
    const href = H.buildCertificatesReturnHref(
      new URLSearchParams({ search: "pmp", cursors: "a,b" }),
      { selectedId: "cert-9", resetPagination: true },
    );

    expect(href).not.toContain("cursors=");
    expect(href).toContain("search=pmp");
    expect(href).toContain("selected=cert-9");
  });
});

describe("buildIssuerOptions", () => {
  it("sorts, de-duplicates and drops blanks", () => {
    expect(
      H.buildIssuerOptions(["PMI", "", "Axelos", "PMI"], H.CERTIFICATE_ANY),
    ).toEqual(["Axelos", "PMI"]);
  });

  it("keeps the selected issuer even when the options have not caught up", () => {
    expect(H.buildIssuerOptions(["PMI"], "Scrum Alliance")).toEqual([
      "PMI",
      "Scrum Alliance",
    ]);
  });
});
