import { ContentUrlNamespace, Prisma, Role } from "@prisma/client";
import { ContentUrlService } from "@contentUrl/services/content-url.service";

import type { ContentUrlKindRegistryService } from "@contentUrl/services/content-url-kind-registry.service";
import type { PrismaService } from "@prisma/prisma.service";

const ADMIN = { id: "admin-1", role: Role.ADMIN };
const INPUT = {
  kind: ContentUrlNamespace.COURSE,
  contentId: "course-1",
  retiredSlug: "risk-management-in-projects",
  expectedSlug: "risk-management-for-project-teams",
  evidence: "Original crawler id 123 matches this course",
};

const collision = () =>
  new Prisma.PrismaClientKnownRequestError("duplicate", {
    code: "P2002",
    clientVersion: "test",
  });

describe("ContentUrlService.attachRetiredSlug", () => {
  const find = jest.fn();
  const findPublishedSlug = jest.fn();
  const queryRaw = jest.fn();
  const claimFind = jest.fn();
  const claimCreate = jest.fn();
  const claimFindMany = jest.fn();
  const auditCreate = jest.fn();

  const tx = {
    $queryRaw: queryRaw,
    contentUrlClaim: { findUnique: claimFind, create: claimCreate },
    auditLog: { create: auditCreate },
  };
  const transaction = jest.fn();
  const prisma = {
    $transaction: transaction,
    contentUrlClaim: { findUnique: claimFind, findMany: claimFindMany },
  } as unknown as PrismaService;
  const kinds = {
    get: () => ({ entityType: "Course", find, findPublishedSlug }),
  } as unknown as ContentUrlKindRegistryService;
  const service = new ContentUrlService(prisma, kinds);

  beforeEach(() => {
    jest.clearAllMocks();
    transaction.mockImplementation(async (callback) => callback(tx));
    find.mockResolvedValue({
      id: "course-1",
      slug: INPUT.expectedSlug,
      deletedAt: null,
      providerId: null,
    });
    queryRaw.mockResolvedValue([{ slug: INPUT.expectedSlug }]);
    findPublishedSlug.mockResolvedValue(INPUT.expectedSlug);
    claimFind.mockResolvedValue(null);
    claimFindMany.mockResolvedValue([]);
  });

  it.each([Role.PROVIDER, Role.PROFESSIONAL])(
    "refuses a %s before touching the database",
    async (role) => {
      await expect(
        service.attachRetiredSlug({ id: "user-1", role }, INPUT),
      ).rejects.toMatchObject({
        response: { code: "CONTENT_URL_ACCESS_DENIED" },
      });
      expect(transaction).not.toHaveBeenCalled();
    },
  );

  it("writes the retired claim and its audit row in one transaction", async () => {
    await service.attachRetiredSlug(ADMIN, INPUT);

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(claimCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        namespace: ContentUrlNamespace.COURSE,
        slug: INPUT.retiredSlug,
        targetId: INPUT.contentId,
        isCurrent: false,
        retiredAt: expect.any(Date),
      }),
    });
    expect(auditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: ADMIN.id,
        action: "CONTENT_URL_ALIAS_ATTACHED",
        entityType: "Course",
        entityId: INPUT.contentId,
        metadata: expect.objectContaining({
          retiredSlug: INPUT.retiredSlug,
          currentSlug: INPUT.expectedSlug,
          evidence: INPUT.evidence,
        }),
      }),
    });
  });

  it("locks the target's current claim before checking the expected slug", async () => {
    await service.attachRetiredSlug(ADMIN, INPUT);
    const [strings] = queryRaw.mock.calls[0] as [TemplateStringsArray];
    expect(strings.join("?")).toContain("FOR UPDATE");
  });

  it("treats an existing retired claim of the same record as done", async () => {
    claimFind.mockResolvedValue({ targetId: "course-1", isCurrent: false });
    await service.attachRetiredSlug(ADMIN, INPUT);
    expect(claimCreate).not.toHaveBeenCalled();
    expect(auditCreate).not.toHaveBeenCalled();
  });

  it.each([
    [
      "another record's claim",
      () =>
        claimFind.mockResolvedValue({ targetId: "course-2", isCurrent: false }),
      "CONTENT_URL_SLUG_TAKEN",
    ],
    [
      "a stale expected slug",
      () => queryRaw.mockResolvedValue([{ slug: "renamed-meanwhile" }]),
      "CONTENT_URL_VERSION_CONFLICT",
    ],
    [
      "a hidden target",
      () => findPublishedSlug.mockResolvedValue(null),
      "CONTENT_URL_TARGET_NOT_PUBLIC",
    ],
    [
      "a deleted target",
      () =>
        find.mockResolvedValue({
          id: "course-1",
          slug: INPUT.expectedSlug,
          deletedAt: new Date(),
          providerId: null,
        }),
      "CONTENT_URL_NOT_FOUND",
    ],
  ])("refuses %s and writes nothing", async (_, arrange, code) => {
    arrange();
    await expect(service.attachRetiredSlug(ADMIN, INPUT)).rejects.toMatchObject(
      { response: { code } },
    );
    expect(claimCreate).not.toHaveBeenCalled();
    expect(auditCreate).not.toHaveBeenCalled();
  });

  it("refuses the record's current slug and a malformed slug", async () => {
    for (const retiredSlug of [INPUT.expectedSlug, "Not A Slug!"])
      await expect(
        service.attachRetiredSlug(ADMIN, { ...INPUT, retiredSlug }),
      ).rejects.toMatchObject({
        response: { code: "CONTENT_URL_INVALID_SLUG" },
      });
    expect(claimCreate).not.toHaveBeenCalled();
  });

  it("converges when a concurrent identical request won the unique index", async () => {
    transaction.mockRejectedValueOnce(collision());
    claimFind.mockResolvedValue({ targetId: "course-1", isCurrent: false });
    await expect(
      service.attachRetiredSlug(ADMIN, INPUT),
    ).resolves.toBeDefined();
  });

  it("reports a lost race to another record as taken", async () => {
    transaction.mockRejectedValueOnce(collision());
    claimFind.mockResolvedValue({ targetId: "course-2", isCurrent: true });
    await expect(service.attachRetiredSlug(ADMIN, INPUT)).rejects.toMatchObject(
      { response: { code: "CONTENT_URL_SLUG_TAKEN" } },
    );
  });
});
