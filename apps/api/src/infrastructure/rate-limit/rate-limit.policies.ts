import { RateLimitRule } from "./rate-limit.decorator";

const MINUTE = 60;
const HOUR = 60 * MINUTE;

export const RATE_LIMITS = {
  login: {
    scope: "auth.login",
    byIp: { limit: 60, windowSeconds: 15 * MINUTE },
    bySubject: { field: "input.email", limit: 10, windowSeconds: 15 * MINUTE },
  },
  register: {
    scope: "auth.register",
    byIp: { limit: 20, windowSeconds: HOUR },
    bySubject: { field: "input.email", limit: 5, windowSeconds: HOUR },
  },
  verifyEmailOtp: {
    scope: "auth.verify-email-otp",
    byIp: { limit: 30, windowSeconds: 15 * MINUTE },
    bySubject: { field: "input.email", limit: 15, windowSeconds: 15 * MINUTE },
  },
  resendEmailOtp: {
    scope: "auth.resend-email-otp",
    byIp: { limit: 20, windowSeconds: HOUR },
    bySubject: { field: "input.email", limit: 5, windowSeconds: HOUR },
  },
  forgotPassword: {
    scope: "auth.forgot-password",
    byIp: { limit: 10, windowSeconds: HOUR },
    bySubject: { field: "input.email", limit: 3, windowSeconds: HOUR },
  },
  resetPassword: {
    scope: "auth.reset-password",
    byIp: { limit: 20, windowSeconds: HOUR },
    bySubject: { field: "input.email", limit: 10, windowSeconds: HOUR },
  },
  refreshToken: {
    scope: "auth.refresh-token",
    byIp: { limit: 300, windowSeconds: 15 * MINUTE },
  },
  requestEmailChange: {
    scope: "auth.request-email-change",
    byIp: { limit: 10, windowSeconds: HOUR },
    bySubject: { field: "input.newEmail", limit: 3, windowSeconds: HOUR },
  },
  changePassword: {
    scope: "auth.change-password",
    byIp: { limit: 10, windowSeconds: HOUR },
  },
  verifyEmailChange: {
    scope: "auth.verify-email-change",
    byIp: { limit: 30, windowSeconds: HOUR },
  },
  accessRequest: {
    scope: "public.access-request",
    byIp: { limit: 5, windowSeconds: HOUR },
  },
} satisfies Record<string, RateLimitRule>;
