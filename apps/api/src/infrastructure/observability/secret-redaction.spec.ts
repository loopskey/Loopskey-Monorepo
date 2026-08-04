import { redactSecrets } from "./secret-redaction";

describe("redactSecrets", () => {
  it("redacts nested credentials without changing safe context", () => {
    expect(
      redactSecrets({
        userId: "u1",
        password: "bad",
        nested: { accessToken: "secret", result: "ok" },
      }),
    ).toEqual({
      userId: "u1",
      password: "[REDACTED]",
      nested: { accessToken: "[REDACTED]", result: "ok" },
    });
  });
});
