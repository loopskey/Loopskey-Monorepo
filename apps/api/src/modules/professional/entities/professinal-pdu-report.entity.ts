import { PDUCategory, PDUStatus, PDUSource, ContentType } from "@prisma/client";
import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import { ProfessionalGqlObjectNames } from "@professional/enums/gql-names.enum";
import { PageInfoEntity } from "@professional/entities/page-info.entity";

@ObjectType(ProfessionalGqlObjectNames.PROFESSIONAL_PDU_TARGET)
export class ProfessionalPduTargetEntity {
  @Field() id: string;
  @Field(() => Int) year: number;
  @Field(() => Float) target: number;
  @Field(() => PDUCategory) category: PDUCategory;
}

@ObjectType(ProfessionalGqlObjectNames.PROFESSIONAL_PDU_CATEGORY_SUMMARY)
export class ProfessionalPduCategorySummaryEntity {
  @Field(() => Float) pdus: number;
  @Field(() => PDUCategory) category: PDUCategory;
}

@ObjectType(ProfessionalGqlObjectNames.PROFESSIONAL_PDU_ACTIVITY)
export class ProfessionalPduActivityEntity {
  @Field() id: string;
  @Field() date: Date;
  @Field() title: string;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
  @Field(() => Float) pdus: number;
  @Field(() => PDUSource) source: PDUSource;
  @Field(() => PDUStatus) status: PDUStatus;
  @Field(() => PDUCategory) category: PDUCategory;
  @Field(() => String, { nullable: true }) contentId?: string | null;
  @Field(() => String, { nullable: true }) description?: string | null;
  @Field(() => String, { nullable: true }) evidenceUrl?: string | null;
  @Field(() => ContentType, { nullable: true })
  contentType?: ContentType | null;
}

@ObjectType(ProfessionalGqlObjectNames.PROFESSIONAL_PDU_REPORT)
export class ProfessionalPduReportEntity {
  @Field(() => Int) year: number;
  @Field(() => Int) activities: number;
  @Field(() => Float) totalPdus: number;
  @Field(() => Float) progressToGoal: number;
  @Field(() => Float) averagePerMonth: number;
  @Field(() => [ProfessionalPduTargetEntity])
  targets: ProfessionalPduTargetEntity[];
  @Field(() => [ProfessionalPduCategorySummaryEntity])
  byCategory: ProfessionalPduCategorySummaryEntity[];
}

@ObjectType(ProfessionalGqlObjectNames.PAGINATED_PROFESSIONAL_PDU_ACTIVITIES)
export class PaginatedProfessionalPduActivitiesEntity {
  @Field(() => Int) totalCount: number;
  @Field(() => PageInfoEntity) pageInfo: PageInfoEntity;
  @Field(() => [ProfessionalPduActivityEntity])
  items: ProfessionalPduActivityEntity[];
}
