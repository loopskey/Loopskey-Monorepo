import { INestApplication, ValidationPipe } from "@nestjs/common";
import { IngestionContentKind, PrismaClient } from "@prisma/client";
import { Role, UserStatus } from "@prisma/client";
import { AppModule } from "@app/app.module";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "@prisma/prisma.service";
import { Test } from "@nestjs/testing";

import cookieParser from "cookie-parser";
import request from "supertest";

const SLUG_PREFIX = "ingestion-kinds-e2e";

const unique = () =>
  `${process.pid.toString(36)}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

const CONTRACT_VERSION = "1.0";

const EVENT_MAP = {
  external_id: "externalId",
  url: "canonicalUrl",
  name: "title",
  summary: "description",
  starts_at: "startDate",
  tz: "timezone",
};
const PODCAST_MAP = {
  external_id: "externalId",
  url: "canonicalUrl",
  name: "title",
  summary: "description",
  presenter: "host",
};
const YOUTUBE_MAP = {
  external_id: "externalId",
  url: "canonicalUrl",
  name: "title",
  channel_url: "channelUrl",
};

const signAccessToken = (id: string, email: string) =>
  new JwtService({ secret: process.env.JWT_ACCESS_SECRET }).sign({
    sub: id,
    email,
    role: Role.ADMIN,
    status: UserStatus.ACTIVE,
  });

describe("Additional content kinds ingestion HTTP (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let adminToken: string;

  const cleanup = async () => {
    const sources = await prisma.ingestionSource.findMany({
      where: { slug: { startsWith: SLUG_PREFIX } },
      select: { id: true },
    });
    const ids = sources.map((source) => source.id);
    if (ids.length) {
      const items = await prisma.ingestionItem.findMany({
        where: { sourceId: { in: ids } },
        include: { source: { select: { kind: true } } },
      });
      const catalog = (kind: IngestionContentKind) =>
        items
          .filter((item) => item.source.kind === kind && item.catalogId)
          .map((item) => item.catalogId as string);
      await prisma.event.deleteMany({
        where: { id: { in: catalog(IngestionContentKind.EVENT) } },
      });
      await prisma.podcast.deleteMany({
        where: { id: { in: catalog(IngestionContentKind.PODCAST) } },
      });
      await prisma.youTubeChannel.deleteMany({
        where: { id: { in: catalog(IngestionContentKind.YOUTUBE) } },
      });
      await prisma.ingestionSource.deleteMany({ where: { id: { in: ids } } });
    }
    await prisma.outboxEvent.deleteMany({
      where: {
        eventName: "ingestion.item.published",
        aggregateType: "IngestionItem",
      },
    });
    await prisma.user.deleteMany({
      where: { email: { endsWith: `@${SLUG_PREFIX}.test` } },
    });
  };

  const issueKey = async (sourceId: string) => {
    const response = await request(app.getHttpServer())
      .post("/graphql")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        query: `mutation {
          issueIngestionApiKey(input: { sourceId: "${sourceId}", name: "e2e" }) {
            credential
          }
        }`,
      })
      .expect(200);
    return response.body.data.issueIngestionApiKey.credential as string;
  };

  const makeSource = async (
    kind: IngestionContentKind,
    fieldMap: Record<string, string>,
  ) => {
    const source = await prisma.ingestionSource.create({
      data: {
        slug: `${SLUG_PREFIX}-${kind.toLowerCase()}-${unique()}`,
        name: `${kind} source`,
        kind,
        autoPublish: false,
        fieldMap,
      },
    });
    return { source, credential: await issueKey(source.id) };
  };

  const post = (path: string, body: unknown, credential?: string) => {
    const req = request(app.getHttpServer())
      .post(path)
      .set("Idempotency-Key", `idem-${unique()}`);
    if (credential) req.set("Authorization", `Bearer ${credential}`);
    return req.send(body as object);
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
    await cleanup();

    const email = `admin@${SLUG_PREFIX}.test`;
    const admin = await prisma.user.create({
      data: { email, role: Role.ADMIN, status: UserStatus.ACTIVE },
    });
    adminToken = signAccessToken(admin.id, email);
  }, 120000);

  afterAll(async () => {
    await cleanup();
    await app.close();
  }, 60000);

  it("accepts an event batch on the event route", async () => {
    const { credential } = await makeSource(
      IngestionContentKind.EVENT,
      EVENT_MAP,
    );
    const response = await post(
      "/v1/ingest/event/batches",
      {
        contractVersion: CONTRACT_VERSION,
        kind: "EVENT",
        mode: "INCREMENTAL",
        items: [
          {
            external_id: `evt-${unique()}`,
            url: "https://example.com/e",
            name: "Summit",
            summary: "About data.",
            starts_at: "2026-05-01T09:00:00.000Z",
            tz: "UTC",
          },
        ],
      },
      credential,
    );
    expect(response.status).toBe(201);
    expect(response.body.createdCount).toBe(1);
  }, 120000);

  it("accepts a podcast batch on the podcast route", async () => {
    const { credential } = await makeSource(
      IngestionContentKind.PODCAST,
      PODCAST_MAP,
    );
    const response = await post(
      "/v1/ingest/podcast/batches",
      {
        contractVersion: CONTRACT_VERSION,
        kind: "PODCAST",
        mode: "INCREMENTAL",
        items: [
          {
            external_id: `pod-${unique()}`,
            url: "https://example.com/p",
            name: "The Show",
            summary: "Weekly.",
            presenter: "Ada",
          },
        ],
      },
      credential,
    );
    expect(response.status).toBe(201);
    expect(response.body.createdCount).toBe(1);
  }, 120000);

  it("accepts a YouTube batch on the youtube route", async () => {
    const { credential } = await makeSource(
      IngestionContentKind.YOUTUBE,
      YOUTUBE_MAP,
    );
    const response = await post(
      "/v1/ingest/youtube/batches",
      {
        contractVersion: CONTRACT_VERSION,
        kind: "YOUTUBE",
        mode: "INCREMENTAL",
        items: [
          {
            external_id: `chan-${unique()}`,
            url: "https://example.com/c",
            name: "Channel",
            channel_url: "https://youtube.com/@c",
          },
        ],
      },
      credential,
    );
    expect(response.status).toBe(201);
    expect(response.body.createdCount).toBe(1);
  }, 120000);

  it("rejects a podcast key used on the event route", async () => {
    const { credential } = await makeSource(
      IngestionContentKind.PODCAST,
      PODCAST_MAP,
    );
    const response = await post(
      "/v1/ingest/event/batches",
      {
        contractVersion: CONTRACT_VERSION,
        kind: "EVENT",
        mode: "INCREMENTAL",
        items: [],
      },
      credential,
    );
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("INGESTION_KIND_MISMATCH");
  }, 120000);

  it("rejects an anonymous request", async () => {
    const response = await post("/v1/ingest/podcast/batches", {
      contractVersion: CONTRACT_VERSION,
      kind: "PODCAST",
      mode: "INCREMENTAL",
      items: [],
    });
    expect(response.status).toBe(401);
  }, 120000);
});
