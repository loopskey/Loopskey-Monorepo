import { readFileSync } from "fs";
import { resolve } from "path";

/**
 * `AssociationMember_member_number_key` is unmanaged: Prisma cannot express a
 * partial unique index, so `prisma migrate dev` reports it as drift and offers
 * to drop it. Accepting that offer would silently let two members of one
 * association share a member number, and nothing else in the suite would fail.
 *
 * This is the guard. It reads the migration rather than a live database, so it
 * catches the index being removed from the source of truth; it cannot catch an
 * index dropped by hand in an already-migrated environment.
 */
const migration = readFileSync(
  resolve(
    __dirname,
    "../../../prisma/migrations/20260901090000_association_members_groups/migration.sql",
  ),
  "utf8",
);

const normalised = migration.replace(/\s+/g, " ");

describe("the member number partial unique index", () => {
  it("is still created by the migration", () => {
    expect(normalised).toContain(
      'CREATE UNIQUE INDEX IF NOT EXISTS "AssociationMember_member_number_key"',
    );
  });

  it("is scoped to one association", () => {
    expect(normalised).toContain(
      'ON "AssociationMember" ("associationId", "memberNumber")',
    );
  });

  it("is partial, so a member without a number never collides with another", () => {
    expect(normalised).toContain('WHERE "memberNumber" IS NOT NULL');
  });

  it("keeps the note explaining why the drift offer must be refused", () => {
    expect(migration).toMatch(/unmanaged/i);
    expect(migration).toMatch(/keep it/i);
  });
});
