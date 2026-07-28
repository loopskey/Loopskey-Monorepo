import {
  DOCUMENT_MIME_EXTENSIONS,
  DOCUMENT_MIME_TYPES,
  PLATFORM_ROLES,
  PLATFORM_ROLE_VALUES,
} from "@loopskey/api-contracts";
import { Role } from "@prisma/client";

/**
 * `@loopskey/api-contracts` must stay framework-free, so it cannot import
 * `@prisma/client` and re-export the canonical enums. That makes a handful of
 * its values a deliberate second source of truth.
 *
 * These tests are what makes that safe: they run in `apps/api`, where Prisma is
 * available, and fail if the two ever diverge. If one fails, the contract
 * package is wrong — Prisma wins.
 */
describe("api-contracts drift", () => {
  describe("PLATFORM_ROLES vs the Prisma Role enum", () => {
    it("has exactly the same set of values", () => {
      expect([...PLATFORM_ROLE_VALUES].sort()).toEqual(
        Object.values(Role).sort(),
      );
    });

    it("maps each key to the matching Prisma member", () => {
      expect(PLATFORM_ROLES.PROFESSIONAL).toBe(Role.PROFESSIONAL);
      expect(PLATFORM_ROLES.PROVIDER).toBe(Role.PROVIDER);
      expect(PLATFORM_ROLES.ORGANIZATION).toBe(Role.ORGANIZATION);
      expect(PLATFORM_ROLES.ADMIN).toBe(Role.ADMIN);
    });
  });

  describe("upload MIME derivation", () => {
    it("derives the flat type list from the canonical map", () => {
      expect([...DOCUMENT_MIME_TYPES].sort()).toEqual(
        Object.keys(DOCUMENT_MIME_EXTENSIONS).sort(),
      );
    });

    it("keeps the extension map and the flat list describing one set", () => {
      // The browser filters on MIME type while the API pairs MIME against
      // extension. If these drift, one side accepts what the other refuses.
      for (const mime of DOCUMENT_MIME_TYPES) {
        expect(
          DOCUMENT_MIME_EXTENSIONS[
            mime as keyof typeof DOCUMENT_MIME_EXTENSIONS
          ],
        ).toBeDefined();
      }
    });
  });
});
