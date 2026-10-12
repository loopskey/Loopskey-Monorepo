export const CONTENT_URL_KIND_REGISTRY = Symbol("CONTENT_URL_KIND_REGISTRY");

export type ContentUrlRecord = {
  id: string;
  slug: string;
  deletedAt: Date | null;
  providerId: string | null;
};

export type ContentUrlKindAdapter = {
  entityType: string;
  adminOnly?: boolean;
  find(client: object, id: string): Promise<ContentUrlRecord | null>;
  rename(tx: object, id: string, from: string, to: string): Promise<number>;
  findPublishedSlug(client: object, id: string): Promise<string | null>;
};

export interface ContentUrlKindRegistry {
  register(kind: string, adapter: ContentUrlKindAdapter): void;
}
