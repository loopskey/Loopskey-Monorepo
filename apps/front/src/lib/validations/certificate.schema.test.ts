import { certificateSchema } from "@/lib/validations/certificate.schema";
import { describe, expect, it } from "vitest";

import * as C from "@/utils/certificate.constant";

const pdf = (name = "evidence.pdf", size = 1024) => {
  const file = new File(["x"], name, { type: "application/pdf" });
  Object.defineProperty(file, "size", { value: size });
  return file;
};

const base = {
  title: "Project Management Professional",
  issuer: "PMI",
  certificateNumber: "",
  issueDate: "2026-01-01",
  validUntil: "2027-01-01",
  cpdPlanId: "NONE",
  files: [pdf()],
  existingFileCount: 0,
};

const errorsFor = (input: Record<string, unknown>) => {
  const result = certificateSchema.safeParse(input);
  if (result.success) return [];
  return result.error.issues.map((issue) => issue.path.join("."));
};

describe("certificateSchema", () => {
  it("accepts a complete certificate", () => {
    expect(certificateSchema.safeParse(base).success).toBe(true);
  });

  it("requires the name and the issuer", () => {
    const paths = errorsFor({ ...base, title: "", issuer: "" });
    expect(paths).toContain("title");
    expect(paths).toContain("issuer");
  });

  it("requires both dates", () => {
    const paths = errorsFor({ ...base, issueDate: "", validUntil: "" });
    expect(paths).toContain("issueDate");
    expect(paths).toContain("validUntil");
  });

  it("rejects an expiry date before the issue date", () => {
    expect(
      errorsFor({ ...base, issueDate: "2027-01-01", validUntil: "2026-01-01" }),
    ).toContain("validUntil");
  });

  it("accepts an expiry date equal to the issue date", () => {
    expect(
      certificateSchema.safeParse({
        ...base,
        issueDate: "2026-05-01",
        validUntil: "2026-05-01",
      }).success,
    ).toBe(true);
  });

  it("treats the certification ID as optional", () => {
    expect(certificateSchema.safeParse({ ...base, certificateNumber: "" }).success).toBe(
      true,
    );
    expect(
      certificateSchema.safeParse({ ...base, certificateNumber: "ID-42" })
        .success,
    ).toBe(true);
  });

  it("treats the CPD plan as optional", () => {
    expect(certificateSchema.safeParse({ ...base, cpdPlanId: "" }).success).toBe(
      true,
    );
  });

  it("requires evidence when nothing is attached or stored", () => {
    expect(
      errorsFor({ ...base, files: [], existingFileCount: 0 }),
    ).toContain("files");
  });

  it("accepts an edit that keeps its stored evidence", () => {
    expect(
      certificateSchema.safeParse({
        ...base,
        files: [],
        existingFileCount: 1,
      }).success,
    ).toBe(true);
  });

  it("rejects a file above the size limit", () => {
    expect(
      errorsFor({
        ...base,
        files: [pdf("big.pdf", C.MAX_CERTIFICATE_FILE_SIZE_BYTES + 1)],
      }),
    ).toContain("files.0");
  });

  it("rejects an empty file", () => {
    expect(errorsFor({ ...base, files: [pdf("empty.pdf", 0)] })).toContain(
      "files.0",
    );
  });

  it("rejects an unsupported file type", () => {
    expect(
      errorsFor({
        ...base,
        files: [new File(["x"], "notes.txt", { type: "text/plain" })],
      }),
    ).toContain("files.0");
  });

  it("rejects more files than the backend accepts", () => {
    const files = Array.from({ length: C.MAX_CERTIFICATE_FILES }, (_, index) =>
      pdf(`file-${index}.pdf`),
    );

    expect(
      errorsFor({ ...base, files, existingFileCount: 1 }),
    ).toContain("files");
  });
});
