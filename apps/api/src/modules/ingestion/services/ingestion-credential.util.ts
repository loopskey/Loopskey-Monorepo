import { randomBytes } from "crypto";

const CREDENTIAL_SCHEME = "lk_ing";
const PREFIX_BYTES = 6;
const SECRET_BYTES = 32;

const CREDENTIAL_PATTERN = new RegExp(
  `^${CREDENTIAL_SCHEME}_([0-9a-f]{${PREFIX_BYTES * 2}})_([A-Za-z0-9_-]{16,})$`,
);

export type TParsedCredential = {
  prefix: string;
  secret: string;
};

export const mintCredentialParts = () => {
  const prefix = randomBytes(PREFIX_BYTES).toString("hex");
  const secret = randomBytes(SECRET_BYTES).toString("base64url");
  return { prefix, secret, credential: formatCredential(prefix, secret) };
};

export const formatCredential = (prefix: string, secret: string) =>
  `${CREDENTIAL_SCHEME}_${prefix}_${secret}`;

export const parseCredential = (
  presented: string | undefined | null,
): TParsedCredential | null => {
  if (!presented) return null;
  const match = CREDENTIAL_PATTERN.exec(presented.trim());
  if (!match) return null;
  return { prefix: match[1], secret: match[2] };
};

export const readBearerCredential = (
  authorization: string | undefined | null,
) => {
  if (!authorization) return null;
  const [scheme, ...rest] = authorization.trim().split(/\s+/);
  if (scheme.toLowerCase() !== "bearer" || rest.length !== 1) return null;
  return rest[0];
};
