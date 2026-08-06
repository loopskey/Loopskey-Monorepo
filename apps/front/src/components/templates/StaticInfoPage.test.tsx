// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import pages from "@/content/footer-static-pages.json";
import { StaticInfoPage } from "./StaticInfoPage";

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
] as const;

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

    const emailLink = screen.getByRole("link", { name: "loopskey.dev@gmail.com" });
    expect(emailLink).toHaveAttribute("href", "mailto:loopskey.dev@gmail.com");
  });
});
