# PR #315 develop integration

Integration base: `66ce868e69c6b9e421ea69bd521da2ce329b0a80`.

The conflict resolution preserves develop's new logo geometry and Learning Shelf, the PR's localized logo name and small-text contrast correction, all new brand tokens, and the feature-history entries from both branches. The removed carousel stays removed. Public translation slices were regenerated.

Frontend lint, type checking and `next build --webpack` passed. The accessibility, performance-lab and fixture-API harness self-tests passed. No API, schema, package-lock or workflow change differs from develop.

`pr315-integration.json` records 14 states with axe-core 4.10.3 through Playwright: home, catalog and missing pages in English and French at 360x740 and 1350x940, plus each mobile home with its navigation open. Reduced motion was enabled. All 14 states have zero axe violations, one main landmark, one H1 and no horizontal overflow. Missing pages return 404; other states return 200.

Browser interactions additionally checked the home in both languages at widths 360, 640 and 1350: localized logo names, the new 567x193 intrinsic logo geometry with 40/44px rendered heights, Learning Shelf controls, skip-link focus, and Escape closing the mobile menu with focus restored. Both missing pages have a localized catalog recovery link.

Local environment: Windows, Node 24.18.0, Next 16.4.0, deterministic fixture API. Turbopack rejected dependency junctions outside the isolated worktree root, so the local build used Webpack. Standalone tracing warned about those shared dependencies; deployment packaging was not verified locally. The CLI accessibility harness timed out at `Page.enable`, so the measurements use Playwright with the same axe version and tag selection instead.

`bundle-report --check-targets --check-ceilings` returned zero on the Webpack build, but classified every route's entry files as dynamic chunks and assigned all routes the same 133.4 KiB. This result does not verify the Turbopack route budgets. CI's ordinary build and budget gate remain authoritative; no budget or build configuration was changed.

The 2026-10-19 reports remain historical evidence against the earlier base. This targeted integration check is not a repeat of that entire matrix or a complete accessibility assessment.
