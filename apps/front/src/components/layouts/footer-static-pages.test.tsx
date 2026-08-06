// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import Footer from "./Footer";

vi.mock("@hooks/useI18n", () => ({
  useI18n: () => ({
    t: (key: string) => {
      const labels: Record<string, string> = {
        "footer.allRightsReserved": "All rights reserved.",
        "footer.brandDescription": "LoopsKey learning intelligence.",
        "footer.privacyPolicy": "Privacy Policy",
        "footer.termsOfService": "Terms of Service",
        "social.facebook": "Facebook",
        "social.linkedin": "LinkedIn",
        "social.x": "X",
        "social.youtube": "YouTube",
      };

      return labels[key] ?? key;
    },
  }),
}));

vi.mock("@layouts/parts/logo", () => ({
  Logo: () => <span>LoopsKey</span>,
}));

describe("Footer static-page navigation", () => {
  afterEach(cleanup);

  it("renders the approved footer columns and links in order", () => {
    render(<Footer />);

    const expectedColumns = [
      {
        title: "Solutions",
        links: [
          ["For Professionals", "/solutions/professionals"],
          ["For Associations", "/solutions/associations"],
          ["For Organizations", "/solutions/organizations"],
          ["For Content Providers", "/solutions/content-providers"],
        ],
      },
      {
        title: "Support",
        links: [
          ["Help Center", "/faq"],
          ["Contact Us", "/contact"],
          ["Accessibility", "/support/accessibility"],
          ["Security & Data Protection", "/support/security-data-protection"],
        ],
      },
      {
        title: "Legal",
        links: [
          ["Terms of Use", "/terms"],
          ["Privacy Policy", "/privacy-policy"],
          ["Cookie Statement", "/cookies"],
        ],
      },
      {
        title: "Company",
        links: [
          ["About LoopsKey", "/about"],
          ["Association Partners", "/company/association-partners"],
          ["Content Providers", "/company/content-providers"],
        ],
      },
    ];

    expect(screen.queryByRole("heading", { name: "Explorer" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Resources" })).not.toBeInTheDocument();
    expect(screen.queryByText("contact@loopskey.com")).not.toBeInTheDocument();

    for (const column of expectedColumns) {
      const heading = screen.getByRole("heading", { name: column.title });
      const list = heading.nextElementSibling;

      expect(list?.tagName).toBe("UL");
      expect(within(list as HTMLElement).getAllByRole("link").map((link) => [link.textContent, link.getAttribute("href")])).toEqual(
        column.links,
      );
    }
  });

  it("preserves the existing bottom-bar legal links", () => {
    render(<Footer />);

    const bottomBar = screen.getByText(/All rights reserved/).closest("div");
    const bottomBarLinks = within(bottomBar as HTMLElement)
      .getAllByRole("link")
      .map((link) => [link.textContent, link.getAttribute("href")]);

    expect(bottomBarLinks).toEqual([
      ["Privacy Policy", "/privacy-policy"],
      ["Terms of Service", "/terms"],
    ]);
  });
});
