import { Role, UserStatus } from "@prisma/client";
import { SecurityApp, bootSecurityApp, dataOf } from "../setup/security";
import { errorCode, graphql, seedUser, signIn } from "../setup/security";
import { runTogether, suiteScope } from "../setup/concurrency";

const scope = suiteScope("secprov");

const CREATE_USER = `mutation($input: CreateUserInput!) {
  createUser(input: $input) { id role status email }
}`;
const USERS = `query { users { items { id } } }`;
const USER_BY_ID = `query($userId: String!) { userById(userId: $userId) { id } }`;
const UPDATE_USER = `mutation($input: UpdateUserInput!) {
  updateUser(input: $input) { id role }
}`;
const UPDATE_USER_STATUS = `mutation($input: UpdateUserStatusInput!) {
  updateUserStatus(input: $input) { id status }
}`;
const DELETE_USER = `mutation($userId: String!) { deleteUser(userId: $userId) { id } }`;
const RESTORE_USER = `mutation($userId: String!) { restoreUser(userId: $userId) { id } }`;
const ME = `query { me { id email } }`;
const UPDATE_ME = `mutation($input: UpdateMeInput!) { updateMe(input: $input) { id fullName } }`;
const REGISTER = `mutation($input: RegisterInput!) { register(input: $input) { code } }`;

