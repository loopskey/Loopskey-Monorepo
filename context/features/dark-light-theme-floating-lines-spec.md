---
description: Implement global light/dark themes, add a header theme toggle, and replace the existing particles background with a theme-aware background using FloatingLines in dark mode
argument-hint: [target-layout-or-page]
---

# Feature: Light/Dark Theme with Theme-Aware Background

Implement a complete, production-ready Light and Dark theme system for the project.

Add a theme toggle icon to the main application header beside the existing language switcher.

Update the existing `ParticlesBackground` implementation so that:

- **Light mode:** uses a clean white background with a subtle electric-blue tint or glow.
- **Dark mode:** uses the React Bits `FloatingLines` animated WebGL background.

This must be a functional implementation, not a visual-only mockup.

If `$ARGUMENTS` includes a target layout, page, or component path, prioritize that target while still implementing the shared theme infrastructure required for the application.

If no argument is provided, inspect the main application layout, root providers, header, language switcher, global styles, and existing `ParticlesBackground` component automatically.

---

# Global Rules

- Inspect the existing implementation before changing code.
- Reuse existing providers, components, hooks, utilities, CSS variables, and design-system conventions.
- Do not create duplicate theme providers, theme toggles, or background components.
- Do not modify unrelated business logic.
- Do not redesign unrelated screens.
- Do not leave unfinished buttons or placeholder implementations.
- Do not hardcode production-specific paths when the project already has route or alias conventions.
- Do not claim tests passed unless they were actually executed successfully.
- Clearly separate pre-existing failures from failures introduced by this feature.

---

# Phase 1 — Audit Existing Theme, Header, and Background Architecture

Before implementing anything, inspect:

- Project framework and React version
- Package manager
- Root application layout
- Root providers
- Main header
- Mobile header
- Language switcher
- Existing `ParticlesBackground` component
- All usages of `ParticlesBackground`
- Existing theme provider
- Existing `next-themes` usage
- Existing dark-mode implementation
- Tailwind configuration
- shadcn configuration
- Global CSS
- CSS variables
- Existing semantic design tokens
- Existing local-storage utilities
- Existing authenticated user-preference storage
- Existing reduced-motion utilities
- Existing responsive header patterns
- Existing icon and tooltip libraries
- Existing tests for layout, header, or theme behavior

Determine:

1. Whether a theme provider already exists
2. Whether the project already supports Light and Dark modes
3. Whether Tailwind uses class-based dark mode
4. Whether theme preference is persisted
5. Whether system theme is respected
6. Whether theme state is stored in the authenticated user profile
7. Whether desktop and mobile headers use separate components
8. Where the language switcher is rendered
9. Where `ParticlesBackground` is rendered
10. Whether `ParticlesBackground` is shared across public pages, dashboards, or authentication pages
11. Whether `three` is already installed
12. Whether `FloatingLines` already exists
13. Whether React Bits is already configured in shadcn
14. Whether hardcoded colors will break Light mode
15. Whether SSR or hydration issues are possible

Reuse existing architecture wherever possible.

Do not create code yet if a required architectural conflict is discovered. Resolve the conflict using the project’s established conventions.

---

# Phase 2 — Implement the Global Theme Foundation

Implement two user-selectable modes:

- Light
- Dark

## Preferred Architecture

If the project already uses `next-themes` or another theme provider, reuse and complete it.

If no theme provider exists and the project is compatible with `next-themes`, install and configure it.

Do not introduce multiple competing theme systems.

## Theme Requirements

The theme must:

- Apply globally
- Persist after refresh
- Persist across route navigation
- Update immediately without a page reload
- Work in desktop and mobile layouts
- Avoid hydration mismatch
- Minimize incorrect-theme flashing during initial load
- Work with SSR when applicable
- Update the root document class or the project’s existing theme target
- Remain compatible with the language switcher

## Default Theme Priority

Use this priority:

1. Existing saved theme preference
2. Existing authenticated user preference, if already supported
3. Operating-system preference
4. Light mode fallback

The visible toggle should support only Light and Dark unless the current project already exposes a System option.

## Tailwind

If the project uses Tailwind and does not already have a valid theme strategy, configure class-based dark mode:

```ts
darkMode: "class";
```

