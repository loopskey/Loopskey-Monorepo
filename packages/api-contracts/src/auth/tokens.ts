export const JWT_ALGORITHM = "HS256";
export const JWT_ISSUER = "loopskey-api";
export const JWT_ACCESS_AUDIENCE = "loopskey-access";
export const JWT_REFRESH_AUDIENCE = "loopskey-refresh";
export const JWT_OAUTH_STATE_AUDIENCE = "loopskey-oauth-state";

export const TOKEN_TYPE = {
  ACCESS: "access",
  REFRESH: "refresh",
  OAUTH_STATE: "oauth-state",
} as const;

export type TokenType = (typeof TOKEN_TYPE)[keyof typeof TOKEN_TYPE];
