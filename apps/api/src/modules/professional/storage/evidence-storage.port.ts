export const EVIDENCE_STORAGE = Symbol("EVIDENCE_STORAGE");

export type EvidenceNamespace = "avatar" | "pdu" | "certificate";

export interface EvidenceStoragePort {
  store(
    namespace: EvidenceNamespace,
    storageKey: string,
    data: Buffer,
  ): Promise<void>;
  remove(namespace: EvidenceNamespace, storageKey: string): Promise<void>;
  resolve(namespace: EvidenceNamespace, storageKey: string): string;
  exists(namespace: EvidenceNamespace, storageKey: string): Promise<boolean>;
}
