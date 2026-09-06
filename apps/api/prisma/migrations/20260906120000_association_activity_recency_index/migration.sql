-- Recent activity on the association overview reads attributions newest first
-- within an association, which reaches them through their assignment.
CREATE INDEX IF NOT EXISTS "AssociationCreditAttribution_assignmentId_createdAt_idx"
    ON "AssociationCreditAttribution"("assignmentId", "createdAt");
