import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { CertificateStatus, Prisma, Role } from "@prisma/client";
import { SetCertificateCpdPlanInput } from "@professional/dtos/set-certificate-cpd-plan.input";
import { resolveCertificateStatus } from "@professional/utils/certificate-status.util";
import { ProfessionalMessageCode } from "@professional/enums/message-code.enum";
import { CertificateStatusFilter } from "@professional/enums/certificate.enum";
import { CreateCertificateInput } from "@professional/dtos/create-certificate.input";
import { UpdateCertificateInput } from "@professional/dtos/update-certificate.input";
import { certificateStatusWhere } from "@professional/utils/certificate-status.util";
import { isExpiryOnOrAfterIssue } from "@loopskey/api-contracts/validation";
import { CertificateSort } from "@professional/enums/certificate.enum";
import { PrismaService } from "@prisma/prisma.service";
import { randomUUID } from "crypto";
import { unlink } from "fs/promises";
import { TUser } from "@common/types/user.types";
import { join } from "path";

import * as C from "@professional/enums/certificate-file.constant";
import * as T from "@professional/types/professional-certificate.types";

@Injectable()
export class ProfessionalCertificatesService {
  private readonly logger = new Logger(ProfessionalCertificatesService.name);

  constructor(private readonly prismaService: PrismaService) {}

  private assertProfessional(user: TUser) {
    if (user.role !== Role.PROFESSIONAL && user.role !== Role.ADMIN)
      throw new ForbiddenException(
        ProfessionalMessageCode.PROFESSIONAL_ACCESS_REQUIRED,
      );
  }

  private mapCertificate(row: T.CertificateRow, now: Date) {
    return {
      ...row,
      status: resolveCertificateStatus(row.status, row.validUntil, now),
      cpdPlanName: row.cpdPlan?.certificationName ?? null,
      evidenceFiles: row.evidenceFiles,
    };
  }

  private async buildData(
    user: TUser,
    input: Pick<
      CreateCertificateInput,
      "title" | "issuer" | "certificateNumber" | "issueDate" | "validUntil"
    > & { cpdPlanId?: string | null },
  ) {
    const issuedAt = new Date(input.issueDate);
    const validUntil = new Date(input.validUntil);

    // Same predicate the browser form uses, so the two cannot drift apart.
    if (!isExpiryOnOrAfterIssue(input.issueDate, input.validUntil))
      throw new BadRequestException(
        ProfessionalMessageCode.CERTIFICATE_EXPIRY_BEFORE_ISSUE,
      );

    if (input.cpdPlanId) await this.assertPlanOwned(user, input.cpdPlanId);

    return {
      title: input.title,
      issuer: input.issuer,
      certificateNumber: input.certificateNumber ?? null,
      issuedAt,
      validUntil,
      cpdPlanId: input.cpdPlanId ?? null,
    };
  }

  private async assertPlanOwned(user: TUser, planId: string) {
    const plan = await this.prismaService.cPDPlan.findFirst({
      where: { id: planId, userId: user.id },
      select: { id: true },
    });
    if (!plan)
      throw new BadRequestException(
        ProfessionalMessageCode.CERTIFICATE_CPD_PLAN_NOT_FOUND,
      );
    return plan;
  }

  private async findOwned(user: TUser, certificateId: string) {
    const certificate = await this.prismaService.certificate.findFirst({
      where: { id: certificateId, userId: user.id },
      include: T.certificateInclude,
    });
    if (!certificate)
      throw new NotFoundException(
        ProfessionalMessageCode.CERTIFICATE_NOT_FOUND,
      );
    return certificate;
  }

  async certificates(user: TUser, params: T.CertificateListParams = {}) {
    this.assertProfessional(user);
    const now = new Date();
    const take = params.pagination?.take ?? 12;
    const search = params.search?.trim();

    const and: Prisma.CertificateWhereInput[] = [];
    if (search)
      and.push({
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { issuer: { contains: search, mode: "insensitive" } },
          { certificateNumber: { contains: search, mode: "insensitive" } },
        ],
      });
    if (params.status) and.push(certificateStatusWhere(params.status, now));

    const issuer = params.issuer?.trim();
    if (issuer) and.push({ issuer });

    // "Not linked to any plan" and "linked to this plan" are mutually
    // exclusive, so an explicit unlinked request always wins.
    if (params.unlinkedOnly) and.push({ cpdPlanId: null });
    else if (params.cpdPlanId) and.push({ cpdPlanId: params.cpdPlanId });

    const where: Prisma.CertificateWhereInput = {
      userId: user.id,
      ...(and.length ? { AND: and } : {}),
    };

    const rows = await this.prismaService.certificate.findMany({
      where,
      take: take + 1,
      ...(params.pagination?.cursor
        ? { cursor: { id: params.pagination.cursor }, skip: 1 }
        : {}),
      orderBy: this.orderBy(params.sort),
      include: T.certificateInclude,
    });
    const items = rows.slice(0, take);

    const [totalCount, totalCertificates, activeCertificates, totalPdus] =
      await Promise.all([
        this.prismaService.certificate.count({ where }),
        this.prismaService.certificate.count({ where: { userId: user.id } }),
        this.prismaService.certificate.count({
          where: {
            userId: user.id,
            ...certificateStatusWhere(CertificateStatusFilter.ACTIVE, now),
          },
        }),
        this.prismaService.certificate.aggregate({
          where: { userId: user.id },
          _sum: { pduEarned: true },
        }),
      ]);

