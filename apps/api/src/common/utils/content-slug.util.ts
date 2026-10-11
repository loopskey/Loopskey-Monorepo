import { ContentUrlMessageCode } from "@loopskey/api-contracts/error-codes";
import { BadRequestException } from "@nestjs/common";
import { CONTENT_SLUG_LIMITS } from "@loopskey/api-contracts/validation";
import { slugify } from "@utils/slug.util";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const RESERVED_SLUGS: ReadonlySet<string> = new Set([
  "api",
  "new",
  "edit",
  "create",
  "admin",
  "search",
  "en",
  "fr",
]);

export const invalidContentSlug = () =>
  new BadRequestException({
    code: ContentUrlMessageCode.INVALID_SLUG,
    message: ContentUrlMessageCode.INVALID_SLUG,
  });

export const isWellFormedContentSlug = (slug: string) =>
  slug.length > 0 &&
  slug.length <= CONTENT_SLUG_LIMITS.maxLength &&
  SLUG_PATTERN.test(slug);

export const normalizeContentSlug = (raw: string): string => {
  const candidate = raw.trim().toLowerCase();
  if (!isWellFormedContentSlug(candidate)) throw invalidContentSlug();
  if (slugify(candidate) !== candidate) throw invalidContentSlug();
  if (RESERVED_SLUGS.has(candidate)) throw invalidContentSlug();
  return candidate;
};
