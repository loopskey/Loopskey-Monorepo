import { afterEach, describe, expect, it, vi } from "vitest";

import {
  fetchSocialCardContent,
  isSocialCardKind,
} from "@/lib/social-card/content";
import { contentSocialMetadata } from "@/lib/social-card/metadata";
import {
  SOCIAL_CARD_MOTIFS,
  resolveSocialCardMotif,
} from "@/lib/social-card/motifs";

describe("social card motifs", () => {
  it("covers the fifteen phase 00 categories", () => {
    expect(Object.keys(SOCIAL_CARD_MOTIFS).sort()).toEqual(
      [
        "AI",
        "BUSINESS",
        "CAREER",
        "COMPLIANCE",
        "CPD",
        "DATA",
        "DESIGN",
        "EDUCATION",
        "ENGINEERING",
        "FINANCE",
        "HEALTHCARE",
        "LEADERSHIP",
        "MARKETING",
        "OTHER",
        "TECHNOLOGY",
      ].sort(),
    );
  });

  it("resolves a known category and falls back to OTHER", () => {
    expect(resolveSocialCardMotif("technology")?.key).toBe("TECHNOLOGY");
    expect(resolveSocialCardMotif("  Finance ")?.key).toBe("FINANCE");
    expect(resolveSocialCardMotif("not-a-category")?.key).toBe("OTHER");
    expect(resolveSocialCardMotif(null)?.key).toBe("OTHER");
  });
});

describe("isSocialCardKind", () => {
  it("accepts the four content kinds only", () => {
    for (const kind of ["course", "event", "podcast", "youtube"])
      expect(isSocialCardKind(kind)).toBe(true);
    for (const kind of ["", "COURSE", "channel", "video"])
      expect(isSocialCardKind(kind)).toBe(false);
  });
});

describe("contentSocialMetadata", () => {
  it("points Open Graph and Twitter at the card route", () => {
    const meta = contentSocialMetadata("event", "a b/c");
    const url = "/api/social-card/event/a%20b%2Fc";
    expect(meta.openGraph?.images).toEqual([
      { url, width: 1200, height: 630 },
    ]);
    expect(meta.twitter).toMatchObject({
      card: "summary_large_image",
      images: [url],
    });
  });
});

describe("fetchSocialCardContent", () => {
  const endpoint = "http://api.test/graphql";
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.unstubAllEnvs();
  });

  const withResponse = (body: unknown, ok = true) => {
    vi.stubEnv("NEXT_PUBLIC_GRAPHQL_URL", endpoint);
    global.fetch = vi.fn().mockResolvedValue({
      ok,
      json: async () => body,
    }) as unknown as typeof fetch;
  };

  it("maps a published row with an image", async () => {
    withResponse({
      data: {
        courseBySlug: {
          title: "Applied ML",
          category: "TECHNOLOGY",
          status: "PUBLISHED",
          imageUrl: " https://cdn.test/x.webp ",
        },
      },
    });
    await expect(fetchSocialCardContent("course", "applied-ml")).resolves.toEqual(
      {
        title: "Applied ML",
        category: "TECHNOLOGY",
        published: true,
        imageUrl: "https://cdn.test/x.webp",
      },
    );
  });

  it("reports a draft row as unpublished with no image", async () => {
    withResponse({
      data: {
        eventBySlug: {
          title: "Summit",
          category: null,
          status: "DRAFT",
          imageUrl: null,
        },
      },
    });
    await expect(fetchSocialCardContent("event", "summit")).resolves.toEqual({
      title: "Summit",
      category: null,
      published: false,
      imageUrl: null,
    });
  });

  it("returns null when the endpoint is unset, the row is missing, or the call fails", async () => {
    vi.stubEnv("NEXT_PUBLIC_GRAPHQL_URL", "");
    await expect(fetchSocialCardContent("course", "x")).resolves.toBeNull();

    withResponse({ data: { podcastBySlug: null } });
    await expect(fetchSocialCardContent("podcast", "x")).resolves.toBeNull();

    withResponse({}, false);
    await expect(fetchSocialCardContent("youtube", "x")).resolves.toBeNull();
  });
});
