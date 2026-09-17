-- The Requirements tab's search box already filters via a Prisma
-- `name: { contains, mode: "insensitive" }` clause (association-requirement
-- .service.ts#list), which compiles to `ILIKE '%term%'`. No btree index can
-- serve that, so it was running a sequential scan over AssociationRequirement.
--
-- CONCURRENTLY is deliberately absent: Prisma runs a migration inside a
-- transaction, which forbids it. On a large table, build the index out of
-- band with CREATE INDEX CONCURRENTLY and let the IF NOT EXISTS here find it.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "AssociationRequirement_name_trgm_idx"
ON "AssociationRequirement" USING GIN ("name" gin_trgm_ops);
