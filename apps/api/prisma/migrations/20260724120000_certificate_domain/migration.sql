-- AlterEnum
ALTER TYPE "CertificateStatus" ADD VALUE 'EXPIRING_SOON';

-- AlterTable
ALTER TABLE "Certificate" ADD COLUMN     "certificateNumber" TEXT,
ADD COLUMN     "cpdPlanId" TEXT;

-- CreateTable
CREATE TABLE "CertificateFile" (
    "id" TEXT NOT NULL,
    "certificateId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CertificateFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CertificateFile_certificateId_idx" ON "CertificateFile"("certificateId");

-- CreateIndex
CREATE INDEX "CertificateFile_userId_idx" ON "CertificateFile"("userId");

-- CreateIndex
CREATE INDEX "Certificate_validUntil_idx" ON "Certificate"("validUntil");

-- CreateIndex
CREATE INDEX "Certificate_cpdPlanId_idx" ON "Certificate"("cpdPlanId");

-- CreateIndex
CREATE INDEX "Certificate_issuer_idx" ON "Certificate"("issuer");

-- CreateIndex
CREATE INDEX "Certificate_title_idx" ON "Certificate"("title");

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_cpdPlanId_fkey" FOREIGN KEY ("cpdPlanId") REFERENCES "CPDPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificateFile" ADD CONSTRAINT "CertificateFile_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "Certificate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificateFile" ADD CONSTRAINT "CertificateFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
