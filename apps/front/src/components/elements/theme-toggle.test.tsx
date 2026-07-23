// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const setTheme = vi.fn();
const themeState = { resolvedTheme: "dark" as string | undefined };

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: themeState.resolvedTheme, setTheme }),
}));

vi.mock("@hooks/useI18n", () => ({
  useI18n: () => ({
    t: (_key: string, _params?: unknown, fallback?: string) => fallback ?? _key,
  }),
}));

// Radix Tooltip measures its trigger with ResizeObserver, which jsdom lacks.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver =
  ResizeObserverStub as unknown as typeof ResizeObserver;

import { ThemeToggle } from "./theme-toggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    setTheme.mockClear();
    themeState.resolvedTheme = "dark";
  });
  afterEach(cleanup);

  it("labels the control for the target theme and switches to light when dark", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    const button = await screen.findByRole("button", {
      name: "Switch to light mode",
    });
    expect(button).toBeInTheDocument();

    await user.click(button);
    expect(setTheme).toHaveBeenCalledWith("light");
  });

  it("switches to dark when the current theme is light", async () => {
    themeState.resolvedTheme = "light";
    const user = userEvent.setup();
    render(<ThemeToggle />);

    const button = await screen.findByRole("button", {
      name: "Switch to dark mode",
    });
    await user.click(button);
    expect(setTheme).toHaveBeenCalledWith("dark");
  });

  it("is keyboard operable", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    const button = await screen.findByRole("button", {
      name: "Switch to light mode",
    });
    button.focus();
    expect(button).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(setTheme).toHaveBeenCalledWith("light");
  });
});
