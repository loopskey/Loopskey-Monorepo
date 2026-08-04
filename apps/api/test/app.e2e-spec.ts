import { INestApplication, ValidationPipe } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import {
  PDUCategory,
  PDUStatus,
  PrismaClient,
  Role,
  UserStatus,
} from "@prisma/client";
import { AppModule } from "@app/app.module";
import { PrismaService } from "@prisma/prisma.service";

import cookieParser from "cookie-parser";
import request from "supertest";

describe("GraphQL API (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let professionalId: string;
  let secondProfessionalId: string;
  let providerId: string;

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
    await prisma.event.deleteMany({
      where: { title: { startsWith: "Phase 3 E2E" } },
    });
    await prisma.user.deleteMany({
      where: { email: { endsWith: "@e2e.example.test" } },
    });
    const professional = await prisma.user.create({
      data: {
        email: "professional@e2e.example.test",
        role: Role.PROFESSIONAL,
        status: UserStatus.ACTIVE,
      },
    });
    professionalId = professional.id;
    const secondProfessional = await prisma.user.create({
      data: {
        email: "professional-two@e2e.example.test",
        role: Role.PROFESSIONAL,
        status: UserStatus.ACTIVE,
      },
    });
    secondProfessionalId = secondProfessional.id;
    const provider = await prisma.user.create({
      data: {
        email: "provider@e2e.example.test",
        role: Role.PROVIDER,
        status: UserStatus.ACTIVE,
      },
    });
    providerId = provider.id;
  }, 60_000);

  afterAll(async () => {
    if (prisma) {
      await prisma.event.deleteMany({
        where: { title: { startsWith: "Phase 3 E2E" } },
      });
      await prisma.user.deleteMany({
        where: { email: { endsWith: "@e2e.example.test" } },
      });
    }
    await app?.close();
  }, 30_000);

  it("serves a public query through HTTP", async () => {
    const response = await request(app.getHttpServer())
      .post("/graphql")
      .send({ query: "query { popularCategories { category totalItems } }" })
      .expect(200);
    expect(response.body.errors).toBeUndefined();
    expect(Array.isArray(response.body.data.popularCategories)).toBe(true);
  });

  it("rejects a protected query without authentication", async () => {
    const response = await request(app.getHttpServer())
      .post("/graphql")
      .send({ query: "query { me { id } }" })
      .expect(200);
    expect(response.body.errors[0].extensions.code).toBe("UNAUTHENTICATED");
  });

  it("rejects an authenticated caller with the wrong role", async () => {
    const token = signAccessToken(
      professionalId,
      "professional@e2e.example.test",
      Role.PROFESSIONAL,
    );
    const response = await request(app.getHttpServer())
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({ query: `query { userById(userId: "${professionalId}") { id } }` })
      .expect(200);
    expect(response.body.errors[0].extensions.code).toBe("FORBIDDEN");
  });

  it("scopes professional projections to the authenticated owner", async () => {
    await prisma.pDUActivity.createMany({
      data: [professionalId, secondProfessionalId].map((userId, index) => ({
        userId,
        title: `Phase 6 E2E Activity ${index}`,
        category: PDUCategory.TECHNICAL,
        status: PDUStatus.APPROVED,
        pdus: 1,
        date: new Date("2030-01-01T10:00:00.000Z"),
      })),
    });
    const token = signAccessToken(
      professionalId,
      "professional@e2e.example.test",
      Role.PROFESSIONAL,
    );

    const response = await request(app.getHttpServer())
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({
        query: `query {
          professionalPduActivitySummary {
            completedActivities
            activitiesWithEvidence
            evidenceFilesCount
          }
        }`,
      })
      .expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.professionalPduActivitySummary).toEqual({
      completedActivities: 1,
      activitiesWithEvidence: 0,
      evidenceFilesCount: 0,
    });
  });

  it("allows a provider to create, update, and publish an owned event", async () => {
    const token = signAccessToken(
      providerId,
      "provider@e2e.example.test",
      Role.PROVIDER,
    );
    const createResponse = await request(app.getHttpServer())
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({
        query: `mutation {
          createEvent(input: {
            title: "Phase 3 E2E Event"
            description: "Events vertical slice"
            type: WORKSHOP
            deliveryMode: LIVE_ONLINE
            category: TECHNOLOGY
            startDate: "2030-01-01T10:00:00.000Z"
            isFree: true
          }) { id status title }
        }`,
      })
      .expect(200);
    expect(createResponse.body.errors).toBeUndefined();
    const eventId = createResponse.body.data.createEvent.id as string;

    const updateResponse = await request(app.getHttpServer())
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({
        query: `mutation {
          updateEvent(input: { eventId: "${eventId}", title: "Phase 3 E2E Updated" }) {
            id title status
          }
        }`,
      })
      .expect(200);
    expect(updateResponse.body.errors).toBeUndefined();
    expect(updateResponse.body.data.updateEvent.title).toBe(
      "Phase 3 E2E Updated",
    );

    const publishResponse = await request(app.getHttpServer())
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({
        query: `mutation { publishEvent(eventId: "${eventId}") { id status } }`,
      })
      .expect(200);
    expect(publishResponse.body.errors).toBeUndefined();
    expect(publishResponse.body.data.publishEvent.status).toBe("PUBLISHED");

    const professionalToken = signAccessToken(
      professionalId,
      "professional@e2e.example.test",
      Role.PROFESSIONAL,
    );
    const enrollmentResponse = await request(app.getHttpServer())
      .post("/graphql")
      .set("Authorization", `Bearer ${professionalToken}`)
      .send({
        query: `mutation {
          enrollContent(input: { contentType: EVENT, contentId: "${eventId}" }) {
            success active code
          }
        }`,
      })
      .expect(200);
    expect(enrollmentResponse.body.errors).toBeUndefined();
    expect(enrollmentResponse.body.data.enrollContent).toMatchObject({
      success: true,
      active: true,
    });
  });

  it("forbids a professional from creating an event", async () => {
    const token = signAccessToken(
      professionalId,
      "professional@e2e.example.test",
      Role.PROFESSIONAL,
    );
    const response = await request(app.getHttpServer())
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({
        query: `mutation {
          createEvent(input: {
            title: "Phase 3 E2E Forbidden"
            description: "Must not be created"
            type: WORKSHOP
            deliveryMode: LIVE_ONLINE
            category: TECHNOLOGY
            startDate: "2030-01-01T10:00:00.000Z"
          }) { id }
        }`,
      })
      .expect(200);
    expect(response.body.errors[0].extensions.code).toBe("FORBIDDEN");
  });
});

function signAccessToken(id: string, email: string, role: Role): string {
  return new JwtService({ secret: process.env.JWT_ACCESS_SECRET }).sign({
    sub: id,
    email,
    role,
    status: UserStatus.ACTIVE,
  });
}
