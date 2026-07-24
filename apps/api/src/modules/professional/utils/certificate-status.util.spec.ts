import { CertificateStatus } from "@prisma/client";

import {
  CERTIFICATE_EXPIRING_SOON_WINDOW_DAYS,
  certificateStatusWhere,
  computeCertificateStatus,
  resolveCertificateStatus,
} from "./certificate-status.util";

const NOW = new Date("2026-07-24T12:00:00.000Z");
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const daysFromNow = (days: number) =>
  new Date(Date.UTC(2026, 6, 24) + days * MS_PER_DAY);

describe("computeCertificateStatus", () => {
  it("returns ACTIVE when there is no expiry date", () => {
    expect(computeCertificateStatus(null, NOW)).toBe(CertificateStatus.ACTIVE);
  });

  it("returns EXPIRED when the expiry date is before today", () => {
    expect(computeCertificateStatus(daysFromNow(-1), NOW)).toBe(
      CertificateStatus.EXPIRED,
    );
  });

  it("returns EXPIRING_SOON when the expiry date is today", () => {
    expect(computeCertificateStatus(daysFromNow(0), NOW)).toBe(
      CertificateStatus.EXPIRING_SOON,
    );
  });

  it("returns EXPIRING_SOON within the 90-day window", () => {
    expect(computeCertificateStatus(daysFromNow(30), NOW)).toBe(
      CertificateStatus.EXPIRING_SOON,
    );
  });

  it("treats exactly 90 days as the EXPIRING_SOON boundary", () => {
    expect(CERTIFICATE_EXPIRING_SOON_WINDOW_DAYS).toBe(90);
    expect(computeCertificateStatus(daysFromNow(90), NOW)).toBe(
      CertificateStatus.EXPIRING_SOON,
    );
  });

  it("returns ACTIVE just past the 90-day window", () => {
    expect(computeCertificateStatus(daysFromNow(91), NOW)).toBe(
      CertificateStatus.ACTIVE,
    );
  });

  it("ignores the time-of-day, using UTC day boundaries", () => {
    // Expiry earlier today (00:01Z) is still EXPIRING_SOON, not EXPIRED.
    const earlyToday = new Date("2026-07-24T00:01:00.000Z");
    expect(computeCertificateStatus(earlyToday, NOW)).toBe(
      CertificateStatus.EXPIRING_SOON,
    );
  });
});

describe("resolveCertificateStatus", () => {
  it("honours a stored REVOKED status over the derived value", () => {
    expect(
      resolveCertificateStatus(
        CertificateStatus.REVOKED,
        daysFromNow(365),
        NOW,
      ),
    ).toBe(CertificateStatus.REVOKED);
  });

  it("derives the status for any non-revoked stored value", () => {
    expect(
      resolveCertificateStatus(CertificateStatus.ACTIVE, daysFromNow(-5), NOW),
    ).toBe(CertificateStatus.EXPIRED);
  });
});

describe("certificateStatusWhere", () => {
  it("filters EXPIRED to non-null dates before today", () => {
    const where = certificateStatusWhere(CertificateStatus.EXPIRED, NOW);
    expect(where.validUntil).toEqual({
      not: null,
      lt: new Date(Date.UTC(2026, 6, 24)),
    });
  });

  it("filters EXPIRING_SOON to the [today, today+91) range", () => {
    const where = certificateStatusWhere(CertificateStatus.EXPIRING_SOON, NOW);
    expect(where.validUntil).toEqual({
      gte: new Date(Date.UTC(2026, 6, 24)),
      lt: new Date(Date.UTC(2026, 6, 24) + 91 * MS_PER_DAY),
    });
  });

  it("filters ACTIVE to null or beyond the window", () => {
    const where = certificateStatusWhere(CertificateStatus.ACTIVE, NOW);
    expect(where.OR).toEqual([
      { validUntil: null },
      { validUntil: { gte: new Date(Date.UTC(2026, 6, 24) + 91 * MS_PER_DAY) } },
    ]);
  });
});
