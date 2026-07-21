import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ContentInteractionModule } from "@contentAction/content-interaction.module";
import { ExternalLearningModule } from "@ext/external-learning.module";
import { AdminDashboardModule } from "@admin/admin.module";
import { PasswordChangeGuard } from "@auth/guards/password-change.guard";
import { OrganizationModule } from "@org/org.module";
import { ProfessionalModule } from "@professional/professional.module";
import { ProviderModule } from "@provider/provider.module";
import { GraphQLModule } from "@nestjs/graphql";
import { PodcastModule } from "@podcast/podcast.module";
import { YouTubeModule } from "@youtube/youtube.module";
import { LandingModule } from "@landing/landing.module";
import { PrismaModule } from "@prisma/prisma.module";
import { JwtAuthGuard } from "@auth/guards/jwt-auth.guard";
import { CourseModule } from "@course/course.module";
import { EventModule } from "@events/events.module";
import { AuthModule } from "@auth/auth.module";
import { UserModule } from "@user/user.module";
import { RolesGuard } from "@auth/guards/roles.guard";
import { APP_GUARD } from "@nestjs/core";
import { Module } from "@nestjs/common";
import { join } from "path";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),

    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): ApolloDriverConfig => {
        const schemaPath = configService.get<string>(
          "GRAPHQL_SCHEMA_PATH",
          "src/graphql/schema.gql",
        );
        return {
          autoSchemaFile: join(process.cwd(), schemaPath),
          sortSchema: true,
          playground:
            configService.get<string>("GRAPHQL_PLAYGROUND", "true") === "true",
          introspection: true,
          context: ({ req, res }: { req: Request; res: Response }) => ({
            req,
            res,
          }),
        };
      },
    }),

    AuthModule,
    UserModule,
    EventModule,
    PrismaModule,
    CourseModule,
    PodcastModule,
    YouTubeModule,
    LandingModule,
    ProviderModule,
    OrganizationModule,
    ProfessionalModule,
    AdminDashboardModule,
    ExternalLearningModule,
    ContentInteractionModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: PasswordChangeGuard },
  ],
})
export class AppModule {}
