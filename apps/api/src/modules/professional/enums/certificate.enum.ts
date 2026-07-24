import { registerEnumType } from "@nestjs/graphql";

export enum CertificateStatusFilter {
  ACTIVE = "ACTIVE",
  EXPIRING_SOON = "EXPIRING_SOON",
  EXPIRED = "EXPIRED",
}

export enum CertificateSort {
  RECENT = "RECENT",
  OLDEST = "OLDEST",
  EXPIRY_SOONEST = "EXPIRY_SOONEST",
  NAME = "NAME",
}

registerEnumType(CertificateStatusFilter, { name: "CertificateStatusFilter" });
registerEnumType(CertificateSort, { name: "CertificateSort" });
