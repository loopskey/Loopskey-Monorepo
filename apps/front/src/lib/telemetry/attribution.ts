import { TelemetryAttribution } from "@/lib/graphql/base";

const STORAGE_KEY = "lk_landing_source";

const SEARCH_HOSTS = [
  /^(www\.)?google\.[a-z.]{2,}$/,
  /^(www\.)?bing\.com$/,
  /^(www\.)?duckduckgo\.com$/,
  /^(\w+\.)?search\.yahoo\.com$/,
  /^(www\.)?ecosia\.org$/,
  /^(www\.)?yandex\.[a-z.]{2,}$/,
  /^(www\.)?baidu\.com$/,
  /^search\.brave\.com$/,
  /^(www\.)?startpage\.com$/,
  /^(www\.)?qwant\.com$/,
];

const SOCIAL_HOSTS = [
  "facebook.com",
  "linkedin.com",
  "lnkd.in",
  "t.co",
  "twitter.com",
  "x.com",
  "instagram.com",
  "youtube.com",
  "reddit.com",
  "whatsapp.com",
];

const isSocialHost = (host: string) =>
  SOCIAL_HOSTS.some((site) => host === site || host.endsWith(`.${site}`));

const categoryOfReferrer = (referrer: string) => {
  if (!referrer) return TelemetryAttribution.Direct;
  let host: string;
  try {
    const url = new URL(referrer);
    if (url.origin === window.location.origin)
      return TelemetryAttribution.Internal;
    host = url.hostname.toLowerCase();
  } catch {
    return TelemetryAttribution.Direct;
  }
  if (SEARCH_HOSTS.some((pattern) => pattern.test(host)))
    return TelemetryAttribution.OrganicSearch;
  if (isSocialHost(host)) return TelemetryAttribution.Social;
  return TelemetryAttribution.Referral;
};

const isCategory = (value: string | null): value is TelemetryAttribution =>
  Object.values(TelemetryAttribution).includes(value as TelemetryAttribution);

const readStored = () => {
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    return isCategory(stored) ? stored : null;
  } catch {
    return null;
  }
};

const store = (category: TelemetryAttribution) => {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, category);
  } catch {
    return;
  }
};

export const landingAttribution = () => {
  const stored = readStored();
  if (stored) return stored;
  const category = categoryOfReferrer(document.referrer);
  if (category !== TelemetryAttribution.Internal) store(category);
  return category;
};
