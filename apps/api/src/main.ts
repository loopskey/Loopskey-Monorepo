import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "@app/app.module";

import cookieParser from "cookie-parser";

async function bootstrap() {
  const logger = new Logger("Bootstrap");
  const app = await NestFactory.create(AppModule);
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

  app.use(cookieParser());

  app.enableCors({
    origin: frontendUrl,
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
}

bootstrap();
