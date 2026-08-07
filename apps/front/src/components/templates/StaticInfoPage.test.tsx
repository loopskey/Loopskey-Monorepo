// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildStaticInfoOutline,
  slugifyHeading,
  type PageKey,
} from "./static-info-page.utils";
import pages from "@/content/footer-static-pages.json";
import { StaticInfoPage } from "./StaticInfoPage";

vi.mock("@hooks/useI18n", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      const labels: Record<string, string> = {
        "staticInfoPage.eyebrow": "LoopsKey information",
        "staticInfoPage.referenceEyebrow": "Detailed information",
        "staticInfoPage.nav.title": "On this page",
        "staticInfoPage.nav.description": "Jump straight to the section you need.",
        "staticInfoPage.nav.label": `Sections of ${params?.page ?? ""}`,
        "staticInfoPage.sectionLabel": `Section ${params?.number ?? ""}`,
        "staticInfoPage.backToTop": "Back to top",
      };

      return labels[key] ?? key;
    },
  }),
}));

const expectedPageKeys = [
  "professionals",
  "associations",
  "organizations",
  "solutionContentProviders",
  "helpCenter",
  "contact",
  "accessibility",
  "security",
  "terms",
  "privacy",
  "cookies",
  "about",
  "associationPartners",
  "companyContentProviders",
] as const satisfies readonly PageKey[];

describe("StaticInfoPage content", () => {
  afterEach(cleanup);

  it("ships the fourteen approved footer static pages with non-empty content", () => {
    expect(Object.keys(pages).sort()).toEqual([...expectedPageKeys].sort());

    for (const pageKey of expectedPageKeys) {
      expect(pages[pageKey].title).toEqual(expect.any(String));
      expect(pages[pageKey].title.length).toBeGreaterThan(0);
      expect(pages[pageKey].blocks.length).toBeGreaterThan(0);
    }
  });

  it("does not ship deprecated email addresses or legal placeholders", () => {
    const serializedPages = JSON.stringify(pages);

    expect(serializedPages).not.toContain("contact@loopskey.com");
    expect(serializedPages).not.toContain("[Insert Date]");
    expect(serializedPages).toContain("loopskey.dev@gmail.com");
  });

  it("renders email addresses as mailto links", () => {
    render(<StaticInfoPage pageKey="contact" />);

    const emailLink = screen.getByRole("link", {
      name: "loopskey.dev@gmail.com",
    });

    expect(emailLink).toHaveAttribute("href", "mailto:loopskey.dev@gmail.com");
  });
});

describe("buildStaticInfoOutline", () => {
  it("splits every page into an intro plus one section per heading", () => {
    for (const pageKey of expectedPageKeys) {
      const outline = buildStaticInfoOutline(pageKey);
      const headings = pages[pageKey].blocks.filter(
        (block) => block.type === "heading",
      );

      expect(outline.title).toBe(pages[pageKey].title);
      expect(outline.sections).toHaveLength(headings.length);
      expect(outline.sections.length).toBeGreaterThan(0);

      // Everything before the first heading becomes the page intro.
      const startsWithHeading = pages[pageKey].blocks[0]?.type === "heading";
      expect(outline.lead.length > 0).toBe(!startsWithHeading);
    }
  });

  it("gives every section a unique, selector-safe anchor id", () => {
    for (const pageKey of expectedPageKeys) {
      const ids = buildStaticInfoOutline(pageKey).sections.map(
        (section) => section.id,
      );

      expect(new Set(ids).size).toBe(ids.length);
      // Numbered headings such as "1. What Cookies Are" must not produce an id
      // starting with a digit, which is an invalid CSS identifier.
      expect(ids.every((id) => /^[a-z][a-z0-9-]*$/.test(id))).toBe(true);
    }
  });

  it("merges consecutive bullets into a single list instead of one list per bullet", () => {
    const section = buildStaticInfoOutline("professionals").sections.find(
      (item) => item.title === "What Professionals Can Do with LoopsKey",
    );

    expect(section).toBeDefined();

    const lists = section!.blocks.filter((block) => block.type === "list");

    expect(lists).toHaveLength(1);
    expect(lists[0]).toMatchObject({
      type: "list",
      items: expect.arrayContaining([
        "Create a personalized learning roadmap",
        "Generate CPD/PDU summaries for reporting",
      ]),
    });
  });

  it("preserves every content block", () => {
    for (const pageKey of expectedPageKeys) {
      const outline = buildStaticInfoOutline(pageKey);
      const rendered = [...outline.lead, ...outline.sections.flatMap((s) => s.blocks)]
        .flatMap((block) => (block.type === "list" ? block.items : [block.text]))
        .concat(outline.sections.map((section) => section.title));

      const original = pages[pageKey].blocks.map((block) => block.text);

      expect(rendered.sort()).toEqual(original.sort());
    }
  });

  it("slugifies headings into anchor-safe ids", () => {
    expect(slugifyHeading("Security & Data Protection")).toBe(
      "security-data-protection",
    );
    expect(slugifyHeading("  Your Rights  ")).toBe("your-rights");
    expect(slugifyHeading("***")).toBe("section");
  });
});

