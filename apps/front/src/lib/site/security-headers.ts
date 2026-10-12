const HSTS_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;

const FRAME_AND_BASE_POLICY = [
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

export const securityHeaders = (siteOrigin: string) => [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  { key: "Content-Security-Policy", value: FRAME_AND_BASE_POLICY },
  ...(siteOrigin.startsWith("https://")
    ? [
        {
          key: "Strict-Transport-Security",
          value: `max-age=${HSTS_MAX_AGE_SECONDS}; includeSubDomains`,
        },
      ]
    : []),
];
