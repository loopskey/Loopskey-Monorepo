import { ConsoleLogger, Logger, ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { resolveCorsOrigins } from "@utils/cors-origins.util";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "@app/app.module";
import { json } from "body-parser";

import cookieParser from "cookie-parser";

const INGESTION_PATH = "/v1/ingest";
const INGESTION_JSON_BODY_LIMIT = "10mb";
const URLENCODED_BODY_LIMIT = "100kb";

async function bootstrap() {
  const logger = new Logger("Bootstrap");
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
    logger:
      process.env.NODE_ENV === "production"
        ? new ConsoleLogger({ json: true })
        : undefined,
  });
  const configService = app.get(ConfigService);
  const nodeEnv = configService.get<string>("NODE_ENV", "development");
  const appName = configService.get<string>("APP_NAME", "NestJS API");
  const host = configService.get<string>("APP_HOST", "localhost");
  const port = Number(configService.get<string>("APP_PORT", "5700"));
  const frontendUrl = configService.get<string>(
    "FRONTEND_URL",
    "http://localhost:3000",
  );

  app.enableShutdownHooks();

  app.use(INGESTION_PATH, json({ limit: INGESTION_JSON_BODY_LIMIT }));
  app.useBodyParser("json");
  app.useBodyParser("urlencoded", {
    extended: true,
    limit: URLENCODED_BODY_LIMIT,
  });
  app.use(cookieParser());

  const corsOrigins = resolveCorsOrigins(
    configService.get<string>("CORS_ORIGIN"),
    frontendUrl,
  );

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(port);

  const apiUrl = `http://${host}:${port}`;
  const graphqlUrl = `${apiUrl}/graphql`;

  logger.log(`🚀 ${appName} is running`);
  logger.log(`🌍 Environment: ${nodeEnv}`);
  logger.log(`🔗 API URL: ${apiUrl}`);
  logger.log(`🧩 GraphQL URL: ${graphqlUrl}`);
  logger.log(`🎨 Frontend URL: ${frontendUrl}`);
  logger.log(`🛡️ Allowed CORS origins: ${corsOrigins.join(", ")}`);
}

bootstrap();