describe("StaticInfoPage standalone layout", () => {
  afterEach(cleanup);

  it("renders exactly one h1 and one h2 per section", () => {
    const outline = buildStaticInfoOutline("cookies");
    render(<StaticInfoPage pageKey="cookies" />);

    const levelOne = screen.getAllByRole("heading", { level: 1 });
    expect(levelOne).toHaveLength(1);
    expect(levelOne[0]).toHaveTextContent(outline.title);

    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(
      outline.sections.length,
    );
  });

  it("exposes in-page navigation linking to each section anchor", () => {
    const outline = buildStaticInfoOutline("cookies");
    const { container } = render(<StaticInfoPage pageKey="cookies" />);

    const nav = screen.getByRole("navigation", {
      name: `Sections of ${outline.title}`,
    });

    const navLinks = within(nav).getAllByRole("link");
    expect(navLinks).toHaveLength(outline.sections.length);

    outline.sections.forEach((section, index) => {
      expect(navLinks[index]).toHaveAttribute("href", `#${section.id}`);
      expect(navLinks[index]).toHaveTextContent(section.title);
      expect(container.querySelector(`#${section.id}`)).not.toBeNull();
    });
  });

  it("offers a back-to-top link targeting the page heading", () => {
    render(<StaticInfoPage pageKey="cookies" />);

    expect(screen.getByRole("link", { name: /back to top/i })).toHaveAttribute(
      "href",
      "#static-info-cookies-title",
    );
  });
});

describe("StaticInfoPage embedded layout", () => {
  afterEach(cleanup);

  it("does not emit an h1 or a second in-page navigation", () => {
    const outline = buildStaticInfoOutline("about");
    render(<StaticInfoPage pageKey="about" embedded />);

    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();

    const levelTwo = screen.getAllByRole("heading", { level: 2 });
    expect(levelTwo).toHaveLength(1);
    expect(levelTwo[0]).toHaveTextContent(outline.title);

    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(
      outline.sections.length,
    );
  });

  it("namespaces section anchors so they cannot clash with the host page", () => {
    const outline = buildStaticInfoOutline("about");
    const { container } = render(<StaticInfoPage pageKey="about" embedded />);

    for (const section of outline.sections) {
      expect(container.querySelector(`#about-${section.id}`)).not.toBeNull();
      expect(container.querySelector(`#${section.id}`)).toBeNull();
    }
  });

  it("labels the embedded region with its own heading", () => {
    render(<StaticInfoPage pageKey="about" embedded />);

    const region = screen.getByRole("region", {
      name: buildStaticInfoOutline("about").title,
    });

    expect(region).toBeInTheDocument();
  });
});
