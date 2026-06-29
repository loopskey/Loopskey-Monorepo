import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";
import { ContentType, PaymentStatus } from "@prisma/client";
import { ProfessionalGqlObjectNames } from "@professional/enums/gql-names.enum";
import { PageInfoEntity } from "@professional/entities/page-info.entity";

@ObjectType(ProfessionalGqlObjectNames.PROFESSIONAL_PAYMENT)
export class ProfessionalPaymentEntity {
  @Field() title: string;
  @Field() updatedAt: Date;
  @Field() createdAt: Date;
  @Field() currency: string;
  @Field(() => ID) id: string;
  @Field(() => ID) userId: string;
  @Field(() => Float) amount: number;
  @Field(() => PaymentStatus) status: PaymentStatus;
  @Field(() => Date, { nullable: true }) paidAt?: Date | null;
  @Field(() => String, { nullable: true }) contentId?: string | null;
  @Field(() => String, { nullable: true }) receiptUrl?: string | null;
  @Field(() => String, { nullable: true }) providerPaymentId?: string | null;
  @Field(() => ContentType, { nullable: true })
  contentType?: ContentType | null;
}

@ObjectType(ProfessionalGqlObjectNames.PAGINATED_PROFESSIONAL_PAYMENTS)
export class PaginatedProfessionalPaymentsEntity {
  @Field(() => Int) totalCount: number;
  @Field(() => Float) totalSpent: number;
  @Field(() => Int) totalTransactions: number;
  @Field(() => PageInfoEntity) pageInfo: PageInfoEntity;
  @Field(() => [ProfessionalPaymentEntity]) items: ProfessionalPaymentEntity[];
}
