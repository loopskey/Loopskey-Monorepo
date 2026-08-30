import { assertIsolatedTestDatabase } from "./database-safety";

process.env.NODE_ENV = "test";
assertIsolatedTestDatabase();

const defaults: Record<string, string> = {
  JWT_ACCESS_SECRET: "e2e-access-secret-at-least-32-characters",
  JWT_REFRESH_SECRET: "e2e-refresh-secret-at-least-32-characters",
  // Session lifetimes are read with Number(), so a missing value becomes NaN
  // and reaches Prisma as `new Date(NaN)`. CI has no `.env` for ConfigModule to
  // fall back on, so anything that signs a token or opens a session needs its
  // setting here. Values mirror `.env.example`.
  JWT_ACCESS_EXPIRES_IN: "15m",
  JWT_REFRESH_EXPIRES_IN_DAYS: "30",
  ACCESS_TOKEN_COOKIE_MAX_AGE_MS: "900000",
  RESEND_API_KEY: "re_e2e_not_used",
  EMAIL_FROM: "e2e@example.test",
  GOOGLE_CLIENT_ID: "e2e-google-client",
  GOOGLE_CLIENT_SECRET: "e2e-google-secret",
  GOOGLE_CALLBACK_URL: "http://localhost/e2e/google",
  LINKEDIN_CLIENT_ID: "e2e-linkedin-client",
  LINKEDIN_CLIENT_SECRET: "e2e-linkedin-secret",
  LINKEDIN_CALLBACK_URL: "http://localhost/e2e/linkedin",
  OAUTH_STATE_SECRET: "e2e-oauth-state-secret-at-least-32-characters",
  FRONTEND_URL: "http://localhost:3000",
  GRAPHQL_SCHEMA_PATH: "src/graphql/schema.gql",
  CONTACT_RECIPIENT_EMAIL: "loopskey.dev@gmail.com",
};

for (const [key, value] of Object.entries(defaults)) {
  process.env[key] ??= value;
}

process.env.DIRECT_DATABASE_URL ??= process.env.DATABASE_URL;
