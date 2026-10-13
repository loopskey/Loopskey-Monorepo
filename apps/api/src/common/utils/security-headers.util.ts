import { NextFunction, Request, Response } from "express";

export type SecurityHeaderOptions = {
  hsts: boolean;
  lockdownContentSecurityPolicy: boolean;
};

const HSTS_VALUE = "max-age=15552000; includeSubDomains";
const API_CONTENT_SECURITY_POLICY =
  "default-src 'none'; frame-ancestors 'none'; base-uri 'none'";

export const securityHeadersMiddleware =
  (options: SecurityHeaderOptions) =>
  (_request: Request, response: Response, next: NextFunction) => {
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("X-Frame-Options", "DENY");
    response.setHeader("Referrer-Policy", "no-referrer");
    response.setHeader(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()",
    );
    if (options.hsts)
      response.setHeader("Strict-Transport-Security", HSTS_VALUE);
    if (options.lockdownContentSecurityPolicy)
      response.setHeader(
        "Content-Security-Policy",
        API_CONTENT_SECURITY_POLICY,
      );
    next();
  };