describe("User provisioning and role assignment (security e2e)", () => {
  let ctx: SecurityApp;
  let adminCookies: string[];
  let professionalCookies: string[];
  let organizationCookies: string[];
  let firstUserEmail: string;
  let professionalEmail: string;
  let victimId: string;

  const countByEmail = (email: string) =>
    ctx.prisma.user.count({ where: { email } });

  beforeAll(async () => {
    ctx = await bootSecurityApp();
    await scope.cleanup(ctx.prisma);
    firstUserEmail = scope.email("first");
    professionalEmail = scope.email("professional");
    const adminEmail = scope.email("admin");
    const organizationEmail = scope.email("organization");
    await seedUser(ctx.prisma, firstUserEmail, {
      role: Role.ADMIN,
      fullName: "First Administrator",
    });
    await seedUser(ctx.prisma, adminEmail, { role: Role.ADMIN });
    await seedUser(ctx.prisma, professionalEmail, {
      fullName: "Professional Person",
    });
    await seedUser(ctx.prisma, organizationEmail, { role: Role.ORGANIZATION });
    victimId = (
      await seedUser(ctx.prisma, scope.email("victim"), {
        fullName: "Victim Person",
      })
    ).id;
    adminCookies = await signIn(ctx.app, adminEmail);
    professionalCookies = await signIn(ctx.app, professionalEmail);
    organizationCookies = await signIn(ctx.app, organizationEmail);
  }, 120_000);

  afterAll(async () => {
    if (ctx) await scope.cleanup(ctx.prisma);
    await ctx?.app.close();
  }, 60_000);

  it("refuses anonymous createUser and creates no account", async () => {
    const email = scope.email("anonymous-admin");
    const response = await graphql(ctx.app, CREATE_USER, {
      input: {
        email,
        password: "Attacker-Pass-1234",
        role: Role.ADMIN,
        status: UserStatus.ACTIVE,
      },
    });
    expect(errorCode(response)).toBe("UNAUTHENTICATED");
    expect(await countByEmail(email)).toBe(0);
  });

  it.each([
    ["professional", () => professionalCookies],
    ["organization", () => organizationCookies],
  ])(
    "refuses createUser from a %s and creates no account",
    async (name, cookies) => {
      const email = scope.email(`${name}-escalation`);
      const response = await graphql(
        ctx.app,
        CREATE_USER,
        {
          input: {
            email,
            password: "Attacker-Pass-1234",
            role: Role.ADMIN,
            status: UserStatus.ACTIVE,
          },
        },
        cookies(),
      );
      expect(response.body.data).toBeFalsy();
      expect(errorCode(response)).toBeDefined();
      expect(await countByEmail(email)).toBe(0);
    },
  );

  it("lets an administrator create an account and defaults to a pending professional", async () => {
    const email = scope.email("created-by-admin");
    const response = await graphql(
      ctx.app,
      CREATE_USER,
      { input: { email, password: "Created-Pass-1234" } },
      adminCookies,
    );
    expect(dataOf(response, "createUser")).toMatchObject({
      email,
      role: Role.PROFESSIONAL,
      status: UserStatus.PENDING,
    });
  });

  it("refuses every other user-administration operation to non-administrators", async () => {
    const operations: [string, Record<string, unknown>][] = [
      [USERS, {}],
      [USER_BY_ID, { userId: victimId }],
      [UPDATE_USER, { input: { userId: victimId, role: Role.ADMIN } }],
      [
        UPDATE_USER_STATUS,
        { input: { userId: victimId, status: UserStatus.DISABLED } },
      ],
      [DELETE_USER, { userId: victimId }],
      [RESTORE_USER, { userId: victimId }],
    ];
    for (const cookies of [professionalCookies, organizationCookies])
      for (const [query, variables] of operations) {
        const response = await graphql(ctx.app, query, variables, cookies);
        expect(errorCode(response)).toBe("FORBIDDEN");
      }
    const victim = await ctx.prisma.user.findUniqueOrThrow({
      where: { id: victimId },
    });
    expect(victim).toMatchObject({
      role: Role.PROFESSIONAL,
      status: UserStatus.ACTIVE,
      deletedAt: null,
    });
  });

  it("keeps the administrator operations working", async () => {
    const list = await graphql(ctx.app, USERS, undefined, adminCookies);
    expect(list.body.data.users.items.length).toBeGreaterThan(0);
    const update = await graphql(
      ctx.app,
      UPDATE_USER_STATUS,
      { input: { userId: victimId, status: UserStatus.ACTIVE } },
      adminCookies,
    );
    expect(dataOf(update, "updateUserStatus")).toMatchObject({
      id: victimId,
    });
  });

  it("does not let public registration choose a privileged role", async () => {
    const email = scope.email("registering-admin");
    const response = await graphql(ctx.app, REGISTER, {
      input: {
        email,
        password: "Register-Pass-1234",
        confirmPassword: "Register-Pass-1234",
        fullName: "Wannabe Admin",
        role: Role.ADMIN,
      },
    });
    expect(response.body.data?.register).toBeFalsy();
    expect(response.body.errors).toBeDefined();
    expect(await countByEmail(email)).toBe(0);
    expect(
      await ctx.prisma.pendingRegistration.count({ where: { email } }),
    ).toBe(0);
  });

  it("returns the caller's own record from me and updateMe", async () => {
    const me = await graphql(ctx.app, ME, undefined, professionalCookies);
    expect(dataOf(me, "me")).toMatchObject({ email: professionalEmail });
    const update = await graphql(
      ctx.app,
      UPDATE_ME,
      { input: { fullName: "Renamed Myself" } },
      professionalCookies,
    );
    expect(dataOf(update, "updateMe")).toMatchObject({
      fullName: "Renamed Myself",
    });
    const first = await ctx.prisma.user.findUniqueOrThrow({
      where: { email: firstUserEmail },
    });
    expect(first.fullName).toBe("First Administrator");
  });

  it("creates no administrator under a burst of anonymous attempts", async () => {
    const burstEmails = Array.from({ length: 12 }, (_, index) =>
      scope.email(`burst-${index}`),
    );
    const outcomes = await runTogether(12, (index) =>
      graphql(ctx.app, CREATE_USER, {
        input: {
          email: burstEmails[index],
          password: "Burst-Pass-1234",
          role: Role.ADMIN,
          status: UserStatus.ACTIVE,
        },
      }),
    );
    for (const outcome of outcomes) {
      expect(outcome.status).toBe("fulfilled");
      if (outcome.status === "fulfilled")
        expect(errorCode(outcome.value)).toBe("UNAUTHENTICATED");
    }
    expect(
      await ctx.prisma.user.count({ where: { email: { in: burstEmails } } }),
    ).toBe(0);
  });
});
