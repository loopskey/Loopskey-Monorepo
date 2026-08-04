import { access, mkdir, rm, writeFile } from "fs/promises";
import { getCertificateUploadDir } from "@professional/enums/certificate-file.constant";
import { EvidenceStoragePort } from "./evidence-storage.port";
import { getAvatarUploadDir } from "@professional/enums/profile-avatar.constant";
import { join, resolve, sep } from "path";
import { EvidenceNamespace } from "./evidence-storage.port";
import { getPduUploadDir } from "@professional/enums/pdu-file.constant";
import { Injectable } from "@nestjs/common";

@Injectable()
export class LocalEvidenceStorageAdapter implements EvidenceStoragePort {
  private root(namespace: EvidenceNamespace) {
    if (namespace === "avatar") return getAvatarUploadDir();
    if (namespace === "pdu") return getPduUploadDir();
    return getCertificateUploadDir();
  }

  resolve(namespace: EvidenceNamespace, storageKey: string) {
    const root = resolve(this.root(namespace));
    const path = resolve(join(root, storageKey));
    if (path !== root && !path.startsWith(root + sep))
      throw new Error("Invalid evidence storage key.");
    return path;
  }

  async store(namespace: EvidenceNamespace, storageKey: string, data: Buffer) {
    await mkdir(resolve(this.root(namespace)), { recursive: true });
    await writeFile(this.resolve(namespace, storageKey), data);
  }

  remove(namespace: EvidenceNamespace, storageKey: string) {
    return rm(this.resolve(namespace, storageKey), { force: true });
  }

  async exists(namespace: EvidenceNamespace, storageKey: string) {
    try {
      await access(this.resolve(namespace, storageKey));
      return true;
    } catch {
      return false;
    }
  }
}