    return {
      items: items.map((row) => this.mapCertificate(row, now)),
      totalCount,
      totalCertificates,
      activeCertificates,
      totalPdusEarned: Number(totalPdus._sum.pduEarned ?? 0),
      pageInfo: {
        hasNextPage: rows.length > take,
        nextCursor: rows.length > take ? items.at(-1)?.id : null,
      },
    };
  }

  private orderBy(
    sort?: CertificateSort,
  ): Prisma.CertificateOrderByWithRelationInput {
    switch (sort) {
      case CertificateSort.OLDEST:
        return { createdAt: "asc" };
      case CertificateSort.EXPIRY_SOONEST:
        return { validUntil: { sort: "asc", nulls: "last" } };
      case CertificateSort.NAME:
        return { title: "asc" };
      case CertificateSort.RECENT:
      default:
        return { createdAt: "desc" };
    }
  }

  async certificate(user: TUser, id: string) {
    this.assertProfessional(user);
    const row = await this.findOwned(user, id);
    return this.mapCertificate(row, new Date());
  }

  async summary(user: TUser) {
    this.assertProfessional(user);
    const now = new Date();
    const base = { userId: user.id };
    const expiringSoonWhere = {
      ...base,
      ...certificateStatusWhere(CertificateStatusFilter.EXPIRING_SOON, now),
    };

    const [total, active, expiringSoon, expired, nextExpiring] =
      await Promise.all([
        this.prismaService.certificate.count({ where: base }),
        this.prismaService.certificate.count({
          where: {
            ...base,
            ...certificateStatusWhere(CertificateStatusFilter.ACTIVE, now),
          },
        }),
        this.prismaService.certificate.count({ where: expiringSoonWhere }),
        this.prismaService.certificate.count({
          where: {
            ...base,
            ...certificateStatusWhere(CertificateStatusFilter.EXPIRED, now),
          },
        }),
        // Owner-wide, so the card's date always belongs to the same set as its
        // count instead of whichever page the table happens to be showing.
        this.prismaService.certificate.findFirst({
          where: expiringSoonWhere,
          orderBy: { validUntil: "asc" },
          select: { validUntil: true },
        }),
      ]);

    return {
      total,
      active,
      expiringSoon,
      expired,
      nearestExpiry: nextExpiring?.validUntil ?? null,
    };
  }

  async options(user: TUser) {
    this.assertProfessional(user);
    const now = new Date();
    const rows = await this.prismaService.certificate.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: C.MAX_CERTIFICATE_OPTIONS,
      select: {
        id: true,
        title: true,
        issuer: true,
        validUntil: true,
        status: true,
      },
    });
    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      issuer: row.issuer,
      validUntil: row.validUntil,
      status: resolveCertificateStatus(row.status, row.validUntil, now),
    }));
  }

  /**
   * Distinct issuers owned by the caller, so the certificates toolbar can offer
   * a real issuer filter instead of guessing from the current page.
   */
  async issuers(user: TUser) {
    this.assertProfessional(user);
    const rows = await this.prismaService.certificate.findMany({
      where: { userId: user.id, issuer: { not: null } },
      distinct: ["issuer"],
      orderBy: { issuer: "asc" },
      take: C.MAX_CERTIFICATE_ISSUERS,
      select: { issuer: true },
    });
    return rows
      .map((row) => row.issuer?.trim())
      .filter((issuer): issuer is string => Boolean(issuer));
  }

  async create(user: TUser, input: CreateCertificateInput) {
    this.assertProfessional(user);
    const data = await this.buildData(user, input);
    const row = await this.prismaService.certificate.create({
      data: {
        ...data,
        userId: user.id,
        verificationCode: this.generateVerificationCode(),
        status: CertificateStatus.ACTIVE,
      },
      include: T.certificateInclude,
    });
    return this.mapCertificate(row, new Date());
  }

  async update(user: TUser, input: UpdateCertificateInput) {
    this.assertProfessional(user);
    const { id, ...rest } = input;
    await this.findOwned(user, id);
    const data = await this.buildData(user, rest);
    const row = await this.prismaService.certificate.update({
      where: { id },
      data: {
        title: data.title,
        issuer: data.issuer,
        certificateNumber: data.certificateNumber,
        issuedAt: data.issuedAt,
        validUntil: data.validUntil,
      },
      include: T.certificateInclude,
    });
    return this.mapCertificate(row, new Date());
  }

  async setCpdPlan(user: TUser, input: SetCertificateCpdPlanInput) {
    this.assertProfessional(user);
    await this.findOwned(user, input.certificateId);
    if (input.cpdPlanId) await this.assertPlanOwned(user, input.cpdPlanId);
    const row = await this.prismaService.certificate.update({
      where: { id: input.certificateId },
      data: { cpdPlanId: input.cpdPlanId ?? null },
      include: T.certificateInclude,
    });
    return this.mapCertificate(row, new Date());
  }

  async delete(user: TUser, certificateId: string) {
    this.assertProfessional(user);
    const certificate = await this.findOwned(user, certificateId);
    const storageKeys = await this.prismaService.certificateFile
      .findMany({
        where: { certificateId },
        select: { storageKey: true },
      })
      .then((files) => files.map((file) => file.storageKey));
    await this.prismaService.certificate.delete({
      where: { id: certificate.id },
    });
    await this.removeCertificateBlobs(storageKeys);
    return { id: certificate.id };
  }

  async removeCertificateBlobs(storageKeys: string[]) {
    const uploadDir = C.getCertificateUploadDir();
    await Promise.all(
      storageKeys.map(async (storageKey) => {
        try {
          await unlink(join(uploadDir, storageKey));
        } catch (error) {
          this.logger.warn(
            `Failed to remove certificate blob ${storageKey}: ${String(error)}`,
          );
        }
      }),
    );
  }

  private generateVerificationCode() {
    return `USR-${randomUUID()}`;
  }
}
