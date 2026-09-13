// Routes that must render without the public marketing nav, the dashboard
// sidebar, or the footer — just a brand mark and, where needed, locale and
// account access. See professional-onboarding-corrections FR1/FR2.
const FOCUSED_SHELL_ROUTE_PREFIXES = ["/onboarding"];

export const isFocusedShellRoute = (pathname: string | null | undefined) =>
  Boolean(
    pathname &&
      FOCUSED_SHELL_ROUTE_PREFIXES.some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
      ),
  );
