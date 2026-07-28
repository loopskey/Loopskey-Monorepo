/**
 * Converts a title into a URL slug.
 *
 * Single implementation of what used to be six copies: five byte-identical
 * private methods on the course, course-import, event, podcast and YouTube
 * services, plus an exported one in `seed-helpers` that nothing imported.
 *
 * Behaviour is deliberately unchanged. Slugs are stored and already indexed as
 * public URLs, so altering this would split new content from existing rows.
 *
 * Returns an empty string when the input reduces to nothing; callers that
 * require a slug should check and raise their own domain error.
 */
export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
