// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";

const themeState = { resolvedTheme: "dark" as string | undefined };

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: themeState.resolvedTheme }),
}));

// FloatingLines is a WebGL/three component that cannot run in jsdom, so stub it
// to a marker and assert only whether the wrapper decides to mount it.
vi.mock("@ui/floating-lines", () => ({
  FloatingLines: () => <div data-testid="floating-lines" />,
}));

import { LearningParticlesBackground } from "./particles-background";

const configureEnvironment = ({
  reducedMotion = false,
  webgl = true,
}: { reducedMotion?: boolean; webgl?: boolean } = {}) => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reducedMotion,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
  (
    window as unknown as { WebGLRenderingContext?: unknown }
  ).WebGLRenderingContext = webgl ? function WebGLRenderingContext() {} : undefined;
  HTMLCanvasElement.prototype.getContext = vi.fn(() =>
    webgl ? ({} as unknown as RenderingContext) : null,
  ) as typeof HTMLCanvasElement.prototype.getContext;
};

describe("LearningParticlesBackground", () => {
  beforeEach(() => {
    themeState.resolvedTheme = "dark";
    configureEnvironment();
  });
  afterEach(cleanup);

  it("renders FloatingLines exactly once in dark mode with WebGL and motion allowed", () => {
    const { queryAllByTestId } = render(<LearningParticlesBackground />);
    expect(queryAllByTestId("floating-lines")).toHaveLength(1);
  });

  it("never initializes FloatingLines in light mode", () => {
    themeState.resolvedTheme = "light";
    const { queryByTestId } = render(<LearningParticlesBackground />);
    expect(queryByTestId("floating-lines")).toBeNull();
  });

  it("falls back to a static background under reduced motion", () => {
    configureEnvironment({ reducedMotion: true });
    const { queryByTestId } = render(<LearningParticlesBackground />);
    expect(queryByTestId("floating-lines")).toBeNull();
  });

  it("falls back to a static background when WebGL is unavailable", () => {
    configureEnvironment({ webgl: false });
    const { queryByTestId } = render(<LearningParticlesBackground />);
    expect(queryByTestId("floating-lines")).toBeNull();
  });

  it("marks the background decorative and non-interactive", () => {
    const { container } = render(<LearningParticlesBackground />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(root.className).toContain("pointer-events-none");
  });
});
