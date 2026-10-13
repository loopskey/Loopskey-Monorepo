import { AssignmentTargetKind, AssignmentType, Role } from "@prisma/client";
import { CourseCategory, CourseStatus } from "@prisma/client";
import { SecurityApp, bootSecurityApp, dataOf } from "../setup/security";
import { graphql, seedUser, signIn } from "../setup/security";
import { suiteScope } from "../setup/concurrency";

const scope = suiteScope("secassign");

const CREATE = `mutation($input: CreateOrganizationAssignmentInput!) {
  createOrganizationAssignment(input: $input) {
    id targetMemberId departmentId courseTitle members
  }
}`;
const UPDATE = `mutation($input: UpdateOrganizationAssignmentInput!) {
  updateOrganizationAssignment(input: $input) { id departmentId targetMemberId }
}`;

describe("Organization assignments across tenants (security e2e)", () => {
  let ctx: SecurityApp;
  let ownerACookies: string[];
  let ownerBCookies: string[];
  let memberOfAId: string;
  let memberOfBId: string;
  let departmentBId: string;
  let publishedCourseId: string;
  let draftCourseId: string;

  const course = (status: CourseStatus, label: string) =>
    ctx.prisma.course.create({
      data: {
        slug: scope.eventSlug(label),
        title: `Security ${label}`,
        instructor: "Instructor",
        description: "Description",
        category: CourseCategory.OTHER,
        status,
      },
    });

  const input = (overrides: Record<string, unknown>) => ({
    title: "Assignment",
    courseId: publishedCourseId,
    type: AssignmentType.SOFT,
    targetKind: AssignmentTargetKind.MEMBER,
    ...overrides,
  });

  const recipientRows = (memberId: string) =>
    ctx.prisma.organizationAssignmentRecipient.count({ where: { memberId } });

  beforeAll(async () => {
    ctx = await bootSecurityApp();
    await scope.cleanup(ctx.prisma);
    await ctx.prisma.course.deleteMany({
      where: { slug: { startsWith: "secassign-" } },
    });
    const ownerA = await seedUser(ctx.prisma, scope.email("owner-a"), {
      role: Role.ORGANIZATION,
    });
    const ownerB = await seedUser(ctx.prisma, scope.email("owner-b"), {
      role: Role.ORGANIZATION,
    });
    const orgA = await ctx.prisma.organization.create({
      data: { ownerId: ownerA.id, name: "Assign Org A" },
    });
    const orgB = await ctx.prisma.organization.create({
      data: { ownerId: ownerB.id, name: "Assign Org B" },
    });
    departmentBId = (
      await ctx.prisma.organizationDepartment.create({
        data: { organizationId: orgB.id, title: "Assign B Dept" },
      })
    ).id;
    const userA = await seedUser(ctx.prisma, scope.email("member-a"));
    const userB = await seedUser(ctx.prisma, scope.email("member-b"));
    memberOfAId = (
      await ctx.prisma.organizationMember.create({
        data: { organizationId: orgA.id, userId: userA.id },
      })
    ).id;
    memberOfBId = (
      await ctx.prisma.organizationMember.create({
        data: { organizationId: orgB.id, userId: userB.id },
      })
    ).id;
    publishedCourseId = (await course(CourseStatus.PUBLISHED, "published")).id;
    draftCourseId = (await course(CourseStatus.DRAFT, "draft")).id;
    ownerACookies = await signIn(ctx.app, ownerA.email!);
    ownerBCookies = await signIn(ctx.app, ownerB.email!);
  }, 120_000);

  afterAll(async () => {
    if (ctx) {
      await ctx.prisma.course.deleteMany({
        where: { slug: { startsWith: "secassign-" } },
      });
      await scope.cleanup(ctx.prisma);
    }
    await ctx?.app.close();
  }, 60_000);

  it("assigns learning to a member of the caller's own organization", async () => {
    const response = await graphql(
      ctx.app,
      CREATE,
      { input: input({ targetMemberId: memberOfAId }) },
      ownerACookies,
    );
    expect(dataOf(response, "createOrganizationAssignment")).toMatchObject({
      targetMemberId: memberOfAId,
      members: 1,
    });
  });

  it("refuses to target a member of another organization", async () => {
    const before = await recipientRows(memberOfBId);
    const response = await graphql(
      ctx.app,
      CREATE,
      { input: input({ targetMemberId: memberOfBId }) },
      ownerACookies,
    );
    expect(response.body.data?.createOrganizationAssignment).toBeFalsy();
    expect(response.body.errors).toBeDefined();
    expect(await recipientRows(memberOfBId)).toBe(before);
  });

  it("refuses another organization's department on create and update", async () => {
    const created = await graphql(
      ctx.app,
      CREATE,
      {
        input: input({
          targetKind: AssignmentTargetKind.MEMBER,
          targetMemberId: memberOfAId,
          departmentId: departmentBId,
        }),
      },
      ownerACookies,
    );
    expect(created.body.data?.createOrganizationAssignment).toBeFalsy();

    const own = await graphql(
      ctx.app,
      CREATE,
      { input: input({ targetMemberId: memberOfAId }) },
      ownerACookies,
    );
    const assignmentId = dataOf<{ id: string }>(
      own,
      "createOrganizationAssignment",
    )!.id;
    const updated = await graphql(
      ctx.app,
      UPDATE,
      { input: { assignmentId, departmentId: departmentBId } },
      ownerACookies,
    );
    expect(updated.body.data?.updateOrganizationAssignment).toBeFalsy();
    const stored = await ctx.prisma.organizationAssignment.findUniqueOrThrow({
      where: { id: assignmentId },
    });
    expect(stored.departmentId).toBeNull();
  });

  it("refuses to retarget an assignment at another organization's member", async () => {
    const own = await graphql(
      ctx.app,
      CREATE,
      { input: input({ targetMemberId: memberOfAId }) },
      ownerACookies,
    );
    const assignmentId = dataOf<{ id: string }>(
      own,
      "createOrganizationAssignment",
    )!.id;
    const updated = await graphql(
      ctx.app,
      UPDATE,
      { input: { assignmentId, targetMemberId: memberOfBId } },
      ownerACookies,
    );
    expect(updated.body.data?.updateOrganizationAssignment).toBeFalsy();
    const stored = await ctx.prisma.organizationAssignment.findUniqueOrThrow({
      where: { id: assignmentId },
    });
    expect(stored.targetMemberId).toBe(memberOfAId);
  });

  it("does not let another organization change this organization's assignment", async () => {
    const own = await graphql(
      ctx.app,
      CREATE,
      { input: input({ targetMemberId: memberOfAId }) },
      ownerACookies,
    );
    const assignmentId = dataOf<{ id: string }>(
      own,
      "createOrganizationAssignment",
    )!.id;
    const response = await graphql(
      ctx.app,
      UPDATE,
      { input: { assignmentId, title: "Hijacked" } },
      ownerBCookies,
    );
    expect(response.body.data?.updateOrganizationAssignment).toBeFalsy();
    const stored = await ctx.prisma.organizationAssignment.findUniqueOrThrow({
      where: { id: assignmentId },
    });
    expect(stored.title).toBe("Assignment");
  });

  it("does not disclose an unpublished course through an assignment", async () => {
    const response = await graphql(
      ctx.app,
      CREATE,
      {
        input: input({ courseId: draftCourseId, targetMemberId: memberOfAId }),
      },
      ownerACookies,
    );
    expect(response.body.data?.createOrganizationAssignment).toBeFalsy();
    expect(JSON.stringify(response.body)).not.toContain("Security draft");
  });
});
