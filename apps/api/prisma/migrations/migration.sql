CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "Course_title_trgm_idx"
ON "Course" USING GIN ("title" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Course_description_trgm_idx"
ON "Course" USING GIN ("description" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Event_title_trgm_idx"
ON "Event" USING GIN ("title" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Event_description_trgm_idx"
ON "Event" USING GIN ("description" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Podcast_title_trgm_idx"
ON "Podcast" USING GIN ("title" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Podcast_description_trgm_idx"
ON "Podcast" USING GIN ("description" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "YouTubeChannel_title_trgm_idx"
ON "YouTubeChannel" USING GIN ("title" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "YouTubeChannel_description_trgm_idx"
ON "YouTubeChannel" USING GIN ("description" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "User_fullName_trgm_idx"
ON "User" USING GIN ("fullName" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "User_email_trgm_idx"
ON "User" USING GIN ("email" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Organization_name_trgm_idx"
ON "Organization" USING GIN ("name" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "OrganizationAccessRequest_organizationName_trgm_idx"
ON "OrganizationAccessRequest" USING GIN ("organizationName" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "OrganizationAccessRequest_workEmail_trgm_idx"
ON "OrganizationAccessRequest" USING GIN ("workEmail" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "EventPromotionRequest_note_trgm_idx"
ON "EventPromotionRequest" USING GIN ("note" gin_trgm_ops);

DROP MATERIALIZED VIEW IF EXISTS "WishlistSearchDocument" CASCADE;

CREATE MATERIALIZED VIEW "WishlistSearchDocument" AS
SELECT
  c."id" AS "contentId",
  'COURSE'::"ContentType" AS "contentType",
  c."slug",
  c."title",
  c."description",
  c."category"::text AS "category",
  c."imageUrl",
  c."currency",
  c."isFree",
  c."price",
  c."rating",
  COALESCE(u."fullName", u."email") AS "providerName",
  CASE
    WHEN c."slug" IS NOT NULL THEN CONCAT('/courses/', c."slug")
    ELSE CONCAT('/courses/', c."id")
  END AS "url",
  LOWER(
    CONCAT_WS(
      ' ',
      c."title",
      c."description",
      c."category"::text,
      COALESCE(u."fullName", u."email"),
      c."id",
      'COURSE'
    )
  ) AS "searchText"
FROM "Course" c
LEFT JOIN "User" u ON u."id" = c."providerId"
WHERE c."deletedAt" IS NULL

UNION ALL

SELECT
  e."id" AS "contentId",
  'EVENT'::"ContentType" AS "contentType",
  e."slug",
  e."title",
  e."description",
  e."category"::text AS "category",
  e."imageUrl",
  e."currency",
  e."isFree",
  e."price",
  e."rating",
  COALESCE(u."fullName", u."email") AS "providerName",
  CASE
    WHEN e."slug" IS NOT NULL THEN CONCAT('/events/', e."slug")
    ELSE CONCAT('/events/', e."id")
  END AS "url",
  LOWER(
    CONCAT_WS(
      ' ',
      e."title",
      e."description",
      e."category"::text,
      COALESCE(u."fullName", u."email"),
      e."id",
      'EVENT'
    )
  ) AS "searchText"
FROM "Event" e
LEFT JOIN "User" u ON u."id" = e."providerId"
WHERE e."deletedAt" IS NULL

UNION ALL

SELECT
  p."id" AS "contentId",
  'PODCAST'::"ContentType" AS "contentType",
  p."slug",
  p."title",
  p."description",
  p."category"::text AS "category",
  p."imageUrl",
  NULL::text AS "currency",
  TRUE AS "isFree",
  NULL::numeric AS "price",
  p."rating",
  COALESCE(u."fullName", u."email") AS "providerName",
  CASE
    WHEN p."slug" IS NOT NULL THEN CONCAT('/podcasts/', p."slug")
    ELSE CONCAT('/podcasts/', p."id")
  END AS "url",
  LOWER(
    CONCAT_WS(
      ' ',
      p."title",
      p."description",
      p."category"::text,
      COALESCE(u."fullName", u."email"),
      p."id",
      'PODCAST'
    )
  ) AS "searchText"
FROM "Podcast" p
LEFT JOIN "User" u ON u."id" = p."providerId"
WHERE p."deletedAt" IS NULL

UNION ALL

SELECT
  y."id" AS "contentId",
  'YOUTUBE'::"ContentType" AS "contentType",
  y."slug",
  y."title",
  y."description",
  y."category"::text AS "category",
  y."imageUrl",
  NULL::text AS "currency",
  TRUE AS "isFree",
  NULL::numeric AS "price",
  y."rating",
  COALESCE(y."provider", u."fullName", u."email") AS "providerName",
  CASE
    WHEN y."slug" IS NOT NULL THEN CONCAT('/youtube/', y."slug")
    ELSE CONCAT('/youtube/', y."id")
  END AS "url",
  LOWER(
    CONCAT_WS(
      ' ',
      y."title",
      y."description",
      y."category"::text,
      COALESCE(y."provider", u."fullName", u."email"),
      y."id",
      'YOUTUBE'
    )
  ) AS "searchText"
FROM "YouTubeChannel" y
LEFT JOIN "User" u ON u."id" = y."providerId"
WHERE y."deletedAt" IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "WishlistSearchDocument_unique_idx"
ON "WishlistSearchDocument" ("contentType", "contentId");

CREATE INDEX IF NOT EXISTS "WishlistSearchDocument_searchText_trgm_idx"
ON "WishlistSearchDocument"
USING GIN ("searchText" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "WishlistSearchDocument_category_idx"
ON "WishlistSearchDocument" ("category");

CREATE INDEX IF NOT EXISTS "WishlistSearchDocument_contentType_idx"
ON "WishlistSearchDocument" ("contentType");

CREATE INDEX IF NOT EXISTS "WishlistSearchDocument_rating_idx"
ON "WishlistSearchDocument" ("rating");

CREATE INDEX IF NOT EXISTS "WishlistSearchDocument_price_idx"
ON "WishlistSearchDocument" ("price");

CREATE INDEX IF NOT EXISTS "Organization_name_trgm_idx"
ON "Organization" USING GIN ("name" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Organization_country_trgm_idx"
ON "Organization" USING GIN ("country" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Organization_industry_trgm_idx"
ON "Organization" USING GIN ("industry" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Organization_website_trgm_idx"
ON "Organization" USING GIN ("website" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Organization_description_trgm_idx"
ON "Organization" USING GIN ("description" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "User_fullName_trgm_idx"
ON "User" USING GIN ("fullName" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "User_email_trgm_idx"
ON "User" USING GIN ("email" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "OrganizationMember_jobRole_trgm_idx"
ON "OrganizationMember" USING GIN ("jobRole" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "OrganizationMember_notes_trgm_idx"
ON "OrganizationMember" USING GIN ("notes" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "OrganizationDepartment_title_trgm_idx"
ON "OrganizationDepartment" USING GIN ("title" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Organization_deletedAt_createdAt_idx"
ON "Organization" ("deletedAt", "createdAt");

CREATE INDEX IF NOT EXISTS "OrganizationMember_org_status_createdAt_idx"
ON "OrganizationMember" ("organizationId", "status", "createdAt");

CREATE INDEX IF NOT EXISTS "OrganizationMember_org_department_createdAt_idx"
ON "OrganizationMember" ("organizationId", "departmentId", "createdAt");