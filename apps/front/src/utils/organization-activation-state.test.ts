import { describe, expect, it } from "vitest";

import { OrganizationActivationTokenStatus } from "@lib/graphql/generated";
import { getOrganizationActivationScreen } from "./organization-activation-state";

const base = {
  token: "activation-token",
  isChecking: false,
  isError: false,
};

describe("getOrganizationActivationScreen", () => {
  it("asks for a link when the URL carries no token", () => {
    expect(getOrganizationActivationScreen({ ...base, token: "" })).toBe(
      "missingToken",
    );
  });

  it("waits while the token is being checked", () => {
    expect(getOrganizationActivationScreen({ ...base, isChecking: true })).toBe(
      "checking",
    );
  });

  it("shows the password form for a usable token", () => {
    expect(
      getOrganizationActivationScreen({
        ...base,
        status: OrganizationActivationTokenStatus.Valid,
      }),
    ).toBe("form");
  });

  it("separates an expired token from a used one", () => {
    expect(
      getOrganizationActivationScreen({
        ...base,
        status: OrganizationActivationTokenStatus.Expired,
      }),
    ).toBe("expired");
    expect(
      getOrganizationActivationScreen({
        ...base,
        status: OrganizationActivationTokenStatus.Used,
      }),
    ).toBe("used");
  });

  it("treats an unknown token and a failed check the same way", () => {
    expect(
      getOrganizationActivationScreen({
        ...base,
        status: OrganizationActivationTokenStatus.Invalid,
      }),
    ).toBe("invalid");
    expect(getOrganizationActivationScreen({ ...base, isError: true })).toBe(
      "invalid",
    );
  });

  it("never shows the form while a check is still running", () => {
    expect(
      getOrganizationActivationScreen({
        ...base,
        isChecking: true,
        status: OrganizationActivationTokenStatus.Valid,
      }),
    ).toBe("checking");
  });
});
