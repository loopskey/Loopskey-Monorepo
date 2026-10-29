# svg-only-covers-and-compact-card

- Scope: `front`
- Model: `Standard development — UI rendering change; GraphQL documents only lose card-only imageUrl selections, the API schema is untouched`
- Branch: `feature/svg-only-covers-and-compact-card`
- Base: `38872b45`
- Status: `Submitted`

## Acceptance

- [x] Every card, thumbnail and roadmap cover renders the LoopsKey category SVG; provider `imageUrl` is never rendered or requested for them.
- [x] The category and level pills share one row; the rating moved to the meta row; card height dropped (427 to 421 px at 280 px wide) and long categories no longer truncate.
- [x] Fragments shared with SEO, structured data and editors keep `imageUrl`.

## Verification

- `npx tsc --noEmit` (apps/front) — pass
- `eslint` on changed files, `npm run check-i18n`, i18n public slice check — pass
- `npx vitest run` (apps/front) — pass (19 tests)
- Browser check against the local GraphQL stub at 360, 768 and 1536 px — pass

## Submission

- Commit: 65eb8af9
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/335
- CI: first run failed the public JavaScript ceiling check on /contact (200.4 KiB vs the 200 KiB target; the bundler split the shared shell into one more chunk). The cover now renders through next/image (unoptimized SVG), which restores the chunking: /contact 199.4 KiB, same as develop.
