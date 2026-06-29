import { PromotionRequestStatus, PromotionType } from "@prisma/client";
import { Field, Float, ID, ObjectType } from "@nestjs/graphql";
import { ProviderGqlObjectNames } from "@provider/enums/gql-names.enum";

@ObjectType(ProviderGqlObjectNames.PROMOTION_REQUEST)
export class PromotionRequestEntity {
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
  @Field() eventTitle: string;
  @Field(() => ID) id: string;
  @Field(() => ID) eventId: string;
  @Field(() => ID) providerId: string;
  @Field(() => PromotionType) promotionType: PromotionType;
  @Field(() => String, { nullable: true }) note?: string | null;
  @Field(() => Float, { nullable: true }) budget?: number | null;
  @Field(() => PromotionRequestStatus) status: PromotionRequestStatus;
  @Field(() => String, { nullable: true }) rejectReason?: string | null;
}
