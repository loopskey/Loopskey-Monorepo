import { INestApplication, ValidationPipe } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { PrismaClient, Role, UserStatus } from "@prisma/client";
import { AppModule } from "@app/app.module";
import { PrismaService } from "@prisma/prisma.service";

import cookieParser from "cookie-parser";
import request from "supertest";

describe("GraphQL API (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let professionalId: string;

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
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.user.deleteMany({
        where: { email: { endsWith: "@e2e.example.test" } },
      });
    }
    await app?.close();
  });

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
    const token = new JwtService({
      secret: process.env.JWT_ACCESS_SECRET,
    }).sign({
      sub: professionalId,
      email: "professional@e2e.example.test",
      role: Role.PROFESSIONAL,
      status: UserStatus.ACTIVE,
    });
    const response = await request(app.getHttpServer())
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({ query: `query { userById(userId: "${professionalId}") { id } }` })
      .expect(200);
    expect(response.body.errors[0].extensions.code).toBe("FORBIDDEN");
  });
});
