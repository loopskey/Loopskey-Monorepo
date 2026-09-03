import { type ProfessionalComplianceApi } from "@professional/public/professional-compliance-api";
import { AssociationMemberFileService } from "@association/services/association-member-file.service";
import { AssociationAccessService } from "@association/services/association-access.service";
import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { PrismaService } from "@prisma/prisma.service";
import { Role } from "@prisma/client";

const owner = { id: "owner-1", role: Role.ASSOCIATION };

const storedFile = {
  sourceId: "act-1",
  filePath: "/uploads/pdu/abc.pdf",
  file: {
    id: "file-1",
    fileName: "proof.pdf",
    mimeType: "application/pdf",
    sizeBytes: 10,
  },
};

const setup = ({
  member = { id: "member-1", userId: "user-1" },
  evidence = storedFile,
  certificate = { ...storedFile, sourceId: "cert-1" },
  attribution = { id: "attr-1" },
}: {
  member?: { id: string; userId: string } | null;
  evidence?: typeof storedFile | null;
  certificate?: typeof storedFile | null;
  attribution?: { id: string } | null;
} = {}) => {
  const attributionFindFirst = jest.fn().mockResolvedValue(attribution);

  const prisma = {
    associationMember: { findFirst: jest.fn().mockResolvedValue(member) },
    associationCreditAttribution: { findFirst: attributionFindFirst },
  };

  const access = {
    requireOwned: jest.fn().mockResolvedValue({ id: "assoc-1", name: "A" }),
  };

  const port = {
    evidenceFileForOwners: jest.fn().mockResolvedValue(evidence),
    certificateFileForOwners: jest.fn().mockResolvedValue(certificate),
  };

  return {
    port,
    prisma,
    access,
    attributionFindFirst,
    service: new AssociationMemberFileService(
      prisma as unknown as PrismaService,
      access as unknown as AssociationAccessService,
      port as unknown as ProfessionalComplianceApi,
    ),
  };
};

const codeOf = async (act: Promise<unknown>) => {
  try {
    await act;
    return null;
  } catch (error) {
    const response = (
      error as { getResponse: () => { code: string } }
    ).getResponse();
    const status = (error as { getStatus: () => number }).getStatus();
    return { code: response.code, status };
  }
};

describe("AssociationMemberFileService", () => {
  it("streams an evidence file that belongs to a member of this association", async () => {
    const { service, port } = setup();

    await expect(
      service.evidenceFile(owner, "member-1", "file-1"),
    ).resolves.toEqual(storedFile);
    expect(port.evidenceFileForOwners).toHaveBeenCalledWith("file-1", [
      "user-1",
    ]);
  });

  it("answers a foreign member and a missing file with the same refusal", async () => {
    const foreignMember = await codeOf(
      setup({ member: null }).service.evidenceFile(owner, "member-9", "file-1"),
    );

    const missingFile = await codeOf(
      setup({ evidence: null }).service.evidenceFile(
        owner,
        "member-1",
        "file-9",
      ),
    );

    expect(foreignMember).toEqual({
      status: 404,
      code: AssociationMessageCode.FILE_NOT_FOUND,
    });
    expect(missingFile).toEqual(foreignMember);
  });

  it("refuses a file whose activity no requirement of this association reaches", async () => {
    const { service, attributionFindFirst } = setup({ attribution: null });

    await expect(
      codeOf(service.evidenceFile(owner, "member-1", "file-1")),
    ).resolves.toEqual({
      status: 404,
      code: AssociationMessageCode.FILE_NOT_FOUND,
    });
    expect(attributionFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ activityId: "act-1" }),
      }),
    );
  });

  it("refuses an administrator before it reads anything at all", async () => {
    const { service, access, port } = setup();

    await expect(
      codeOf(
        service.evidenceFile(
          { id: "admin-1", role: Role.ADMIN },
          "member-1",
          "file-1",
        ),
      ),
    ).resolves.toEqual({
      status: 403,
      code: AssociationMessageCode.FILE_NOT_PERMITTED,
    });
    expect(access.requireOwned).not.toHaveBeenCalled();
    expect(port.evidenceFileForOwners).not.toHaveBeenCalled();
  });

  it("scopes a certificate file to the member who owns it", async () => {
    const { service, port } = setup();

    await expect(
      service.certificateFile(owner, "member-1", "file-1"),
    ).resolves.toEqual(expect.objectContaining({ sourceId: "cert-1" }));
    expect(port.certificateFileForOwners).toHaveBeenCalledWith("file-1", [
      "user-1",
    ]);
  });

  it("refuses a certificate file that is not the member's", async () => {
    const { service } = setup({ certificate: null });

    await expect(
      codeOf(service.certificateFile(owner, "member-1", "file-1")),
    ).resolves.toEqual({
      status: 404,
      code: AssociationMessageCode.FILE_NOT_FOUND,
    });
  });
});
