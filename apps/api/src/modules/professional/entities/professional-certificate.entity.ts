import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";
import { CertificateStatus, ContentType } from "@prisma/client";
import { ProfessionalGqlObjectNames } from "@professional/enums/gql-names.enum";
import { PageInfoEntity } from "@professional/entities/page-info.entity";

@ObjectType(ProfessionalGqlObjectNames.PROFESSIONAL_CERTIFICATE_FILE)
export class ProfessionalCertificateFileEntity {
  @Field() createdAt: Date;
  @Field() fileName: string;
  @Field() mimeType: string;
  @Field(() => ID) id: string;
  @Field(() => Int) sizeBytes: number;
}

@ObjectType(ProfessionalGqlObjectNames.PROFESSIONAL_CERTIFICATE)
export class ProfessionalCertificateEntity {
  @Field() title: string;
  @Field() issuedAt: Date;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
  @Field(() => ID) id: string;
  @Field(() => ID) userId: string;
  @Field() verificationCode: string;
  @Field(() => Float) pduEarned: number;
  @Field(() => CertificateStatus) status: CertificateStatus;
  @Field(() => ID, { nullable: true }) cpdPlanId?: string | null;
  @Field(() => Date, { nullable: true }) validUntil?: Date | null;
  @Field(() => String, { nullable: true }) issuer?: string | null;
  @Field(() => String, { nullable: true }) contentId?: string | null;
  @Field(() => String, { nullable: true }) cpdPlanName?: string | null;
  @Field(() => String, { nullable: true }) certificateUrl?: string | null;
  @Field(() => String, { nullable: true }) certificateNumber?: string | null;
  @Field(() => ContentType, { nullable: true })
  contentType?: ContentType | null;
  @Field(() => [ProfessionalCertificateFileEntity])
  evidenceFiles: ProfessionalCertificateFileEntity[];
}

@ObjectType(ProfessionalGqlObjectNames.PROFESSIONAL_CERTIFICATE_SUMMARY)
export class ProfessionalCertificateSummaryEntity {
  @Field(() => Int) total: number;
  @Field(() => Int) active: number;
  @Field(() => Int) expired: number;
  @Field(() => Int) expiringSoon: number;
}

@ObjectType(ProfessionalGqlObjectNames.PROFESSIONAL_CERTIFICATE_OPTION)
export class ProfessionalCertificateOptionEntity {
  @Field() title: string;
  @Field(() => ID) id: string;
  @Field(() => CertificateStatus) status: CertificateStatus;
  @Field(() => String, { nullable: true }) issuer?: string | null;
  @Field(() => Date, { nullable: true }) validUntil?: Date | null;
}

@ObjectType(ProfessionalGqlObjectNames.PAGINATED_PROFESSIONAL_CERTIFICATES)
export class PaginatedProfessionalCertificatesEntity {
  @Field(() => Int) totalCount: number;
  @Field(() => Float) totalPdusEarned: number;
  @Field(() => Int) totalCertificates: number;
  @Field(() => Int) activeCertificates: number;
  @Field(() => PageInfoEntity) pageInfo: PageInfoEntity;
  @Field(() => [ProfessionalCertificateEntity])
  items: ProfessionalCertificateEntity[];
}