Do not overwrite an existing valid Tailwind dark-mode strategy.

## Root Theme Provider

Use the smallest correct provider boundary.

For a Next.js App Router project, use an architecture similar to:

```tsx
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
>
  {children}
</ThemeProvider>
```

Adapt this to the project’s current provider and layout structure.

Do not make the full application a client component when a small provider wrapper is sufficient.

---

# Phase 3 — Create or Complete Semantic Theme Tokens

Inspect global styles and replace theme-sensitive hardcoded colors where necessary.

Prefer existing semantic tokens such as:

```css
--background
--foreground
--card
--card-foreground
--popover
--popover-foreground
--primary
--primary-foreground
--secondary
--secondary-foreground
--muted
--muted-foreground
--accent
--accent-foreground
--border
--input
--ring
--destructive
--destructive-foreground
```

Ensure Light and Dark values are defined consistently.

Review at minimum:

- Body background
- Main layout
- Header
- Sidebar
- Dashboard content
- Cards
- Tables
- Forms
- Inputs
- Selects
- Dropdowns
- Dialogs
- Drawers
- Tooltips
- Buttons
- Borders
- Charts
- Empty states
- Skeletons
- Toast notifications
- File-upload areas
- Authentication pages

Do not unnecessarily replace brand colors.

Do not rewrite unrelated component styling.

Use semantic classes and variables rather than scattering independent Light/Dark colors throughout the codebase.

---

# Phase 4 — Add the Header Theme Toggle

Add a theme toggle icon beside the existing language switcher.

Update all relevant header implementations, including desktop and mobile versions if they are separate.

## Required Behavior

The control must:

- Toggle between Light and Dark mode
- Update instantly
- Persist the selected mode
- Work after page refresh
- Work across route changes
- Match the existing header style
- Not shift layout when the icon changes
- Not interfere with the language switcher
- Be keyboard accessible
- Have a visible focus state
- Have a tooltip
- Have an accessible `aria-label`

Use the project’s existing icon library.

Preferred icons:

- Sun
- Moon

Suggested labels:

```text
Switch to dark mode
Switch to light mode
```

Suggested tooltip text:

```text
Dark mode
Light mode
```

## Hydration Safety

Do not render an incorrect icon before the client theme state is available.

Use a mounted-state strategy when required.

Do not make the entire header a client component if a small client-side theme-toggle component is sufficient.

## Theme Toggle Component

Prefer a reusable component such as:

```text
ThemeToggle
```

Follow the existing component naming and folder structure.

Do not create multiple theme-toggle implementations for desktop and mobile unless the current architecture requires separate wrappers.

---

# Phase 5 — Install and Inspect FloatingLines

Use the React Bits shadcn component:

```bash
npx shadcn@latest add @react-bits/FloatingLines-TS-TW
```

Before running the command:

- Confirm the correct project root
- Confirm shadcn is configured
- Confirm the package manager
- Check whether `three` is already installed
- Avoid duplicate dependencies
- Avoid overwriting unrelated shadcn configuration
- Check whether the component already exists

If the project uses `pnpm`, `yarn`, or another package manager, use the compatible project command.

If the React Bits registry command cannot be used safely, manually integrate the supplied component code using the project’s existing component conventions.

After installation:

- Inspect the generated component
- Confirm the actual prop API
- Confirm import aliases
- Confirm the `three` dependency
- Confirm TypeScript compatibility
- Confirm React compatibility
- Confirm whether `'use client'` is required
- Confirm whether generated styles match the current Tailwind configuration

Do not blindly overwrite a working generated component with the supplied sample.

---

# Phase 6 — Important FloatingLines Prop Compatibility

The supplied usage example contains:

```tsx
gradientStart = "#e945f5";
gradientMid = "#6f6f6f";
gradientEnd = "#6a6a6a";
```

However, the supplied `FloatingLinesProps` type does not define these properties.

The supplied implementation expects:

```tsx
linesGradient={['#e945f5', '#6f6f6f', '#6a6a6a']}
```

Therefore:

- Use the actual generated component API.
- If the installed React Bits component supports `gradientStart`, `gradientMid`, and `gradientEnd`, those props may be used.
- If it uses `linesGradient`, use `linesGradient`.
- Do not pass unsupported props.
- Do not silence TypeScript errors using `any`.
- Do not modify the component API unnecessarily just to match the example.

