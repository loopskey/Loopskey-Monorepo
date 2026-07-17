-- Add CPE (Continuing Professional Education) credit type, used by certifications
-- such as CISSP (ISC2). IF NOT EXISTS keeps this safe on databases where the value
-- was already introduced out of band.
ALTER TYPE "CreditType" ADD VALUE IF NOT EXISTS 'CPE';
