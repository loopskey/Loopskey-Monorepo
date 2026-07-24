-- Certificate index tuning.
-- Certificate reads are always scoped to the authenticated owner first, so the
-- standalone title/issuer btree indexes could never serve the `contains`
-- (ILIKE) search, and the standalone validUntil index was redundant with the
-- owner filter. Replaced by a composite that matches the real query shape:
-- WHERE "userId" = $1 AND "validUntil" <range>  (status filter + summary counts).

-- DropIndex
DROP INDEX "Certificate_issuer_idx";

-- DropIndex
DROP INDEX "Certificate_title_idx";

-- DropIndex
DROP INDEX "Certificate_validUntil_idx";

-- CreateIndex
CREATE INDEX "Certificate_userId_validUntil_idx" ON "Certificate"("userId", "validUntil");
