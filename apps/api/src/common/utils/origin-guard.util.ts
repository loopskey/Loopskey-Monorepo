import { NextFunction, Request, Response } from "express";

const STATE_CHANGING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export const ORIGIN_NOT_ALLOWED_CODE = "ORIGIN_NOT_ALLOWED";

type OriginGuardOptions = {
  allowedOrigins: readonly string[];
  exemptPathPrefixes?: readonly string[];
};

export const originGuardMiddleware = ({
  allowedOrigins,
  exemptPathPrefixes = [],
}: OriginGuardOptions) => {
  const allowed = new Set(allowedOrigins);

  return (request: Request, response: Response, next: NextFunction) => {
    if (!STATE_CHANGING_METHODS.has(request.method)) return next();
    if (exemptPathPrefixes.some((prefix) => request.path.startsWith(prefix)))
      return next();

    const origin = request.headers.origin;
    const fetchSite = request.headers["sec-fetch-site"];
    const refused =
      origin !== undefined ? !allowed.has(origin) : fetchSite === "cross-site";

    if (!refused) return next();

    response.status(403).json({
      code: ORIGIN_NOT_ALLOWED_CODE,
      message: "This origin is not allowed to make this request.",
    });
  };
};