Use this configuration when the component supports `linesGradient`:

```tsx
const DARK_FLOATING_LINES_GRADIENT = ["#e945f5", "#6f6f6f", "#6a6a6a"] as const;
```

```tsx
<FloatingLines
  enabledWaves={["top", "middle", "bottom"]}
  lineCount={8}
  lineDistance={8}
  bendRadius={8}
  bendStrength={-2}
  interactive
  parallax
  animationSpeed={1}
  linesGradient={[...DARK_FLOATING_LINES_GRADIENT]}
/>
```

Keep static arrays outside the render function or memoize them so the WebGL effect is not recreated unnecessarily.

---

# Phase 7 — Replace or Refactor ParticlesBackground

Inspect the existing `ParticlesBackground` file and all imports.

Implement theme-aware behavior.

## Preferred Strategy

Prefer preserving the current public export when this avoids unnecessary changes.

For example, if pages currently import:

```tsx
import ParticlesBackground from "@/components/particles-background";
```

it is acceptable to keep the wrapper and change its internal implementation so it renders:

- Static electric-white background in Light mode
- `FloatingLines` in Dark mode

Rename the component only if retaining the old name creates unnecessary confusion and all imports can be safely updated.

Do not run the old particles animation and FloatingLines simultaneously.

Remove obsolete particle code only after confirming it is unused.

Do not remove shared particle dependencies if other parts of the application still use them.

## Recommended Internal Structure

Use a theme-aware wrapper such as:

```tsx
<ThemeAwareBackground />
```

or preserve:

```tsx
<ParticlesBackground />
```

with a new internal implementation.

The wrapper should be responsible for selecting the Light or Dark background.

---

# Phase 8 — Light Mode Background Design

In Light mode, do not initialize or render the FloatingLines WebGL animation.

Use a clean white background with a subtle electric-blue tint.

The visual should be:

- Primarily white
- Soft
- Professional
- Slightly electric or cool-blue
- Suitable behind forms and dashboard cards
- Low-noise
- Readable
- Responsive
- Static or very subtle

A suitable implementation may use layered gradients similar to:

```tsx
<div
  aria-hidden="true"
  className="absolute inset-0 overflow-hidden bg-background dark:hidden"
>
  <div
    className="
      absolute inset-0
      bg-[radial-gradient(circle_at_top_left,rgba(46,112,255,0.14),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(99,154,255,0.10),transparent_42%)]
    "
  />
  <div
    className="
      absolute inset-0
      bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(238,246,255,0.88))]
    "
  />
</div>
```

Adapt this to the project’s CSS conventions.

Prefer semantic CSS variables over arbitrary values when appropriate.

Do not make Light mode strongly blue.

Do not render unnecessary animation in Light mode.

---

# Phase 9 — Dark Mode FloatingLines Background

In Dark mode, render `FloatingLines`.

Use the requested visual configuration as the starting point:

```tsx
<FloatingLines
  enabledWaves={["top", "middle", "bottom"]}
  lineCount={8}
  lineDistance={8}
  bendRadius={8}
  bendStrength={-2}
  interactive
  parallax
  animationSpeed={1}
  linesGradient={["#e945f5", "#6f6f6f", "#6a6a6a"]}
/>
```

Use a dark base layer behind the animation so the page remains clearly dark:

```tsx
<div className="absolute inset-0 hidden bg-background dark:block">
  <FloatingLines />
</div>
```

Use existing theme tokens rather than hardcoded colors when possible.

The dark background must:

- Fill the intended container
- Stay behind content
- Remain responsive
- Avoid horizontal overflow
- Keep content readable
- Avoid interfering with header controls
- Avoid blocking forms and buttons
- Not create duplicate canvases
- Clean up correctly on theme switch or route change

---

# Phase 10 — Layering and Pointer Interaction

The background must remain decorative and behind all content.

Use a structure similar to:

```tsx
<section className="relative isolate min-h-screen overflow-hidden">
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 -z-10"
  >
    <ThemeAwareBackground />
  </div>

  <div className="relative z-10">{children}</div>
</section>
```

