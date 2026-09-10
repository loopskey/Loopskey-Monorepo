import { INestApplication, ValidationPipe } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { PrismaClient, Role, UserStatus } from "@prisma/client";
import { AppModule } from "@app/app.module";
import { PrismaService } from "@prisma/prisma.service";

import cookieParser from "cookie-parser";
import request from "supertest";

const SLUG_PREFIX = "ingestion-admin-e2e";

const unique = () =>
  `${process.pid.toString(36)}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

function signAccessToken(id: string, email: string, role: Role): string {
  return new JwtService({ secret: process.env.JWT_ACCESS_SECRET }).sign({
    sub: id,
    email,
    role,
    status: UserStatus.ACTIVE,
  });
}

describe("Ingestion admin GraphQL API (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let adminId: string;
  let professionalId: string;
  let adminToken: string;
  let professionalToken: string;

  const graphql = (body: { query: string }, token?: string) => {
    const req = request(app.getHttpServer()).post("/graphql");
    if (token) req.set("Authorization", `Bearer ${token}`);
    return req.send(body).expect(200);
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.ingestionSource.deleteMany({
      where: { slug: { startsWith: SLUG_PREFIX } },
    });
    await prisma.user.deleteMany({
      where: { email: { endsWith: `@${SLUG_PREFIX}.test` } },
    });

    const adminEmail = `admin@${SLUG_PREFIX}.test`;
    const admin = await prisma.user.create({
      data: { email: adminEmail, role: Role.ADMIN, status: UserStatus.ACTIVE },
    });
    adminId = admin.id;
    adminToken = signAccessToken(admin.id, adminEmail, Role.ADMIN);

    const professionalEmail = `professional@${SLUG_PREFIX}.test`;
    const professional = await prisma.user.create({
      data: {
        email: professionalEmail,
        role: Role.PROFESSIONAL,
        status: UserStatus.ACTIVE,
      },
    });
    professionalId = professional.id;
    professionalToken = signAccessToken(
      professional.id,
      professionalEmail,
      Role.PROFESSIONAL,
    );
  }, 60_000);

  afterAll(async () => {
    if (prisma) {
      await prisma.ingestionSource.deleteMany({
        where: { slug: { startsWith: SLUG_PREFIX } },
      });
      await prisma.user.deleteMany({
        where: { id: { in: [adminId, professionalId] } },
      });
    }
    await app?.close();
  }, 30_000);

  it("rejects an anonymous read and an anonymous write", async () => {
    const read = await graphql({
      query: "query { ingestionSources { totalCount } }",
    });
    expect(read.body.errors[0].extensions.code).toBe("UNAUTHENTICATED");

    const write = await graphql({
      query: `mutation {
        createIngestionSource(input: {
          slug: "${SLUG_PREFIX}-anon-${unique()}"
          name: "Anonymous attempt"
          kind: COURSE
        }) { id }
      }`,
    });
    expect(write.body.errors[0].extensions.code).toBe("UNAUTHENTICATED");
  });

  it("forbids a non-admin role from every operation in this phase", async () => {
    const read = await graphql(
      { query: "query { ingestionSources { totalCount } }" },
      professionalToken,
    );
    expect(read.body.errors[0].extensions.code).toBe("FORBIDDEN");

    const write = await graphql(
      {
        query: `mutation {
          createIngestionSource(input: {
            slug: "${SLUG_PREFIX}-forbidden-${unique()}"
            name: "Should not be created"
            kind: COURSE
          }) { id }
        }`,
      },
      professionalToken,
    );
    expect(write.body.errors[0].extensions.code).toBe("FORBIDDEN");

    expect(
      await prisma.ingestionSource.count({
        where: { slug: { startsWith: `${SLUG_PREFIX}-forbidden` } },
      }),
    ).toBe(0);
  });

  it("lets an administrator create, read, update, activate and deactivate a source", async () => {
    const slug = `${SLUG_PREFIX}-lifecycle-${unique()}`;
    const create = await graphql(
      {
        query: `mutation {
          createIngestionSource(input: {
            slug: "${slug}"
            name: "Lifecycle source"
            kind: COURSE
            autoPublish: false
          }) { id slug isActive autoPublish }
        }`,
      },
      adminToken,
    );
    expect(create.body.errors).toBeUndefined();
    const sourceId = create.body.data.createIngestionSource.id as string;
    expect(create.body.data.createIngestionSource.isActive).toBe(true);

    const read = await graphql(
      { query: `query { ingestionSource(sourceId: "${sourceId}") { slug } }` },
      adminToken,
    );
    expect(read.body.data.ingestionSource.slug).toBe(slug);

    const update = await graphql(
      {
        query: `mutation {
          updateIngestionSource(input: { sourceId: "${sourceId}", autoPublish: true }) {
            autoPublish
          }
        }`,
      },
      adminToken,
    );
    expect(update.body.data.updateIngestionSource.autoPublish).toBe(true);

    const deactivate = await graphql(
      {
        query: `mutation {
          deactivateIngestionSource(sourceId: "${sourceId}") { isActive }
        }`,
      },
      adminToken,
    );
    expect(deactivate.body.data.deactivateIngestionSource.isActive).toBe(
      false,
    );

    const activate = await graphql(
      {
        query: `mutation {
          activateIngestionSource(sourceId: "${sourceId}") { isActive }
        }`,
      },
      adminToken,
    );
    expect(activate.body.data.activateIngestionSource.isActive).toBe(true);
  });

  it("rejects a field map that attempts a transformation, with a stated code", async () => {
    const response = await graphql(
      {
        query: `mutation {
          createIngestionSource(input: {
            slug: "${SLUG_PREFIX}-badmap-${unique()}"
            name: "Bad field map"
            kind: COURSE
            fieldMap: { source_title: "title.toUpperCase()" }
          }) { id }
        }`,
      },
      adminToken,
    );
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].extensions.code).toBe(
      "INGESTION_FIELD_MAP_INVALID",
    );
    expect(
      await prisma.ingestionSource.count({
        where: { slug: { startsWith: `${SLUG_PREFIX}-badmap` } },
      }),
    ).toBe(0);
  });

  it("rejects an invalid slug without a server error", async () => {
    const response = await graphql(
      {
        query: `mutation {
          createIngestionSource(input: {
            slug: "Not A Valid Slug!"
            name: "Invalid slug"
            kind: COURSE
          }) { id }
        }`,
      },
      adminToken,
    );
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].extensions.code).not.toBe(
      "INTERNAL_SERVER_ERROR",
    );
  });

  it("issues a key whose secret appears once and never again, and lists it without a hash", async () => {
    const slug = `${SLUG_PREFIX}-keys-${unique()}`;
    const create = await graphql(
      {
        query: `mutation {
          createIngestionSource(input: { slug: "${slug}", name: "Key source", kind: COURSE }) {
            id
          }
        }`,
      },
      adminToken,
    );
    const sourceId = create.body.data.createIngestionSource.id as string;

    const issue = await graphql(
      {
        query: `mutation {
          issueIngestionApiKey(input: { sourceId: "${sourceId}", name: "primary" }) {
            id prefix credential
          }
        }`,
      },
      adminToken,
    );
    expect(issue.body.errors).toBeUndefined();
    const credential = issue.body.data.issueIngestionApiKey.credential as string;
    expect(credential).toMatch(/^lk_ing_/);

    const list = await graphql(
      {
        query: `query {
          ingestionApiKeys(sourceId: "${sourceId}") { id prefix revokedAt }
        }`,
      },
      adminToken,
    );
    expect(JSON.stringify(list.body)).not.toContain(credential.split("_").at(-1));
    expect(JSON.stringify(list.body)).not.toContain("secretHash");

    const secondKey = await graphql(
      {
        query: `mutation {
          issueIngestionApiKey(input: { sourceId: "${sourceId}", name: "secondary" }) {
            id
          }
        }`,
      },
      adminToken,
    );
    const firstKeyId = issue.body.data.issueIngestionApiKey.id as string;
    const secondKeyId = secondKey.body.data.issueIngestionApiKey.id as string;

    const revoke = await graphql(
      {
        query: `mutation { revokeIngestionApiKey(keyId: "${firstKeyId}") { revokedAt } }`,
      },
      adminToken,
    );
    expect(revoke.body.data.revokeIngestionApiKey.revokedAt).not.toBeNull();

    const stillListed = await graphql(
      {
        query: `query { ingestionApiKeys(sourceId: "${sourceId}") { id revokedAt } }`,
      },
      adminToken,
    );
    const keys = stillListed.body.data.ingestionApiKeys as Array<{
      id: string;
      revokedAt: string | null;
    }>;
    expect(keys.map((key) => key.id).sort()).toEqual(
      [firstKeyId, secondKeyId].sort(),
    );
    expect(keys.find((key) => key.id === secondKeyId)?.revokedAt).toBeNull();
  });

  it("requires a reason to reject an item", async () => {
    const response = await graphql(
      {
        query: `mutation {
          rejectIngestionItem(input: { itemId: "does-not-matter", reason: "" }) {
            id
          }
        }`,
      },
      adminToken,
    );
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].extensions.code).not.toBe(
      "INTERNAL_SERVER_ERROR",
    );
  });
});
