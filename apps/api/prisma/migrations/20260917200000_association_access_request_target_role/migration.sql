-- Which role approving an OrganizationAccessRequest provisions. Written by
-- hand instead of `prisma migrate dev` because this repo's Postgres has
-- trigram GIN indexes and a search materialized view that Prisma cannot
-- express declaratively (see the earlier catalog_trigram_indexes and
-- association_directory_search migrations); an auto-diffed migration against
-- them tries to drop every one of those indexes right back out.
ALTER TABLE "OrganizationAccessRequest" ADD COLUMN "targetRole" "Role" NOT NULL DEFAULT 'ORGANIZATION';

CREATE INDEX "OrganizationAccessRequest_targetRole_idx" ON "OrganizationAccessRequest"("targetRole");
