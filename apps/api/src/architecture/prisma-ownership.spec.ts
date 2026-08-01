import { BOUNDARY_EXCEPTIONS } from "./boundary-exceptions";
import {
  collectForeignPrismaAccesses,
  collectForeignPrismaAccessesFromSource,
} from "./architecture-test-utils";

const persistenceExceptions = BOUNDARY_EXCEPTIONS.filter(
  (exception) => exception.kind !== "import",
);

describe("Prisma ownership enforcement", () => {
  const accesses = collectForeignPrismaAccesses();

  it("blocks foreign model access that has no recorded exception", () => {
    const undocumented = accesses.filter(
      (access) =>
        !persistenceExceptions.some(
          (exception) =>
            exception.source === access.source &&
            exception.target === access.target &&
            (exception.files as readonly string[]).includes(access.file) &&
            (exception.models as readonly string[]).includes(access.model),
        ),
    );

    expect(undocumented).toEqual([]);
  });

  it.each([
    ["client alias", "const db = this.prisma; db.user.findMany()"],
    [
      "alias chain",
      "const db = this.prisma; const next = db; next.user.findMany()",
    ],
    ["indexed delegate", 'this.prisma["user"].findMany()'],
    [
      "destructured delegate",
      "const { user: accounts } = this.prisma; accounts.findMany()",
    ],
    [
      "transaction client",
      "this.prisma.$transaction(async (tx) => tx.user.findMany())",
    ],
  ])("detects foreign access through a %s", (_name, source) => {
    expect(
      collectForeignPrismaAccessesFromSource(
        "apps/api/src/modules/course/services/example.ts",
        source,
        "learning-catalog",
      ).map((access) => access.model),
    ).toContain("User");
  });
});
