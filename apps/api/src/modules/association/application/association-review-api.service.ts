import { OrganizationAccessRequestStatus, Prisma, Role } from "@prisma/client";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { ConflictException, Inject, Injectable } from "@nestjs/common";
import { type IdentityProfileApi } from "@user/public/identity-profile-api";
import { IDENTITY_PROFILE_API } from "@user/public/identity-profile-api";
import { PrismaService } from "@prisma/prisma.service";

import type { AssociationReviewApi } from "@association/public/association-review-api";

@Injectable()
export class AssociationReviewApiService implements AssociationReviewApi {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(IDENTITY_PROFILE_API)
    private readonly identityApi: IdentityProfileApi,
  ) {}

  async approve(requestId: string, reviewerId: string, atomicContext: object) {
    const tx = atomicContext as Prisma.TransactionClient;
    const request = await tx.organizationAccessRequest.findUnique({
      where: { id: requestId },
    });
    if (!request)
      throw new NotFoundException("Association access request not found.");
    if (request.targetRole !== Role.ASSOCIATION)
      throw new ConflictException({
        code: "AccessRequestRoleMismatch",
        message: "This request does not target an association account.",
      });
    if (request.status !== OrganizationAccessRequestStatus.PENDING)
      throw new ConflictException({
        code: "OrgAccessRequestAlreadyReviewed",
        message: "This association access request has already been reviewed.",
      });
    this.assertValidRequest(request);
    const claim = await tx.organizationAccessRequest.updateMany({
      where: { id: requestId, status: OrganizationAccessRequestStatus.PENDING },
      data: {
        status: OrganizationAccessRequestStatus.APPROVED,
        reviewedById: reviewerId,
        reviewedAt: new Date(),
        rejectReason: null,
      },
    });
    if (claim.count !== 1)
      throw new ConflictException({
        code: "OrgAccessRequestAlreadyReviewed",
        message:
          "This association access request was reviewed by another admin.",
      });
    const owner = await this.identityApi.resolveAssociationOwner({
      email: request.workEmail,
      fullName: request.representativeFullName,
      atomicContext: tx,
    });
    const association = await tx.association.create({
      data: {
        ownerId: owner.id,
        name: request.organizationName.trim(),
        country: request.country.trim(),
        contactEmail: request.workEmail,
        settings: { create: {} },
      },
      select: { id: true },
    });
    const approved = await tx.organizationAccessRequest.update({
      where: { id: requestId },
      data: { approvedUserId: owner.id },
      include: { reviewedBy: { select: { email: true, fullName: true } } },
    });
    const { reviewedBy, ...detail } = approved;
    return {
      result: {
        ...detail,
        reviewedByName: reviewedBy?.fullName ?? reviewedBy?.email ?? null,
      },
      workEmail: request.workEmail.trim().toLowerCase(),
      associationId: association.id,
      approvedUserId: owner.id,
      linkedExistingUser: owner.linkedExisting,
    };
  }

  async reject(
    requestId: string,
    reviewerId: string,
    reason: string,
    atomicContext: object,
  ) {
    const tx = atomicContext as Prisma.TransactionClient;
    const request = await tx.organizationAccessRequest.findUnique({
      where: { id: requestId },
    });
    if (!request)
      throw new NotFoundException("Association access request not found.");
    if (request.targetRole !== Role.ASSOCIATION)
      throw new ConflictException({
        code: "AccessRequestRoleMismatch",
        message: "This request does not target an association account.",
      });
    if (request.status !== OrganizationAccessRequestStatus.PENDING)
      throw new ConflictException({
        code: "OrgAccessRequestAlreadyReviewed",
        message: "This association access request has already been reviewed.",
      });
    const claim = await tx.organizationAccessRequest.updateMany({
      where: { id: requestId, status: OrganizationAccessRequestStatus.PENDING },
      data: {
        status: OrganizationAccessRequestStatus.REJECTED,
        reviewedById: reviewerId,
        reviewedAt: new Date(),
        rejectReason: reason,
      },
    });
    if (claim.count !== 1)
      throw new ConflictException({
        code: "OrgAccessRequestAlreadyReviewed",
        message:
          "This association access request was reviewed by another admin.",
      });
    const rejected = await tx.organizationAccessRequest.findUniqueOrThrow({
      where: { id: requestId },
      include: { reviewedBy: { select: { email: true, fullName: true } } },
    });
    const { reviewedBy, ...detail } = rejected;
    return {
      result: {
        ...detail,
        reviewedByName: reviewedBy?.fullName ?? reviewedBy?.email ?? null,
      },
    };
  }

  private assertValidRequest(request: {
    country: string;
    goals: string;
    organizationName: string;
    representativeFullName: string;
    representativeJobRole: string;
    workEmail: string;
    expectedLicensedProfessionals: number;
  }) {
    const required = [
      request.country,
      request.goals,
      request.organizationName,
      request.representativeFullName,
      request.representativeJobRole,
      request.workEmail,
    ];
    if (
      required.some((value) => value.trim().length === 0) ||
      !request.workEmail.includes("@") ||
      request.expectedLicensedProfessionals < 1
    )
      throw new BadRequestException({
        code: "OrgAccessRequestInvalid",
        message: "The association access request contains invalid data.",
      });
  }
}
