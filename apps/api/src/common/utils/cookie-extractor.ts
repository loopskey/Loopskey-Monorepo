import { Request } from "express";

export const cookieExtractor = (req: Request): string | null => {
  if (!req || !req.cookies) return null;
  return req.cookies["access_token"] ?? null;
};
