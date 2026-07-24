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

  // The exact boundary, stated in UTC: EXPIRED below today, EXPIRING_SOON for
  // today through today+90 inclusive, ACTIVE from today+91 onwards.
  it.each([
    [-1, CertificateStatus.EXPIRED],
    [0, CertificateStatus.EXPIRING_SOON],
    [1, CertificateStatus.EXPIRING_SOON],
    [7, CertificateStatus.EXPIRING_SOON],
    [89, CertificateStatus.EXPIRING_SOON],
    [90, CertificateStatus.EXPIRING_SOON],
    [91, CertificateStatus.ACTIVE],
  ])("resolves an expiry %i day(s) from today as %s", (days, expected) => {
    expect(computeCertificateStatus(daysFromNow(days), NOW)).toBe(expected);
  });
});

/**
 * The displayed status is derived from a UTC-day-normalised expiry while the
 * database filter compares the raw `validUntil` timestamp against day-aligned
 * bounds. The two must agree for every offset and every time of day, or a
 * certificate could be listed under a status its own badge contradicts.
 */
describe("status filter and derived status agree", () => {
  const matchesWhere = (
    where: ReturnType<typeof certificateStatusWhere>,
    validUntil: Date,
  ): boolean => {
    if (where.OR) {
      const [, beyond] = where.OR as [unknown, { validUntil: { gte: Date } }];
      return validUntil.getTime() >= beyond.validUntil.gte.getTime();
    }
    const range = where.validUntil as { lt?: Date; gte?: Date };
    if (range.gte && validUntil.getTime() < range.gte.getTime()) return false;
    if (range.lt && validUntil.getTime() >= range.lt.getTime()) return false;
    return true;
  };

  const OFFSETS = [-1, 0, 1, 7, 89, 90, 91];
  const TIMES_OF_DAY_MS = [
    0,
    1 * 60 * 1000,
    12 * 60 * 60 * 1000,
    24 * 60 * 60 * 1000 - 1,
  ];

  it.each(OFFSETS)(
    "puts an expiry %i day(s) out in exactly one status bucket, at any time of day",
    (days) => {
      for (const timeOfDay of TIMES_OF_DAY_MS) {
        const validUntil = new Date(daysFromNow(days).getTime() + timeOfDay);
        const derived = computeCertificateStatus(validUntil, NOW);

        const buckets = [
          CertificateStatus.EXPIRED,
          CertificateStatus.EXPIRING_SOON,
          CertificateStatus.ACTIVE,
        ].filter((status) =>
          matchesWhere(certificateStatusWhere(status, NOW), validUntil),
        );

        expect(buckets).toEqual([derived]);
      }
    },
  );
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
      {
        validUntil: { gte: new Date(Date.UTC(2026, 6, 24) + 91 * MS_PER_DAY) },
      },
    ]);
  });
});
