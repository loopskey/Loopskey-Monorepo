import { IngestionContentKind } from "@prisma/client";

export type TIngestionSourceContext = {
  keyId: string;
  sourceId: string;
  fieldMap: unknown;
  keyPrefix: string;
  sourceSlug: string;
  autoPublish: boolean;
  kind: IngestionContentKind;
  stalenessWindowDays: number | null;
};

export type TIssuedIngestionKey = {
  id: string;
  prefix: string;
  credentialShownOnce: string;
};

export type TIngestionRejection =
  | { kind: "unauthorized" }
  | { kind: "source-inactive"; sourceSlug: string; keyPrefix: string }
  | {
      kind: "rate-limited";
      sourceSlug: string;
      keyPrefix: string;
      retryAfterSeconds: number;
    };

export type TIngestionVerification =
  | { outcome: "authenticated"; source: TIngestionSourceContext }
  | { outcome: "rejected"; rejection: TIngestionRejection };

export type TIngestionRequest = {
  body?: unknown;
  query?: unknown;
  ingestion?: TIngestionSourceContext;
  headers?: Record<string, string | string[] | undefined>;
};
