import { AssociationMemberFileService } from "@association/services/association-member-file.service";
import { AssociationComplianceService } from "@association/services/association-compliance.service";
import { AssociationMemberProfileService } from "@association/services/association-member-profile.service";
import { AssociationEvidencePolicy } from "@prisma/client";
import { AssociationRequirementStatus } from "@prisma/client";
import { AssociationAudienceKind } from "@prisma/client";
import { AssociationMemberStatus } from "@prisma/client";
import { CreditType, PDUCategory, PDUSource, Role } from "@prisma/client";
import { INestApplication } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { bootApp, suiteScope } from "../setup/concurrency";

const scope = suiteScope("association-member-files");

const REQUIRED_CREDITS = 10;

const day = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

describe("Association member file downloads (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let files: AssociationMemberFileService;
  let profiles: AssociationMemberProfileService;
  let compliance: AssociationComplianceService;

  let ownerId: string;
  let otherOwnerId: string;
  let memberUserId: string;
  let otherMemberUserId: string;
  let memberId: string;
  let otherMemberId: string;
  let assignmentId: string;
  let activityId: string;
  let evidenceFileId: string;
  let foreignFileId: string;
  let certificateFileId: string;

  const owner = () => ({ id: ownerId, role: Role.ASSOCIATION });
  const otherOwner = () => ({ id: otherOwnerId, role: Role.ASSOCIATION });

  const refusal = async (act: Promise<unknown>) => {
    try {
      await act;
      return null;
    } catch (error) {
      return {
        status: (error as { getStatus: () => number }).getStatus(),
        code: (error as { getResponse: () => { code: string } }).getResponse()
          .code,
      };
    }
  };

  const buildAssociation = async (label: string, ownerUserId: string) =>
    prisma.association.create({
      data: {
        name: scope.eventTitle(label),
        ownerId: ownerUserId,
        settings: { create: { onTrackThreshold: 70, atRiskThreshold: 40 } },
      },
    });

  beforeAll(async () => {
    ({ app, prisma } = await bootApp());
    files = app.get(AssociationMemberFileService);
    profiles = app.get(AssociationMemberProfileService);
    compliance = app.get(AssociationComplianceService);
    await scope.cleanup(prisma);

    const ownerUser = await prisma.user.create({
      data: {
        email: scope.email("files-owner"),
        role: Role.ASSOCIATION,
        status: "ACTIVE",
      },
    });
    ownerId = ownerUser.id;

    const otherOwnerUser = await prisma.user.create({
      data: {
        email: scope.email("files-other-owner"),
        role: Role.ASSOCIATION,
        status: "ACTIVE",
      },
    });
    otherOwnerId = otherOwnerUser.id;

    const memberUser = await prisma.user.create({
      data: {
        email: scope.email("files-member"),
        role: Role.PROFESSIONAL,
        status: "ACTIVE",
        fullName: "A Member",
      },
    });
    memberUserId = memberUser.id;

    const otherMemberUser = await prisma.user.create({
      data: {
        email: scope.email("files-other-member"),
        role: Role.PROFESSIONAL,
        status: "ACTIVE",
        fullName: "Another Member",
      },
    });
    otherMemberUserId = otherMemberUser.id;

    const association = await buildAssociation("files-association", ownerId);
    const otherAssociation = await buildAssociation(
      "files-other-association",
      otherOwnerId,
    );

    const member = await prisma.associationMember.create({
      data: {
        associationId: association.id,
        userId: memberUserId,
        status: AssociationMemberStatus.ACTIVE,
      },
    });
    memberId = member.id;

    const otherMember = await prisma.associationMember.create({
      data: {
        associationId: otherAssociation.id,
        userId: otherMemberUserId,
        status: AssociationMemberStatus.ACTIVE,
      },
    });
    otherMemberId = otherMember.id;

    const requirement = await prisma.associationRequirement.create({
      data: {
        associationId: association.id,
        createdById: ownerId,
        name: scope.eventTitle("files-requirement"),
        creditType: CreditType.CPD,
        totalRequiredCredits: REQUIRED_CREDITS,
        deadline: day("2026-12-31"),
        reportingStart: day("2026-01-01"),
        reportingEnd: day("2026-12-31"),
        evidencePolicy: AssociationEvidencePolicy.REQUIRED_NEEDS_REVIEW,
        audienceKind: AssociationAudienceKind.ALL_MEMBERS,
        status: AssociationRequirementStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });

    const created = await prisma.associationRequirementAssignment.create({
      data: {
        requirementId: requirement.id,
        memberId,
        cycleStart: day("2026-01-01"),
        dueDate: day("2026-12-31"),
      },
    });
    assignmentId = created.id;

    const activity = await prisma.pDUActivity.create({
      data: {
        userId: memberUserId,
        title: scope.eventTitle("files-activity"),
        date: day("2026-06-01"),
        pdus: REQUIRED_CREDITS,
        source: PDUSource.OTHER,
        category: PDUCategory.TECHNICAL,
        creditType: CreditType.CPD,
      },
    });
    activityId = activity.id;

    const evidence = await prisma.pDUActivityFile.create({
      data: {
        activityId,
        userId: memberUserId,
        fileName: "proof.pdf",
        storageKey: "association-e2e-proof.pdf",
        mimeType: "application/pdf",
        sizeBytes: 12,
      },
    });
    evidenceFileId = evidence.id;

    const foreignActivity = await prisma.pDUActivity.create({
      data: {
        userId: otherMemberUserId,
        title: scope.eventTitle("files-foreign-activity"),
        date: day("2026-06-01"),
        pdus: REQUIRED_CREDITS,
        source: PDUSource.OTHER,
        category: PDUCategory.TECHNICAL,
        creditType: CreditType.CPD,
      },
    });

    const foreign = await prisma.pDUActivityFile.create({
      data: {
        activityId: foreignActivity.id,
        userId: otherMemberUserId,
        fileName: "foreign.pdf",
        storageKey: "association-e2e-foreign.pdf",
        mimeType: "application/pdf",
        sizeBytes: 12,
      },
    });
    foreignFileId = foreign.id;

    const certificate = await prisma.certificate.create({
      data: {
        userId: memberUserId,
        title: scope.eventTitle("files-certificate"),
        verificationCode: scope.eventSlug("files-certificate"),
        issuedAt: day("2026-03-01"),
        pduEarned: 5,
      },
    });

    const certificateFile = await prisma.certificateFile.create({
      data: {
        certificateId: certificate.id,
        userId: memberUserId,
        fileName: "certificate.pdf",
        storageKey: "association-e2e-certificate.pdf",
        mimeType: "application/pdf",
        sizeBytes: 12,
      },
    });
    certificateFileId = certificateFile.id;

    await compliance.recomputeAssignment(assignmentId);
  });

  afterAll(async () => {
    await prisma.associationCreditAttribution.deleteMany({
      where: { assignmentId },
    });
    await scope.cleanup(prisma);
    await app.close();
  });

  it("hands its own member's evidence to the association that required it", async () => {
    const stored = await files.evidenceFile(owner(), memberId, evidenceFileId);

    expect(stored.file).toEqual(
      expect.objectContaining({ fileName: "proof.pdf", sizeBytes: 12 }),
    );
    expect(stored.sourceId).toBe(activityId);
    expect(JSON.stringify(stored.file)).not.toContain("storageKey");
  });

  it("refuses another association's member file exactly as it refuses a missing one", async () => {
    const foreign = await refusal(
      files.evidenceFile(owner(), otherMemberId, foreignFileId),
    );
    const missing = await refusal(
      files.evidenceFile(owner(), memberId, "no-such-file"),
    );

    expect(foreign).toEqual({
      status: 404,
      code: "ASSOCIATION_FILE_NOT_FOUND",
    });
    expect(missing).toEqual(foreign);
  });

  it("refuses a file id from another association even when the member id is its own", async () => {
    await expect(
      refusal(files.evidenceFile(owner(), memberId, foreignFileId)),
    ).resolves.toEqual({ status: 404, code: "ASSOCIATION_FILE_NOT_FOUND" });
  });

  it("refuses the file to an association that does not have this member", async () => {
    await expect(
      refusal(files.evidenceFile(otherOwner(), memberId, evidenceFileId)),
    ).resolves.toEqual({ status: 404, code: "ASSOCIATION_FILE_NOT_FOUND" });
  });

  it("refuses an administrator, who may look but not download", async () => {
    await expect(
      refusal(
        files.evidenceFile(
          { id: "admin-1", role: Role.ADMIN },
          memberId,
          evidenceFileId,
        ),
      ),
    ).resolves.toEqual({ status: 403, code: "ASSOCIATION_FILE_NOT_PERMITTED" });
  });

  it("hands over a certificate file the member owns, and refuses one they do not", async () => {
    const stored = await files.certificateFile(
      owner(),
      memberId,
      certificateFileId,
    );

    expect(stored.file.fileName).toBe("certificate.pdf");

    await expect(
      refusal(files.certificateFile(owner(), otherMemberId, certificateFileId)),
    ).resolves.toEqual({ status: 404, code: "ASSOCIATION_FILE_NOT_FOUND" });
  });

  it("lists the member's activity with its evidence descriptor and no storage key", async () => {
    const page = await profiles.activities(owner(), memberId);

    expect(page.items).toHaveLength(1);
    expect(page.items[0]).toEqual(
      expect.objectContaining({
        id: activityId,
        hasEvidence: true,
        files: [expect.objectContaining({ fileName: "proof.pdf" })],
      }),
    );
    expect(JSON.stringify(page.items)).not.toContain("storageKey");
  });

  it("reaches no activity of a member in another association", async () => {
    await expect(
      refusal(profiles.activities(owner(), otherMemberId)),
    ).resolves.toEqual({
      status: 404,
      code: "ASSOCIATION_MEMBER_NOT_FOUND",
    });
  });
});
