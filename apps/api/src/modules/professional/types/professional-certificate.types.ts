import { ProfessionalPaginationInput } from "@professional/dtos/professional-pagination.input";
import { CertificateStatusFilter } from "@professional/enums/certificate.enum";
import { CertificateSort } from "@professional/enums/certificate.enum";
import { Prisma } from "@prisma/client";

export type CertificateListParams = {
  search?: string;
  sort?: CertificateSort;
  status?: CertificateStatusFilter;
  pagination?: ProfessionalPaginationInput;
};

export const certificateInclude = {
  evidenceFiles: {
    orderBy: { createdAt: "asc" as const },
    select: {
      id: true,
      fileName: true,
      mimeType: true,
      sizeBytes: true,
      createdAt: true,
    },
  },
  cpdPlan: { select: { id: true, certificationName: true } },
} satisfies Prisma.CertificateInclude;

export type CertificateRow = Prisma.CertificateGetPayload<{
  include: typeof certificateInclude;
}>;
