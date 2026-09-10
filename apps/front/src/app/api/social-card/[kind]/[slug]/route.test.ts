import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/social-card/content", () => ({
  isSocialCardKind: (value: string) =>
    ["course", "event", "podcast", "youtube"].includes(value),
  fetchSocialCardContent: vi.fn(),
}));

vi.mock("@/lib/social-card/render", () => ({
  renderSocialCard: vi.fn(async (input) => ({ __card: input })),
}));

import { GET } from "@/app/api/social-card/[kind]/[slug]/route";
import { fetchSocialCardContent } from "@/lib/social-card/content";
import { renderSocialCard } from "@/lib/social-card/render";

const request = (origin = "http://localhost:3000") =>
  ({ nextUrl: new URL(origin) }) as unknown as Parameters<typeof GET>[0];

const call = (kind: string, slug: string) =>
  GET(request(), { params: Promise.resolve({ kind, slug }) });

describe("social card route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("404s an unknown kind and never renders", async () => {
    const response = await call("channel", "x");
    expect(response.status).toBe(404);
    expect(renderSocialCard).not.toHaveBeenCalled();
  });

  it("redirects to a real stored image for published content", async () => {
    vi.mocked(fetchSocialCardContent).mockResolvedValue({
      title: "Applied ML",
      category: "TECHNOLOGY",
      published: true,
      imageUrl: "https://cdn.test/x.webp",
    });
    const response = await call("course", "applied-ml");
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://cdn.test/x.webp");
    expect(renderSocialCard).not.toHaveBeenCalled();
  });

  it("renders the generated card with the title for published content with no image", async () => {
    vi.mocked(fetchSocialCardContent).mockResolvedValue({
      title: "Applied ML",
      category: "TECHNOLOGY",
      published: true,
      imageUrl: null,
    });
    await call("course", "applied-ml");
    expect(renderSocialCard).toHaveBeenCalledWith({
      kind: "course",
      title: "Applied ML",
      category: "TECHNOLOGY",
      published: true,
    });
  });

  it("renders without disclosing the title for unpublished content", async () => {
    vi.mocked(fetchSocialCardContent).mockResolvedValue({
      title: "Secret Draft",
      category: "TECHNOLOGY",
      published: false,
      imageUrl: null,
    });
    await call("course", "secret-draft");
    expect(renderSocialCard).toHaveBeenCalledWith({
      kind: "course",
      title: "Secret Draft",
      category: "TECHNOLOGY",
      published: false,
    });
    // The renderer is what withholds the title; `published: false` is the gate.
  });

  it("still renders a generic card when the content lookup fails", async () => {
    vi.mocked(fetchSocialCardContent).mockResolvedValue(null);
    await call("podcast", "missing");
    expect(renderSocialCard).toHaveBeenCalledWith({
      kind: "podcast",
      title: null,
      category: null,
      published: false,
    });
  });
});
