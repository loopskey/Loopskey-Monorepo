import { CertificateStatus, Prisma } from "@prisma/client";

export const CERTIFICATE_EXPIRING_SOON_WINDOW_DAYS = 90;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type CertificateExpiryStatus =
  | typeof CertificateStatus.ACTIVE
  | typeof CertificateStatus.EXPIRING_SOON
  | typeof CertificateStatus.EXPIRED;

export const startOfUtcDay = (date: Date): Date =>
  new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );

export const computeCertificateStatus = (
  validUntil: Date | null | undefined,
  now: Date = new Date(),
): CertificateExpiryStatus => {
  if (!validUntil) return CertificateStatus.ACTIVE;
  const today = startOfUtcDay(now).getTime();
  const expiry = startOfUtcDay(validUntil).getTime();
  if (expiry < today) return CertificateStatus.EXPIRED;
  const soonBoundary =
    today + CERTIFICATE_EXPIRING_SOON_WINDOW_DAYS * MS_PER_DAY;
  if (expiry <= soonBoundary) return CertificateStatus.EXPIRING_SOON;
  return CertificateStatus.ACTIVE;
};

export const resolveCertificateStatus = (
  stored: CertificateStatus | null | undefined,
  validUntil: Date | null | undefined,
  now: Date = new Date(),
): CertificateStatus => {
  if (stored === CertificateStatus.REVOKED) return CertificateStatus.REVOKED;
  return computeCertificateStatus(validUntil, now);
};

export const certificateStatusWhere = (
  status: CertificateExpiryStatus,
  now: Date = new Date(),
): Prisma.CertificateWhereInput => {
  const today = startOfUtcDay(now);
  const afterSoonWindow = new Date(
    today.getTime() + (CERTIFICATE_EXPIRING_SOON_WINDOW_DAYS + 1) * MS_PER_DAY,
  );

  switch (status) {
    case CertificateStatus.EXPIRED:
      return { validUntil: { not: null, lt: today } };
    case CertificateStatus.EXPIRING_SOON:
      return { validUntil: { gte: today, lt: afterSoonWindow } };
    case CertificateStatus.ACTIVE:
      return {
        OR: [{ validUntil: null }, { validUntil: { gte: afterSoonWindow } }],
      };
  }
};
