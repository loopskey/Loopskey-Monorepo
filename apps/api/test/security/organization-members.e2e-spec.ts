import { OrganizationMemberStatus, Role, UserStatus } from "@prisma/client";
import { SecurityApp, bootSecurityApp, dataOf } from "../setup/security";
import { errorCode, graphql, seedUser, signIn } from "../setup/security";
import { runTogether, suiteScope } from "../setup/concurrency";

const scope = suiteScope("secorg");

const ADD_MEMBER = `mutation($input: AddOrganizationMemberInput!) {
  addOrganizationMember(input: $input) { id userId email role fullName status }
}`;
const UPDATE_MEMBER = `mutation($input: UpdateOrganizationMemberInput!) {
  updateOrganizationMember(input: $input) { id role status jobRole departmentId }
}`;

describe("Organization member management (security e2e)", () => {
  let ctx: SecurityApp;
  let ownerACookies: string[];
  let ownerBCookies: string[];
  let organizationAId: string;
  let organizationBId: string;
  let departmentBId: string;
  let memberOfAId: string;
  let memberOfBId: string;
  let memberOfAUserId: string;

  const userByEmail = (email: string) =>
    ctx.prisma.user.findUniqueOrThrow({ where: { email } });

  beforeAll(async () => {
    ctx = await bootSecurityApp();
    await scope.cleanup(ctx.prisma);
    const ownerA = await seedUser(ctx.prisma, scope.email("owner-a"), {
      role: Role.ORGANIZATION,
    });
    const ownerB = await seedUser(ctx.prisma, scope.email("owner-b"), {
      role: Role.ORGANIZATION,
    });
    const organizationA = await ctx.prisma.organization.create({
      data: { ownerId: ownerA.id, name: "Security Org A" },
    });
    const organizationB = await ctx.prisma.organization.create({
      data: { ownerId: ownerB.id, name: "Security Org B" },
    });
    organizationAId = organizationA.id;
    organizationBId = organizationB.id;
    departmentBId = (
      await ctx.prisma.organizationDepartment.create({
        data: { organizationId: organizationB.id, title: "Org B Department" },
      })
    ).id;
    const memberOfA = await seedUser(ctx.prisma, scope.email("member-a"), {
      fullName: "Member Of A",
    });
    const memberOfB = await seedUser(ctx.prisma, scope.email("member-b"), {
      fullName: "Member Of B",
    });
    memberOfAUserId = memberOfA.id;
    memberOfAId = (
      await ctx.prisma.organizationMember.create({
        data: { organizationId: organizationA.id, userId: memberOfA.id },
      })
    ).id;
    memberOfBId = (
      await ctx.prisma.organizationMember.create({
        data: { organizationId: organizationB.id, userId: memberOfB.id },
      })
    ).id;
    ownerACookies = await signIn(ctx.app, ownerA.email!);
    ownerBCookies = await signIn(ctx.app, ownerB.email!);
  }, 120_000);

  afterAll(async () => {
    if (ctx) await scope.cleanup(ctx.prisma);
    await ctx?.app.close();
  }, 60_000);

  it.each([Role.ADMIN, Role.PROVIDER, Role.ORGANIZATION, Role.ASSOCIATION])(
    "rejects a global role (%s) on the member update input",
    async (role) => {
      const response = await graphql(
        ctx.app,
        UPDATE_MEMBER,
        { input: { memberId: memberOfAId, role } },
        ownerACookies,
      );
      expect(response.body.data?.updateOrganizationMember).toBeFalsy();
      expect(response.body.errors).toBeDefined();
      const user = await ctx.prisma.user.findUniqueOrThrow({
        where: { id: memberOfAUserId },
      });
      expect(user.role).toBe(Role.PROFESSIONAL);
    },
  );

  it("still updates membership attributes", async () => {
    const response = await graphql(
      ctx.app,
      UPDATE_MEMBER,
      {
        input: {
          memberId: memberOfAId,
          jobRole: "Compliance lead",
          status: OrganizationMemberStatus.INACTIVE,
        },
      },
      ownerACookies,
    );
    expect(dataOf(response, "updateOrganizationMember")).toMatchObject({
      id: memberOfAId,
      jobRole: "Compliance lead",
      status: OrganizationMemberStatus.INACTIVE,
      role: Role.PROFESSIONAL,
    });
  });

  it("does not let organization A touch organization B's member", async () => {
    const response = await graphql(
      ctx.app,
      UPDATE_MEMBER,
      { input: { memberId: memberOfBId, jobRole: "Hijacked" } },
      ownerACookies,
    );
    expect(response.body.data?.updateOrganizationMember).toBeFalsy();
    expect(errorCode(response)).toBeDefined();
    const untouched = await ctx.prisma.organizationMember.findUniqueOrThrow({
      where: { id: memberOfBId },
    });
    expect(untouched.jobRole).toBeNull();
  });

  it("does not accept another organization's department", async () => {
    const onUpdate = await graphql(
      ctx.app,
      UPDATE_MEMBER,
      { input: { memberId: memberOfAId, departmentId: departmentBId } },
      ownerACookies,
    );
    expect(onUpdate.body.data?.updateOrganizationMember).toBeFalsy();
    const onAdd = await graphql(
      ctx.app,
      ADD_MEMBER,
      {
        input: {
          email: scope.email("cross-department"),
          fullName: "Cross Department",
          departmentId: departmentBId,
        },
      },
      ownerACookies,
    );
    expect(onAdd.body.data?.addOrganizationMember).toBeFalsy();
    const member = await ctx.prisma.organizationMember.findUniqueOrThrow({
      where: { id: memberOfAId },
    });
    expect(member.departmentId).toBeNull();
    expect(
      await ctx.prisma.user.count({
        where: { email: scope.email("cross-department") },
      }),
    ).toBe(0);
  });

  it("adds an existing professional without rewriting their profile", async () => {
    const email = scope.email("existing-professional");
    const existing = await seedUser(ctx.prisma, email, {
      fullName: "Original Name",
    });
    const response = await graphql(
      ctx.app,
      ADD_MEMBER,
      { input: { email, fullName: "Name Chosen By Organization" } },
      ownerACookies,
    );
    expect(dataOf(response, "addOrganizationMember")).toMatchObject({
      userId: existing.id,
      role: Role.PROFESSIONAL,
    });
    const after = await userByEmail(email);
    expect(after.fullName).toBe("Original Name");
    expect(after.role).toBe(Role.PROFESSIONAL);
  });

  it("creates a professional account for an unknown email", async () => {
    const email = scope.email("brand-new");
    const response = await graphql(
      ctx.app,
      ADD_MEMBER,
      { input: { email, fullName: "Brand New" } },
      ownerACookies,
    );
    expect(dataOf(response, "addOrganizationMember")).toMatchObject({
      role: Role.PROFESSIONAL,
    });
    expect(await userByEmail(email)).toMatchObject({
      role: Role.PROFESSIONAL,
      status: UserStatus.ACTIVE,
    });
  });

  it.each([Role.ADMIN, Role.PROVIDER, Role.ORGANIZATION, Role.ASSOCIATION])(
    "refuses to add an existing %s account and leaves it unchanged",
    async (role) => {
      const email = scope.email(`existing-${role.toLowerCase()}`);
      await seedUser(ctx.prisma, email, { role, fullName: "Protected Name" });
      const response = await graphql(
        ctx.app,
        ADD_MEMBER,
        { input: { email, fullName: "Overwritten By Organization" } },
        ownerACookies,
      );
      expect(response.body.data?.addOrganizationMember).toBeFalsy();
      expect(errorCode(response)).toBe("UserRoleConflict");
      const after = await userByEmail(email);
      expect(after).toMatchObject({ role, fullName: "Protected Name" });
      expect(
        await ctx.prisma.organizationMember.count({
          where: { userId: after.id },
        }),
      ).toBe(0);
    },
  );

  it("leaves a deleted account alone", async () => {
    const email = scope.email("deleted-account");
    const deleted = await seedUser(ctx.prisma, email, {
      status: UserStatus.DELETED,
      fullName: "Deleted Person",
    });
    await ctx.prisma.user.update({
      where: { id: deleted.id },
      data: { deletedAt: new Date() },
    });
    const response = await graphql(
      ctx.app,
      ADD_MEMBER,
      { input: { email, fullName: "Revived" } },
      ownerACookies,
    );
    expect(response.body.data?.addOrganizationMember).toBeFalsy();
    const after = await userByEmail(email);
    expect(after.deletedAt).not.toBeNull();
    expect(after.status).toBe(UserStatus.DELETED);
  });

  it("holds under concurrent promotion and overwrite attempts", async () => {
    const adminEmail = scope.email("concurrent-admin");
    await seedUser(ctx.prisma, adminEmail, {
      role: Role.ADMIN,
      fullName: "Concurrent Admin",
    });
    const outcomes = await runTogether(12, (index) =>
      index % 2 === 0
        ? graphql(
            ctx.app,
            ADD_MEMBER,
            { input: { email: adminEmail, fullName: `Overwrite ${index}` } },
            ownerACookies,
          )
        : graphql(
            ctx.app,
            UPDATE_MEMBER,
            { input: { memberId: memberOfAId, role: Role.ADMIN } },
            ownerACookies,
          ),
    );
    for (const outcome of outcomes) {
      expect(outcome.status).toBe("fulfilled");
      if (outcome.status === "fulfilled") {
        expect(outcome.value.body.data?.addOrganizationMember).toBeFalsy();
        expect(outcome.value.body.data?.updateOrganizationMember).toBeFalsy();
      }
    }
    expect(await userByEmail(adminEmail)).toMatchObject({
      role: Role.ADMIN,
      fullName: "Concurrent Admin",
    });
    const member = await ctx.prisma.user.findUniqueOrThrow({
      where: { id: memberOfAUserId },
    });
    expect(member.role).toBe(Role.PROFESSIONAL);
  });

  it("scopes each owner to their own organization", async () => {
    const response = await graphql(
      ctx.app,
      UPDATE_MEMBER,
      { input: { memberId: memberOfAId, jobRole: "From B" } },
      ownerBCookies,
    );
    expect(response.body.data?.updateOrganizationMember).toBeFalsy();
    expect(organizationAId).not.toBe(organizationBId);
  });
});
