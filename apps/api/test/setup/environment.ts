import { assertIsolatedTestDatabase } from "./database-safety";

process.env.NODE_ENV = "test";
assertIsolatedTestDatabase();

const defaults: Record<string, string> = {
  JWT_ACCESS_SECRET: "e2e-access-secret-at-least-32-characters",
  JWT_REFRESH_SECRET: "e2e-refresh-secret-at-least-32-characters",
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
};

for (const [key, value] of Object.entries(defaults)) {
  process.env[key] ??= value;
}
