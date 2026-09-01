import {
  DOCUMENT_MIME_EXTENSIONS,
  DOCUMENT_MIME_TYPES,
  PLATFORM_ROLES,
  PLATFORM_ROLE_VALUES,
} from "@loopskey/api-contracts";
import { Role } from "@prisma/client";

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
      expect(PLATFORM_ROLES.ASSOCIATION).toBe(Role.ASSOCIATION);
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
