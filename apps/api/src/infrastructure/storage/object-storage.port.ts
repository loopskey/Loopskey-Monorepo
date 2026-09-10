export const OBJECT_STORAGE = Symbol("OBJECT_STORAGE");

export type ObjectStorageNamespace =
  | "avatar"
  | "pdu"
  | "certificate"
  | "report"
  | "logo"
  // Re-hosted catalog images. Written only by the content-image fetch pipeline
  // (a later phase); the key is always derived server-side from the item and a
  // content hash, never from a crawler-supplied name.
  | "content";

export interface ObjectStoragePort {
  store(
    namespace: ObjectStorageNamespace,
    key: string,
    data: Buffer,
  ): Promise<void>;
  read(namespace: ObjectStorageNamespace, key: string): Promise<Buffer>;
  remove(namespace: ObjectStorageNamespace, key: string): Promise<void>;
  resolve(namespace: ObjectStorageNamespace, key: string): string;
  exists(namespace: ObjectStorageNamespace, key: string): Promise<boolean>;
}
