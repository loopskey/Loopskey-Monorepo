import { AppLanguage } from "@prisma/client";
import { decodeContentText, presentContentText } from "./content-text.util";
import { localizeRecord } from "./content-translation.util";
import { sanitizeCourseText } from "./course-normalizer.util";

describe("plain content presentation", () => {
  it("decodes the sanitizer output once instead of storing HTML entities", () => {
    expect(sanitizeCourseText("<b>Apply &amp; interpret</b> &#x1f600;")).toBe(
      "Apply & interpret 😀",
    );
    expect(sanitizeCourseText("before<script>alert(1)</script>after")).toBe(
      "beforeafter",
    );
    expect(decodeContentText("&amp;lt;script&amp;gt;")).toBe("&lt;script&gt;");
  });

  it("preserves invalid code points, unknown entities and multilingual text", () => {
    const invalid = "&#0; &#xD800; &#x110000; &#127; &unknown;";
    expect(decodeContentText(invalid)).toBe(invalid);
    expect(decodeContentText("Français &amp; العربية &#38; &#x26;")).toBe(
      "Français & العربية & &",
    );
  });

  it("presents existing records without changing identity, URLs or its input", () => {
    const record = {
      id: "existing",
      slug: "keep-this-slug",
      title: "SPSS: Apply &amp; Interpret",
      description: "Theory &amp; practice",
      requirements: ["A &amp; B"],
      sourceUrl: "https://source.example/?a=1&amp;b=2",
      nullable: null,
    };
    const result = presentContentText(record);
    expect(result).toEqual({
      ...record,
      title: "SPSS: Apply & Interpret",
      description: "Theory & practice",
      requirements: ["A & B"],
    });
    expect(record.title).toContain("&amp;");
    expect(result.slug).toBe(record.slug);
    expect(result.sourceUrl).toBe(record.sourceUrl);
  });

  it("uses the same presentation for the source and published translation", () => {
    const record = { title: "Source &amp; title", sourceLanguage: "en" };
    expect(localizeRecord(record, [], AppLanguage.EN).record.title).toBe(
      "Source & title",
    );
    const result = localizeRecord(
      record,
      [
        {
          locale: AppLanguage.FR,
          title: "Titre &amp; traduction",
          description: "Texte &amp; suite",
        },
      ],
      AppLanguage.FR,
    );
    expect(result.record.title).toBe("Titre & traduction");
    expect(result.availableLocales).toEqual([AppLanguage.EN, AppLanguage.FR]);
    expect(
      localizeRecord(record, [], AppLanguage.FR).isRequestedAvailable,
    ).toBe(false);
  });
});
