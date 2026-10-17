import { IngestionReviewReason } from "@prisma/client";

export type PublicationQualityInput = {
  title: string | null | undefined;
  description: string | null | undefined;
  urls: Array<string | null | undefined>;
};

export const PUBLICATION_HOLD_REASONS: readonly IngestionReviewReason[] = [
  IngestionReviewReason.PLACEHOLDER_CONTENT,
  IngestionReviewReason.PLACEHOLDER_URL,
  IngestionReviewReason.PREVIOUSLY_REJECTED,
];

const USABLE_DESCRIPTION_LENGTH = 20;
const SUBSTANTIVE_DESCRIPTION_LENGTH = 40;

const PLACEHOLDER_WORDS = new Set([
  "asdf",
  "bar",
  "baz",
  "check",
  "connection",
  "connectivity",
  "debug",
  "demo",
  "dolor",
  "dummy",
  "example",
  "foo",
  "hello",
  "ipsum",
  "lorem",
  "ping",
  "placeholder",
  "probe",
  "probing",
  "qwerty",
  "sample",
  "smoke",
  "tbd",
  "temp",
  "test",
  "testing",
  "tests",
  "tmp",
  "todo",
  "tunnel",
  "untitled",
  "via",
  "world",
  "xxx",
]);

const PLACEHOLDER_DOMAINS = ["example.com", "example.net", "example.org"];
const PLACEHOLDER_SUFFIXES = [
  ".example",
  ".test",
  ".invalid",
  ".localhost",
  ".local",
];
const LOOPBACK_HOSTS = new Set(["localhost", "0.0.0.0", "[::1]"]);

const wordsOf = (value: string) =>
  value
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word.length > 0);

const isPlaceholderText = (value: string | null | undefined) => {
  const words = wordsOf(value ?? "");
  const lettered = words.filter((word) => /\p{L}/u.test(word));
  return lettered.every((word) => PLACEHOLDER_WORDS.has(word));
};

const usableLength = (value: string | null | undefined) =>
  (value ?? "").trim().length;

const isPlaceholderUrl = (value: string) => {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return true;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return true;
  const host = url.hostname.toLowerCase();
  return (
    LOOPBACK_HOSTS.has(host) ||
    host.startsWith("127.") ||
    PLACEHOLDER_DOMAINS.some(
      (domain) => host === domain || host.endsWith(`.${domain}`),
    ) ||
    PLACEHOLDER_SUFFIXES.some((suffix) => host.endsWith(suffix))
  );
};

export const assessPublicationQuality = ({
  title,
  description,
  urls,
}: PublicationQualityInput): IngestionReviewReason[] => {
  const reasons: IngestionReviewReason[] = [];
  const descriptionLength = usableLength(description);

  if (
    isPlaceholderText(title) &&
    (descriptionLength < SUBSTANTIVE_DESCRIPTION_LENGTH ||
      isPlaceholderText(description))
  )
    reasons.push(IngestionReviewReason.PLACEHOLDER_CONTENT);

  if (
    urls.some(
      (value) =>
        typeof value === "string" &&
        value.trim() &&
        isPlaceholderUrl(value.trim()),
    )
  )
    reasons.push(IngestionReviewReason.PLACEHOLDER_URL);

  if (descriptionLength < USABLE_DESCRIPTION_LENGTH)
    reasons.push(IngestionReviewReason.MISSING_DESCRIPTION);

  return reasons;
};

export const holdsPublication = (reasons: readonly IngestionReviewReason[]) =>
  reasons.some((reason) => PUBLICATION_HOLD_REASONS.includes(reason));