Adapt this to the current layout.

Verify that:

- Header remains clickable
- Language switcher remains clickable
- Theme toggle remains clickable
- Forms remain interactive
- Dropdowns appear above the background
- Dialogs and drawers are not hidden
- Tooltips are not clipped
- Mobile navigation is not blocked
- The canvas does not create unintended stacking contexts
- No horizontal scrolling is introduced

## Interactive Dark Background

The requested FloatingLines background is interactive.

A decorative canvas with `pointer-events: none` cannot receive pointer events directly.

Use one of these safe approaches:

1. Track pointer movement from the parent layout container
2. Track pointer movement from `window`
3. Extend the component to accept external pointer coordinates
4. Disable direct canvas pointer interception while preserving visual interaction through a parent listener

Do not place the canvas above interactive UI simply to receive pointer events.

Do not let the animated background block clicks.

---

# Phase 11 — Client Component and SSR Safety

The supplied FloatingLines implementation uses:

- `window`
- `ResizeObserver`
- `requestAnimationFrame`
- WebGL
- Three.js
- React effects

For SSR frameworks:

- Add `'use client'` only where required
- Keep the browser-only component isolated
- Do not make the entire page or layout a client component unnecessarily
- Avoid accessing `window` during server render
- Avoid rendering browser-dependent values before mount
- Avoid hydration mismatch
- Use dynamic import without SSR only if required by the project architecture

Confirm that the page renders safely when JavaScript is delayed.

---

# Phase 12 — FloatingLines Lifecycle and Cleanup

Review the generated or integrated FloatingLines code carefully.

Ensure cleanup includes:

- `cancelAnimationFrame`
- `ResizeObserver.disconnect`
- Removing pointer listeners
- `geometry.dispose`
- `material.dispose`
- `renderer.dispose`
- Releasing the WebGL context when appropriate
- Removing the canvas
- Clearing any document or window listeners
- Preventing multiple animation loops
- Preventing rendering after unmount

Avoid repeated `console.error` calls in the animation loop.

Handle React Strict Mode safely.

Switching repeatedly between Light and Dark mode must not create additional canvases or active animation loops.

---

# Phase 13 — Performance Requirements

## Device Pixel Ratio

Cap DPR to reduce GPU load:

```ts
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
```

Do not access `window` during SSR.

## Stable Props

The supplied `useEffect` depends on arrays and objects such as:

- `linesGradient`
- `enabledWaves`
- `lineCount`
- `lineDistance`
- Wave position objects

Avoid passing newly created arrays or objects during every render.

Move static values outside the component or use memoization.

## Theme-Based Initialization

- Do not initialize WebGL in Light mode.
- Destroy the Dark-mode renderer when no longer needed.
- Do not keep both Light and Dark backgrounds active.
- Avoid recreating the renderer during unrelated parent rerenders.

## Visibility

When compatible with the existing architecture:

- Pause animation when the browser tab is hidden
- Pause when reduced motion is enabled
- Optionally pause when the background is not visible
- Resume safely when visible again

Do not add large dependencies solely for this behavior.

---

# Phase 14 — Reduced Motion and Accessibility

Respect:

```css
prefers-reduced-motion: reduce;
```

When reduced motion is enabled:

- Do not run full animation
- Disable parallax
- Disable pointer interaction
- Render a static Dark gradient or paused representation
- Avoid abrupt movement

The background is decorative.

Ensure it:

- Has `aria-hidden="true"`
- Cannot receive focus
- Is not announced by screen readers
- Does not contain meaningful text
- Does not convey required status or information
- Does not cause flashing

The theme toggle itself must remain accessible.

---

# Phase 15 — WebGL Failure Fallback

The application must remain usable when:

- WebGL is unavailable
- Three.js renderer creation fails
- The browser blocks WebGL
- The WebGL context is lost
- A low-power mobile browser cannot render the effect

Provide a static Dark fallback using the requested color family:

```text
#09090b
#e945f5
#6f6f6f
#6a6a6a
```

Do not show raw WebGL errors to users.

Use existing logging conventions for development diagnostics.

Do not repeatedly recreate a failing WebGL renderer.

---

# Phase 16 — Review Shared UI in Both Themes

