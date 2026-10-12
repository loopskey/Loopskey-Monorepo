import { resolveTrustProxy } from "@utils/trust-proxy.util";

describe("resolveTrustProxy", () => {
  it.each([undefined, "", "  ", "false", "FALSE"])(
    "does not trust forwarding headers for %p",
    (value) => {
      expect(resolveTrustProxy(value)).toBe(false);
    },
  );

  it("accepts a hop count", () => {
    expect(resolveTrustProxy("1")).toBe(1);
    expect(resolveTrustProxy(" 2 ")).toBe(2);
  });

  it("accepts proxy addresses and keywords", () => {
    expect(resolveTrustProxy("loopback")).toBe("loopback");
    expect(resolveTrustProxy("loopback, 10.0.0.0/8")).toBe(
      "loopback, 10.0.0.0/8",
    );
  });

  it("refuses to trust every client", () => {
    expect(() => resolveTrustProxy("true")).toThrow(/trusts every client/);
  });
});
