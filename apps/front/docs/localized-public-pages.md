# Localized public pages

How the URL decides the language of a public page, when a language variant
exists, and what the API and the sitemap guarantee about it. Read this before
adding a public route, a public link or a catalogue field.

## URL contract

| URL | Meaning |
| --- | --- |
| `/about`, `/content`, `/courses/<slug>` | English, the existing canonical URLs |
| `/fr`, `/fr/about`, `/fr/courses/<slug>` | French variant of the same page |
| `/en`, `/en/...` | Permanent redirect (308) to the unprefixed path |
| `/fr/dashboard`, `/fr/auth/...`, `/fr/onboarding/...` | 404: private areas are never localized |

Language is chosen by the URL alone. A cookie, `localStorage`, the browser locale
or an IP never redirects a public request. The routes live under one
`app/[locale]` segment, so there is a single root layout that sets
`<html lang>` on the server. `next.config.ts` redirects `/en/...` and rewrites
every other unprefixed path to `/en/...` internally; `/api`, `/sitemaps` and
files with an extension are left alone. Unknown URLs reach
`[locale]/[...missing]`, which renders the branded 404.

`proxy.ts` at the app root is not involved in locale routing.

## Language of the page

- `app/[locale]/(localized)` mounts a route-locked `LanguageProvider`: the
  language and dictionary come from the route, so hydration cannot change them
  and `localStorage` is neither read nor written there.
- `app/[locale]/(app)` (auth, dashboards, onboarding) keeps the stored
  preference. It exists only for the English locale.
- The French dictionary reaches the client only on French routes, through
  `FrenchRouteProvider`; English pages do not load it.
- Public links use `@elements/localized-link`, which prefixes `/fr` on French
  routes. A link whose target has no French variant must not use it (catalogue
  cards use plain links with a computed `href`).
- The header shows real `EN`/`FR` links that keep the query string. Detail pages
  show them inside the page, because only the page knows which variants exist.

## When a variant exists

The API answers `availableLocales` and `contentLanguage` on every public reader
that is given `locale`.

| Source language (`sourceLanguage`) | English translation | French translation | Unprefixed URL | `/fr` URL |
| --- | --- | --- | --- | --- |
| `en` | none | none | original | 404 |
| `en` | none | published | original | translation |
| unknown | none | published | original | translation |
| `fr` | none | none | original (French) | 404 |
| `fr` | published | none | English translation | original (French) |
| any | published | published | English translation | French translation |

Rules behind the table:

- `sourceLanguage` is trusted only as `en`, `fr` or a regional form such as
  `fr-CA`. Anything else is unknown, and an unknown language is never
  advertised as English or French.
- A translation is public only while it is published and its parent is public.
  Withdrawing or deleting the parent removes every variant.
- `hreflang` alternates and sitemap entries are emitted only when the French
  variant exists. An English alternate is emitted only when an English body
  exists. `x-default` always points at the unprefixed URL.
- A missing French detail variant is a 404 with `noindex`. The 404 page offers a
  link to the original unprefixed URL.
- Episodes, videos and curriculum text keep their original language. French
  pages say so.
- Catalogue search matches the original text, not translations.

## Translations

Each catalogue domain owns one translation table (`CourseTranslation`,
`EventTranslation`, `PodcastTranslation`, `YouTubeChannelTranslation`) with one
row per parent and locale, a version and a publication flag. A database check
refuses a published row with a blank title or description.

- Management operations: `<kind>Translations`, `save<Kind>Translation` and
  `set<Kind>TranslationPublication`, for the owning provider or an
  administrator. A save or a publication carries `expectedVersion`; a stale
  version fails with `CONTENT_TRANSLATION_VERSION_CONFLICT`, an unfinished
  translation with `CONTENT_TRANSLATION_INCOMPLETE`.
- A course translation must carry translated `learnings` and `requirements`
  whenever the original has them.
- Saving or publishing a published translation moves the parent's
  `publicContentUpdatedAt` in the same transaction, so the sitemap `lastmod`
  and the 300-second freshness bound of `public-discovery.md` apply unchanged.
- The provider dashboard exposes the editor for events only, because courses,
  podcasts and channels have no authenticated editor in the product yet.

## Sitemap

Every shard entry for a page with a French variant is written twice, once per
URL, each carrying the full `xhtml:link` alternate set. The static shard lists
every static page in both languages. A shard holds at most 25,000 catalogue rows
so that two URLs per row stay under the 50,000-URL limit.