After implementing the theme system, review important shared surfaces in both Light and Dark mode.

At minimum inspect:

- Header
- Language switcher
- Theme toggle
- Sidebar
- Dashboard page
- Cards
- Tables
- Search toolbars
- Filters
- Inputs
- Selects
- Dropdown menus
- Modals
- Drawers
- Tooltips
- Toasts
- Charts
- Empty states
- Loading skeletons
- Authentication screens
- File-upload areas

Correct theme-specific readability problems caused by this feature.

Do not redesign unrelated content.

Ensure there are no issues such as:

- White text on white backgrounds
- Dark text on dark backgrounds
- Invisible borders
- Incorrect input backgrounds
- Charts with unreadable legends
- Tooltips using the wrong theme
- Dropdowns remaining Light in Dark mode
- Dialog overlays with insufficient contrast

---

# Phase 17 — Testing

Add or update tests for:

- Theme provider initialization
- Default theme resolution
- Saved theme restoration
- Light-to-Dark switching
- Dark-to-Light switching
- Header toggle placement beside language switcher
- Theme toggle accessible label
- Theme toggle tooltip
- Desktop header
- Mobile header
- Theme persistence after refresh
- Theme persistence across route navigation
- Light background rendering
- Dark FloatingLines rendering
- FloatingLines not initialized in Light mode
- No duplicate canvas creation
- Cleanup after theme switching
- Cleanup after route navigation
- Reduced-motion behavior
- WebGL fallback
- Foreground controls remain clickable
- Language switcher remains functional
- SSR and hydration behavior
- Responsive layout

Run all relevant commands:

- TypeScript checks
- ESLint
- Frontend unit tests
- Frontend integration tests
- Production frontend build
- Existing visual tests
- Existing end-to-end tests

Manually verify:

1. Theme toggle is beside the language selector.
2. Theme changes without reload.
3. Light mode is white with a subtle electric-blue tint.
4. Dark mode uses FloatingLines.
5. Refresh preserves theme.
6. Navigation preserves theme.
7. No hydration warning appears.
8. Only one canvas exists.
9. Repeated theme switching does not leak canvases.
10. Foreground buttons remain clickable.
11. Forms, menus, dialogs, and tooltips remain usable.
12. Mobile header works.
13. Reduced motion works.
14. WebGL fallback works.
15. No new browser console errors appear.
16. Production build succeeds.

Do not claim success for tests that were not run.

---

# Restrictions

- Do not create only a mockup.
- Do not create duplicate theme providers.
- Do not create duplicate theme-toggle components.
- Do not create duplicate FloatingLines components.
- Do not render the old particle animation and FloatingLines simultaneously.
- Do not render FloatingLines in Light mode.
- Do not pass unsupported props.
- Do not use `any` to bypass prop errors.
- Do not access browser APIs during SSR.
- Do not make unrelated server components client components.
- Do not maintain separate unsynchronized theme state in multiple places.
- Do not rely only on in-memory state without persistence.
- Do not block foreground pointer events.
- Do not place the canvas above interactive content.
- Do not leave animation loops running after unmount.
- Do not ignore reduced-motion preferences.
- Do not expose decorative animation to screen readers.
- Do not install duplicate `three` dependencies.
- Do not hardcode production URLs or unrelated configuration.
- Do not rewrite unrelated business logic.
- Do not remove shared particle dependencies still used elsewhere.
- Do not commit real secrets or generated caches.

---

# Required Completion Report

After completing the feature, provide:

1. Existing theme implementation found
2. Theme architecture selected
3. Theme provider files changed
4. Header files changed
5. Theme toggle component path
6. Light-mode background implementation
7. Dark-mode FloatingLines implementation
8. Existing `ParticlesBackground` replacement strategy
9. React Bits installation result
10. Actual FloatingLines prop API used
11. Dependencies added or reused
12. Theme tokens changed
13. SSR and hydration protections
14. Performance protections
15. Reduced-motion behavior
16. WebGL fallback behavior
17. Files created
18. Files modified
19. Obsolete particles code or dependencies removed
20. Tests and commands executed
21. Test and build results
22. Pre-existing failures
23. Assumptions or remaining limitations

Implement the feature completely, then stop.
