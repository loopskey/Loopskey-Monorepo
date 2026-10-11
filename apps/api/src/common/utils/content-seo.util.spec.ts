import {
  SEO_DESCRIPTION_MAX_LENGTH,
  SEO_IMAGE_ALT_MAX_LENGTH,
  SEO_TITLE_MAX_LENGTH,
  applySeoPatch,
  changedSeoFields,
  cleanSeoText,
  effectiveSeo,
  emptySeoFields,
} from "@utils/content-seo.util";

import type { SeoFields } from "@utils/content-seo.util";

const withImage: SeoFields = {
  seoTitle: "Title",
  seoDescription: "Description",
  socialImageId: "image-1",
  socialImageAlt: "Alt",
};

describe("applySeoPatch", () => {
  it("preserves a field the patch omits", () => {
    expect(applySeoPatch(withImage, { seoTitle: "Next" })).toEqual({
      ...withImage,
      seoTitle: "Next",
    });
  });

  it("clears on null and on a blank value", () => {
    expect(applySeoPatch(withImage, { seoTitle: null }).seoTitle).toBeNull();
    expect(applySeoPatch(withImage, { seoTitle: "  \n " }).seoTitle).toBeNull();
    expect(
      applySeoPatch(withImage, { seoDescription: "" }).seoDescription,
    ).toBeNull();
  });

  it("collapses whitespace and strips control characters", () => {
    expect(cleanSeoText("  A \t\n  B\u0000C ")).toBe("A B C");
    expect(applySeoPatch(null, { seoTitle: "  Hello   world " }).seoTitle).toBe(
      "Hello world",
    );
  });

  it("treats markup as plain text and never alters it", () => {
    expect(
      applySeoPatch(null, { seoTitle: "<script>alert(1)</script>" }).seoTitle,
    ).toBe("<script>alert(1)</script>");
  });

  it("accepts the bound and refuses one character more", () => {
    const exact = "a".repeat(SEO_TITLE_MAX_LENGTH);
    expect(applySeoPatch(null, { seoTitle: exact }).seoTitle).toBe(exact);
    expect(() => applySeoPatch(null, { seoTitle: `${exact}a` })).toThrow();
    expect(() =>
      applySeoPatch(null, {
        seoDescription: "a".repeat(SEO_DESCRIPTION_MAX_LENGTH + 1),
      }),
    ).toThrow();
    expect(() =>
      applySeoPatch(withImage, {
        socialImageAlt: "a".repeat(SEO_IMAGE_ALT_MAX_LENGTH + 1),
      }),
    ).toThrow();
  });

  it("drops the alt text when the image is cleared", () => {
    const next = applySeoPatch(withImage, { socialImageId: null });
    expect(next.socialImageId).toBeNull();
    expect(next.socialImageAlt).toBeNull();
  });

  it("drops the old alt text when the image changes and no alt is given", () => {
    const next = applySeoPatch(withImage, { socialImageId: "image-2" });
    expect(next.socialImageId).toBe("image-2");
    expect(next.socialImageAlt).toBeNull();
  });

  it("keeps a new alt text given with a new image", () => {
    const next = applySeoPatch(withImage, {
      socialImageId: "image-2",
      socialImageAlt: "New",
    });
    expect(next.socialImageAlt).toBe("New");
  });

  it("ignores an alt text given without an image", () => {
    expect(
      applySeoPatch(null, { socialImageAlt: "Orphan" }).socialImageAlt,
    ).toBeNull();
  });
});

describe("changedSeoFields", () => {
  it("names only the fields that differ", () => {
    expect(
      changedSeoFields(withImage, { ...withImage, seoDescription: null }),
    ).toEqual(["seoDescription"]);
  });

  it("treats a first save of empty values as no change", () => {
    expect(changedSeoFields(null, emptySeoFields())).toEqual([]);
  });
});

describe("effectiveSeo", () => {
  it("falls back to nothing when no row exists", () => {
    expect(effectiveSeo(undefined)).toEqual({
      seoTitle: null,
      seoDescription: null,
      socialImageAlt: null,
      socialImagePath: null,
    });
  });

  it("exposes the image as a path under the public route", () => {
    expect(effectiveSeo(withImage).socialImagePath).toBe(
      "/content-social-image/image-1",
    );
  });
});
