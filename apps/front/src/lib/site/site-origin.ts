import { allowsLocalhostOrigin } from "./deployment-env";

const SITE_URL_VARIABLE = "NEXT_PUBLIC_SITE_URL";
const HOST_ALIASES_VARIABLE = "SITE_CANONICAL_HOST_ALIASES";
const HTTPS_REDIRECT_VARIABLE = "SITE_HTTPS_REDIRECT";

const LOOPBACK_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "[::1]",
]);

const configurationError = (variable: string, reason: string) =>
  new Error(`Invalid ${variable}: ${reason}`);

const isLocalHostname = (hostname: string) =>
  LOOPBACK_HOSTNAMES.has(hostname) ||
  hostname.endsWith(".localhost") ||
  hostname.endsWith(".local");

const LOCAL_DEVELOPMENT_ORIGIN = "http://localhost:3000";

const parseSiteOrigin = (): URL => {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    (allowsLocalhostOrigin ? LOCAL_DEVELOPMENT_ORIGIN : "");

  if (!configured)
    throw configurationError(
      SITE_URL_VARIABLE,
      "the public site origin is not set. Set it to the absolute origin the " +
        "site is served from, for example https://www.example.com. Only " +
        `DEPLOYMENT_ENV=development falls back to ${LOCAL_DEVELOPMENT_ORIGIN}.`,
    );

  let parsed: URL;
  try {
    parsed = new URL(configured);
  } catch {
    throw configurationError(
      SITE_URL_VARIABLE,
      "it must be an absolute URL including the scheme.",
    );
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:")
    throw configurationError(SITE_URL_VARIABLE, "it must use http or https.");

  if (parsed.username || parsed.password)
    throw configurationError(
      SITE_URL_VARIABLE,
      "it must not carry a username or password.",
    );

  if (parsed.pathname !== "/" || parsed.search || parsed.hash)
    throw configurationError(
      SITE_URL_VARIABLE,
      "it must be a bare origin with no path, query string or fragment.",
    );

  if (allowsLocalhostOrigin) return parsed;

  if (parsed.protocol !== "https:")
    throw configurationError(
      SITE_URL_VARIABLE,
      "a deployed origin must use https. Only DEPLOYMENT_ENV=development may " +
        "serve the site over http.",
    );

  if (isLocalHostname(parsed.hostname))
    throw configurationError(
      SITE_URL_VARIABLE,
      "a deployed origin must be the public hostname, not a loopback or " +
        "localhost address.",
    );

  return parsed;
};

const siteOrigin = parseSiteOrigin();

export const SITE_ORIGIN = siteOrigin.origin;

export const SITE_HOST = siteOrigin.host.toLowerCase();

export const SITE_IS_HTTPS = siteOrigin.protocol === "https:";

const parseHostAlias = (alias: string): string => {
  if (alias.includes("://") || /[/\\?#@]/.test(alias))
    throw configurationError(
      HOST_ALIASES_VARIABLE,
      `"${alias}" must be a bare host, optionally with a port, and never a URL.`,
    );

  let parsed: URL;
  try {
    parsed = new URL(`https://${alias}`);
  } catch {
    throw configurationError(
      HOST_ALIASES_VARIABLE,
      `"${alias}" is not a valid host.`,
    );
  }

  if (parsed.host.toLowerCase() !== alias)
    throw configurationError(
      HOST_ALIASES_VARIABLE,
      `"${alias}" is not a valid host.`,
    );

  if (alias === SITE_HOST)
    throw configurationError(
      HOST_ALIASES_VARIABLE,
      `"${alias}" is the canonical host itself, so it would redirect to itself.`,
    );

  return alias;
};

const parseHostAliases = (): readonly string[] => {
  const configured = process.env.SITE_CANONICAL_HOST_ALIASES?.trim();
  if (!configured) return [];

  const aliases = configured
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => entry.length > 0)
    .map(parseHostAlias);

  return [...new Set(aliases)];
};

export const CANONICAL_HOST_ALIASES = parseHostAliases();

const parseHttpsRedirect = (): boolean => {
  const configured = process.env.SITE_HTTPS_REDIRECT?.trim();
  if (!configured || configured === "false") return false;

  if (configured !== "true")
    throw configurationError(
      HTTPS_REDIRECT_VARIABLE,
      "it must be either true or false.",
    );

  if (!SITE_IS_HTTPS)
    throw configurationError(
      HTTPS_REDIRECT_VARIABLE,
      `it cannot be enabled while ${SITE_URL_VARIABLE} is an http origin.`,
    );

  return true;
};

export const IS_HTTPS_REDIRECT_ENABLED = parseHttpsRedirect();
