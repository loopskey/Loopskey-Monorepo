import { access, mkdir, rm, writeFile } from "fs/promises";
import { ObjectStorageNamespace } from "./object-storage.port";
import { join, resolve, sep } from "path";
import { ObjectStoragePort } from "./object-storage.port";
import { Injectable } from "@nestjs/common";

@Injectable()
export class LocalObjectStorageAdapter implements ObjectStoragePort {
  private root(namespace: ObjectStorageNamespace) {
    if (namespace === "avatar")
      return (
        process.env.AVATAR_UPLOAD_DIR ??
        join(process.cwd(), "uploads", "avatars")
      );
    if (namespace === "pdu")
      return (
        process.env.PDU_UPLOAD_DIR ?? join(process.cwd(), "uploads", "pdu")
      );
    return (
      process.env.CERTIFICATE_UPLOAD_DIR ??
      join(process.cwd(), "uploads", "certificate")
    );
  }

  resolve(namespace: ObjectStorageNamespace, key: string) {
    const root = resolve(this.root(namespace));
    const path = resolve(join(root, key));
    if (path !== root && !path.startsWith(root + sep))
      throw new Error("Invalid object storage key.");
    return path;
  }

  async store(namespace: ObjectStorageNamespace, key: string, data: Buffer) {
    await mkdir(resolve(this.root(namespace)), { recursive: true });
    await writeFile(this.resolve(namespace, key), data);
  }

  remove(namespace: ObjectStorageNamespace, key: string) {
    return rm(this.resolve(namespace, key), { force: true });
  }

  async exists(namespace: ObjectStorageNamespace, key: string) {
    try {
      await access(this.resolve(namespace, key));
      return true;
    } catch {
      return false;
    }
  }
}
