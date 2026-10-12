import {
  SecurityHeaderOptions,
  securityHeadersMiddleware,
} from "@utils/security-headers.util";

const run = (options: SecurityHeaderOptions) => {
  const headers = new Map<string, string>();
  const response = {
    setHeader: (name: string, value: string) => headers.set(name, value),
  };
  const next = jest.fn();
  securityHeadersMiddleware(options)({} as never, response as never, next);
  return { headers, next };
};

describe("securityHeadersMiddleware", () => {
  it("always sets the baseline headers and continues", () => {
    const { headers, next } = run({
      hsts: false,
      lockdownContentSecurityPolicy: false,
    });
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headers.get("X-Frame-Options")).toBe("DENY");
    expect(headers.get("Referrer-Policy")).toBe("no-referrer");
    expect(headers.has("Strict-Transport-Security")).toBe(false);
    expect(headers.has("Content-Security-Policy")).toBe(false);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("adds HSTS and a restrictive policy when asked", () => {
    const { headers } = run({
      hsts: true,
      lockdownContentSecurityPolicy: true,
    });
    expect(headers.get("Strict-Transport-Security")).toContain("max-age=");
    expect(headers.get("Content-Security-Policy")).toContain(
      "frame-ancestors 'none'",
    );
  });
});
