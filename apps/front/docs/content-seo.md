# Editorial search and sharing controls

How editors adjust the search title, search description and share image of a
catalogue page, and what the public site does with the result. Read this before
changing page metadata, the social card route or the sitemap.

## What an editor can set

Per content (course, event, podcast, YouTube channel) and per language (English
or French), all optional:

| Field | Bound | Used for |
| --- | --- | --- |
| Search title | 200 characters | `<title>`, Open Graph and Twitter title |
| Search description | 500 characters | meta description and share description |
| Share image | one uploaded image | the social card, with its alt text |
| Image description | 300 characters | `og:image:alt` |

An empty or blank value clears the override, and an omitted field keeps it.
Whitespace is collapsed and control characters are removed; markup is stored as
plain text and always escaped on output. The bounds live in
`CONTENT_SEO_LIMITS` in `@loopskey/api-contracts/validation` and are enforced by
the API, the form and a database CHECK constraint.

The generated metadata stays the default. A French override never creates a
French page: the French page exists only when feature 06's published, complete
translation does.

## Who can do what

| Actor | Allowed |
| --- | --- |
| Provider | Edit the text and image of content they own |
| Administrator | Edit any content, and hide or restore indexing |
| Anyone else | Nothing; a public visitor reads only the effective values |

Ownership comes from the session and the record, never from submitted input.
There is no field for a canonical URL or robots directive: a canonical is always
built from the route policy, and unknown input fields are rejected by GraphQL.

## Editing

The provider's *My events* table has a **Search and sharing** dialog, and the
administrator dashboard has a **Search visibility** tab that finds a published
page by kind and slug. Both open the same dialog.

- The dialog shows the generated text as the placeholder, a counter, and an
  approximate preview built from the form and the page's canonical URL. The
  preview says it is an approximation; the length hints make no claim about how
  much a search engine shows.
- Save sends the version the editor read. A stale version, or the loser of two
  simultaneous saves, gets `CONTENT_SEO_VERSION_CONFLICT` and a reload button.
- **Use generated text** empties the form; saving clears the override and the
  image.
- Only the administrator sees **Hide from search engines**.

Errors keep their meaning apart: a field problem, an image problem, a version
conflict, a permission problem and an unreachable API each show their own
message, and focus moves to the message when a save fails.

## Share images

An image is uploaded to `POST /content-social-image` (provider or administrator)
and referenced by id; there is no way to give a URL. The upload accepts JPEG,
PNG or WebP up to 2 MB, checks the file signature as well as the name and
declared type, stores it under a server-generated key, and records the uploader.
An image can be attached only by its uploader, or by an administrator editing the
uploader's content. An account can hold ten unused uploads; older unused ones are
swept when the cap is hit.

The public route `GET /content-social-image/:id` serves the file with
`nosniff` and a locked-down content security policy. The social card route
redirects to it when the page has an override, and otherwise renders the
generated card or uses the source image as before.

Clearing or replacing an image deletes the image row first. A foreign key from
every SEO row with `ON DELETE RESTRICT` makes that fail while any language of any
page still uses it, and the file is removed only when the delete succeeds.

## Hiding a page from search

`excludeFromIndex` is separate from publication. A hidden page stays published
and readable, and the API and front end then:

- answer with `robots: noindex, follow`;
- drop the `hreflang` alternates and the structured data;
- leave the sitemap, including its French and English variants.

Setting the flag again changes nothing and writes no second audit entry. It is a
moderation signal, not a way to protect confidential content. The catalogue lists
and their `ItemList` still show the page, because visitors can still read it.

## Imports and ingestion

Overrides sit in their own tables, so a source update of a page rewrites only the
source columns. An ingestion update never touches an override, its version or the
index flag, and the source description stays the page's description.

## Operations

- Audit entries record who changed which fields and the language, never the text.
- Logs carry the kind, actor id, content id, language, field names and version;
  conflicts are warnings.
- An operator clears a bad override by saving empty values, or hides the page,
  without changing the slug or publication.
- Roll out the migration and API first; the front end ignores missing fields, so a
  rollback falls back to the generated metadata.
