import { LocalObjectStorageAdapter } from "./local-object-storage.adapter";
import { join, resolve, sep } from "path";

describe("LocalObjectStorageAdapter content namespace", () => {
  const adapter = new LocalObjectStorageAdapter();
  const root = resolve(join(process.cwd(), "uploads", "content"));

  it("resolves a plain key inside the content root", () => {
    const path = adapter.resolve("content", "ab/cd/hash.webp");
    expect(path.startsWith(root + sep)).toBe(true);
  });

  it("rejects a key that climbs out of the content root", () => {
    for (const key of ["../logos/secret.png", "../../etc/passwd", "a/../../b"])
      expect(() => adapter.resolve("content", key)).toThrow(
        "Invalid object storage key.",
      );
  });

  it("contains an absolute-looking key inside the content root", () => {
    // `path.join` folds a leading separator into a sub-path rather than letting
    // it escape, so this resolves inside the root, not to the filesystem root.
    const path = adapter.resolve("content", "/etc/hosts");
    expect(path.startsWith(root + sep)).toBe(true);
  });

  it("honours CONTENT_IMAGE_DIR when set", () => {
    const previous = process.env.CONTENT_IMAGE_DIR;
    process.env.CONTENT_IMAGE_DIR = resolve(join(process.cwd(), "tmp-content"));
    try {
      const path = adapter.resolve("content", "x.webp");
      expect(path).toBe(resolve(join(process.env.CONTENT_IMAGE_DIR, "x.webp")));
    } finally {
      if (previous === undefined) delete process.env.CONTENT_IMAGE_DIR;
      else process.env.CONTENT_IMAGE_DIR = previous;
    }
  });
});
