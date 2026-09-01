import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { OperationTimingInterceptor } from "@infrastructure/observability/operation-timing.interceptor";
import { ContentInteractionModule } from "@contentAction/content-interaction.module";
import { ExternalLearningModule } from "@ext/external-learning.module";
import { AdminDashboardModule } from "@admin/admin.module";
import { PasswordChangeGuard } from "@auth/guards/password-change.guard";
import { OrganizationModule } from "@org/org.module";
import { AssociationModule } from "@association/association.module";
import { formatGraphQLError } from "@utils/graphql-error-formatter";
import { ProfessionalModule } from "@professional/professional.module";
import { OperationsModule } from "@infrastructure/operations/operations.module";
import { ServiceAiModule } from "@infrastructure/service-ai/service-ai.module";
import { ProviderModule } from "@provider/provider.module";
import { SupportModule } from "@support/support.module";
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
import { Module } from "@nestjs/common";
import { join } from "path";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    OperationsModule,
    ServiceAiModule,

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
          formatError: formatGraphQLError,
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
    SupportModule,
    OrganizationModule,
    AssociationModule,
    ProfessionalModule,
    AdminDashboardModule,
    ExternalLearningModule,
    ContentInteractionModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: PasswordChangeGuard },
    { provide: APP_INTERCEPTOR, useClass: OperationTimingInterceptor },
  ],
})
export class AppModule {}
