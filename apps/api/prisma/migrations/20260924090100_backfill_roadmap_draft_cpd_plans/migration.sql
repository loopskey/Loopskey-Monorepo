-- Data-only migration, no schema change: CPDPlanStatus.DRAFT already exists.
-- The roadmap coach used to create its CPD-tracking plan as ACTIVE, so every
-- roadmap draft's CPD setup silently became a personal requirement, often a
-- duplicate of the association requirement for the same certification. Move
-- the ones that were never confirmed by the professional back to DRAFT: a
-- plan referenced only by a roadmap draft, with no logged activity against
-- it, was never explicitly kept as a requirement. A plan that already has
-- activities stays ACTIVE, because the professional has been using it.
UPDATE "CPDPlan" p
SET status = 'DRAFT'
WHERE p.status = 'ACTIVE'
  AND EXISTS (SELECT 1 FROM "RoadmapDraft" d WHERE d."cpdPlanId" = p.id)
  AND NOT EXISTS (SELECT 1 FROM "PDUActivity" a WHERE a."cpdPlanId" = p.id);
