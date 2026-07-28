import { Request } from "express";

/**
 * Builds a Passport JWT extractor bound to a specific cookie name.
 *
 * The name must come from configuration. `ACCESS_TOKEN_COOKIE_NAME` is honoured
 * when the cookie is written, so reading a hardcoded name here would make every
 * authenticated request fail whenever that variable is set to a non-default
 * value.
 */
export const cookieExtractorFor =
  (cookieName: string) =>
  (req: Request): string | null => {
    if (!req || !req.cookies) return null;
    return (req.cookies[cookieName] as string | undefined) ?? null;
  };
