export const OBJECT_STORAGE = Symbol("OBJECT_STORAGE");

export type ObjectStorageNamespace = "avatar" | "pdu" | "certificate";

export interface ObjectStoragePort {
  store(
    namespace: ObjectStorageNamespace,
    key: string,
    data: Buffer,
  ): Promise<void>;
  remove(namespace: ObjectStorageNamespace, key: string): Promise<void>;
  resolve(namespace: ObjectStorageNamespace, key: string): string;
  exists(namespace: ObjectStorageNamespace, key: string): Promise<boolean>;
}
