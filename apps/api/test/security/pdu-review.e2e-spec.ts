import { PDUStatus, Role } from "@prisma/client";
import { SecurityApp, bootSecurityApp, dataOf } from "../setup/security";
import { errorCode, graphql, seedUser, signIn } from "../setup/security";
import { suiteScope } from "../setup/concurrency";
import {
  PROFESSIONAL_COMPLIANCE_API,
  ProfessionalComplianceApi,
} from "@professional/public/professional-compliance-api";

const scope = suiteScope("secpdu");

const UPDATE = `mutation($input: UpdatePduActivityInput!) {
  updateProfessionalPduActivity(input: $input) { id status pdus }
}`;

describe("PDU review status (security e2e)", () => {
  let ctx: SecurityApp;
  let ownerId: string;
  let ownerCookies: string[];
  let strangerCookies: string[];
  let providerCookies: string[];
  let compliance: ProfessionalComplianceApi;

  const plant = (status: PDUStatus) =>
    ctx.prisma.pDUActivity.create({
      data: {
        userId: ownerId,
        title: "Reviewed learning",
        category: "TECHNICAL",
        pdus: 10,
        date: new Date(),
        status,
        reviewNote:
          status === PDUStatus.REJECTED ? "Unreadable evidence" : null,
      },
    });

  const statusOf = async (id: string) =>
    (
      await ctx.prisma.pDUActivity.findUniqueOrThrow({
        where: { id },
        select: { status: true },
      })
    ).status;

  beforeAll(async () => {
    ctx = await bootSecurityApp();
    compliance = ctx.app.get<ProfessionalComplianceApi>(
      PROFESSIONAL_COMPLIANCE_API,
    );
    await scope.cleanup(ctx.prisma);
    const owner = await seedUser(ctx.prisma, scope.email("owner"));
    ownerId = owner.id;
    const strangerEmail = scope.email("stranger");
    const providerEmail = scope.email("provider");
    await seedUser(ctx.prisma, strangerEmail);
    await seedUser(ctx.prisma, providerEmail, { role: Role.PROVIDER });
    ownerCookies = await signIn(ctx.app, owner.email!);
    strangerCookies = await signIn(ctx.app, strangerEmail);
    providerCookies = await signIn(ctx.app, providerEmail);
  }, 120_000);

  afterAll(async () => {
    if (ctx) await scope.cleanup(ctx.prisma);
    await ctx?.app.close();
  }, 60_000);

  it.each([PDUStatus.APPROVED, PDUStatus.PENDING, PDUStatus.REJECTED])(
    "does not accept a client-supplied status (%s)",
    async (status) => {
      const activity = await plant(PDUStatus.REJECTED);
      const response = await graphql(
        ctx.app,
        UPDATE,
        { input: { activityId: activity.id, status } },
        ownerCookies,
      );
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeDefined();
      expect(await statusOf(activity.id)).toBe(PDUStatus.REJECTED);
    },
  );

  it.each([PDUStatus.APPROVED, PDUStatus.REJECTED])(
    "sends an edited %s activity back for review",
    async (status) => {
      const activity = await plant(status);
      const response = await graphql(
        ctx.app,
        UPDATE,
        { input: { activityId: activity.id, pdus: 40 } },
        ownerCookies,
      );
      expect(dataOf(response, "updateProfessionalPduActivity")).toMatchObject({
        status: PDUStatus.PENDING,
        pdus: 40,
      });
      const stored = await ctx.prisma.pDUActivity.findUniqueOrThrow({
        where: { id: activity.id },
      });
      expect(stored.reviewNote).toBeNull();
    },
  );

  it("keeps a pending activity pending when it is edited", async () => {
    const activity = await plant(PDUStatus.PENDING);
    await graphql(
      ctx.app,
      UPDATE,
      { input: { activityId: activity.id, pdus: 12 } },
      ownerCookies,
    );
    expect(await statusOf(activity.id)).toBe(PDUStatus.PENDING);
  });

  it("does not let another professional or a provider touch the activity", async () => {
    const activity = await plant(PDUStatus.REJECTED);
    for (const cookies of [strangerCookies, providerCookies]) {
      const response = await graphql(
        ctx.app,
        UPDATE,
        { input: { activityId: activity.id, pdus: 99 } },
        cookies,
      );
      expect(response.body.data).toBeFalsy();
      expect(errorCode(response)).toBeDefined();
    }
    const stored = await ctx.prisma.pDUActivity.findUniqueOrThrow({
      where: { id: activity.id },
    });
    expect(stored).toMatchObject({ status: PDUStatus.REJECTED, pdus: 10 });
  });

  it("still lets the review path settle a pending activity, once", async () => {
    const activity = await plant(PDUStatus.PENDING);
    const wrongOwner = await compliance.settleReview({
      activityId: activity.id,
      ownerUserIds: ["someone-else"],
      approve: true,
    });
    expect(wrongOwner).toBe(false);
    expect(await statusOf(activity.id)).toBe(PDUStatus.PENDING);
    const settled = await compliance.settleReview({
      activityId: activity.id,
      ownerUserIds: [ownerId],
      approve: true,
    });
    expect(settled).toBe(true);
    expect(await statusOf(activity.id)).toBe(PDUStatus.APPROVED);
    const again = await compliance.settleReview({
      activityId: activity.id,
      ownerUserIds: [ownerId],
      approve: false,
    });
    expect(again).toBe(false);
    expect(await statusOf(activity.id)).toBe(PDUStatus.APPROVED);
  });
});
