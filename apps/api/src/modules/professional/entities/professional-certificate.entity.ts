import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";
import { CertificateStatus, ContentType } from "@prisma/client";
import { ProfessionalGqlObjectNames } from "@professional/enums/gql-names.enum";
import { PageInfoEntity } from "@professional/entities/page-info.entity";

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
  @Field(() => Date, { nullable: true }) validUntil?: Date | null;
  @Field(() => String, { nullable: true }) issuer?: string | null;
  @Field(() => String, { nullable: true }) contentId?: string | null;
  @Field(() => String, { nullable: true }) certificateUrl?: string | null;
  @Field(() => ContentType, { nullable: true })
  contentType?: ContentType | null;
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
