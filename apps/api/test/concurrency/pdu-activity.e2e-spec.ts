import { ContentType, CreditType, PDUCategory, Role } from "@prisma/client";
import { ProfessionalPduService } from "@professional/services/professional-pdu.service";
import { INestApplication } from "@nestjs/common";
import { PDUSource } from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { TUser } from "@common/types/user.types";
import {
  bootApp,
  fulfilled,
  rejected,
  runTogether,
  suiteScope,
} from "../setup/concurrency";

const CONTENT_ID = "concurrency-content-1";

const scope = suiteScope("pdu");

/**
 * Content-linked PDU activities are one per user per content item.
 *
 * The guard is a partial unique index, so these tests are as much about the
 * migration as about the service: they assert the row count the database is
 * left holding, which is the thing an auditor would eventually count.
 */
describe("PDU activities (concurrency e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let pdu: ProfessionalPduService;
  let user: TUser;

  const activityInput = (overrides: Record<string, unknown> = {}) => ({
    title: "Concurrency PDU",
    date: new Date("2030-02-01T10:00:00.000Z").toISOString(),
    pdus: 2,
    source: PDUSource.OTHER,
    category: PDUCategory.TECHNICAL,
    creditType: CreditType.PDU,
    reportingYear: 2030,
    providerOrganizer: "Loopskey",
    contentType: ContentType.COURSE,
    contentId: CONTENT_ID,
    ...overrides,
  });

  const contentLinkedCount = () =>
    prisma.pDUActivity.count({
      where: {
        userId: user.id,
        contentType: ContentType.COURSE,
        contentId: CONTENT_ID,
      },
    });

  beforeAll(async () => {
    ({ app, prisma } = await bootApp());
    pdu = app.get(ProfessionalPduService);
    await scope.cleanup(prisma);
    const created = await prisma.user.create({
      data: {
        email: scope.email("pdu-professional"),
        role: Role.PROFESSIONAL,
        status: "ACTIVE",
      },
    });
    user = { id: created.id, role: Role.PROFESSIONAL } as TUser;
  }, 120_000);

  afterAll(async () => {
    if (prisma) await scope.cleanup(prisma);
    await app?.close();
  }, 60_000);

  beforeEach(async () => {
    await prisma.pDUActivity.deleteMany({ where: { userId: user.id } });
  });

  it("leaves one logical activity when the same content is logged at once", async () => {
    const results = await runTogether(10, () =>
      pdu.createPduActivity(user, activityInput()),
    );

    expect(rejected(results)).toHaveLength(0);
    expect(await contentLinkedCount()).toBe(1);
  }, 60_000);

  it("converges on the last submitted values rather than failing", async () => {
    const results = await runTogether(6, (index) =>
      pdu.createPduActivity(user, activityInput({ pdus: index + 1 })),
    );

    expect(fulfilled(results)).toHaveLength(6);
    const activities = await prisma.pDUActivity.findMany({
      where: { userId: user.id },
    });
    expect(activities).toHaveLength(1);
    expect(activities[0].pdus).toBeGreaterThanOrEqual(1);
    expect(activities[0].pdus).toBeLessThanOrEqual(6);
  }, 60_000);

  it("never surfaces a raw unique violation to the caller", async () => {
    const results = await runTogether(12, () =>
      pdu.createPduActivity(user, activityInput()),
    );

    for (const failure of rejected(results))
      expect(failure.reason).not.toBeInstanceOf(
        Prisma.PrismaClientKnownRequestError,
      );
    expect(rejected(results)).toHaveLength(0);
  }, 60_000);

  it("keeps distinct content items independent", async () => {
    await runTogether(8, (index) =>
      pdu.createPduActivity(
        user,
        activityInput({ contentId: `${CONTENT_ID}-${index % 4}` }),
      ),
    );

    expect(await prisma.pDUActivity.count({ where: { userId: user.id } })).toBe(
      4,
    );
  }, 60_000);

  it("still allows many manually logged activities with no content link", async () => {
    const results = await runTogether(6, (index) =>
      pdu.createPduActivity(
        user,
        activityInput({
          contentId: undefined,
          contentType: undefined,
          title: `Manual entry ${index}`,
        }),
      ),
    );

    expect(rejected(results)).toHaveLength(0);
    expect(await prisma.pDUActivity.count({ where: { userId: user.id } })).toBe(
      6,
    );
  }, 60_000);

  it("is enforced by the database, not only by the service", async () => {
    await pdu.createPduActivity(user, activityInput());

    await expect(
      prisma.pDUActivity.create({
        data: {
          userId: user.id,
          title: "Bypassing the service",
          date: new Date("2030-02-01T10:00:00.000Z"),
          pdus: 1,
          source: PDUSource.OTHER,
          category: PDUCategory.TECHNICAL,
          creditType: CreditType.PDU,
          contentType: ContentType.COURSE,
          contentId: CONTENT_ID,
        },
      }),
    ).rejects.toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
    expect(await contentLinkedCount()).toBe(1);
  }, 60_000);
});
