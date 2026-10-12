import {
  ORIGIN_NOT_ALLOWED_CODE,
  originGuardMiddleware,
} from "@utils/origin-guard.util";

const FRONTEND = "https://www.example.test";

const run = (
  request: {
    method: string;
    path: string;
    headers?: Record<string, string>;
  },
  exemptPathPrefixes: string[] = ["/v1/ingest"],
) => {
  const status = jest.fn().mockReturnThis();
  const json = jest.fn();
  const next = jest.fn();
  originGuardMiddleware({
    allowedOrigins: [FRONTEND],
    exemptPathPrefixes,
  })({ headers: {}, ...request } as never, { status, json } as never, next);
  return { status, json, next };
};

describe("originGuardMiddleware", () => {
  it("lets safe methods through whatever the origin", () => {
    const { next, status } = run({
      method: "GET",
      path: "/professional/avatar/x",
      headers: { origin: "https://evil.test" },
    });
    expect(next).toHaveBeenCalled();
    expect(status).not.toHaveBeenCalled();
  });

  it("accepts a state-changing request from an allowed origin", () => {
    const { next } = run({
      method: "POST",
      path: "/graphql",
      headers: { origin: FRONTEND },
    });
    expect(next).toHaveBeenCalled();
  });

  it.each(["POST", "PUT", "PATCH", "DELETE"])(
    "refuses a %s from an origin that is not allowed",
    (method) => {
      const { next, status, json } = run({
        method,
        path: "/association/logo",
        headers: { origin: "https://evil.test" },
      });
      expect(next).not.toHaveBeenCalled();
      expect(status).toHaveBeenCalledWith(403);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({ code: ORIGIN_NOT_ALLOWED_CODE }),
      );
    },
  );

  it("refuses the opaque null origin", () => {
    const { next } = run({
      method: "POST",
      path: "/content-social-image",
      headers: { origin: "null" },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("refuses a cross-site browser request that carries no origin", () => {
    const { next } = run({
      method: "POST",
      path: "/content-social-image",
      headers: { "sec-fetch-site": "cross-site" },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("allows server-to-server calls that carry neither header", () => {
    const { next } = run({ method: "POST", path: "/graphql" });
    expect(next).toHaveBeenCalled();
  });

  it("allows same-site browser requests without an origin", () => {
    const { next } = run({
      method: "DELETE",
      path: "/association/logo",
      headers: { "sec-fetch-site": "same-origin" },
    });
    expect(next).toHaveBeenCalled();
  });

  it("exempts credential-less machine endpoints", () => {
    const { next } = run({
      method: "POST",
      path: "/v1/ingest/courses",
      headers: { origin: "https://partner.test" },
    });
    expect(next).toHaveBeenCalled();
  });
});
