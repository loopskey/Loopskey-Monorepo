import { PromotionRequestStatus, PromotionType } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { ProviderGqlInputNames } from "@provider/enums/gql-names.enum";
import { Field, InputType } from "@nestjs/graphql";

@InputType(ProviderGqlInputNames.PROVIDER_PROMOTION_FILTER_INPUT)
export class ProviderPromotionFilterInput {
  @Field({ nullable: true }) @IsOptional() @IsString() search?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() eventId?: string;

  @Field(() => PromotionRequestStatus, { nullable: true })
  @IsOptional()
  @IsEnum(PromotionRequestStatus)
  status?: PromotionRequestStatus;

  @Field(() => PromotionType, { nullable: true })
  @IsOptional()
  @IsEnum(PromotionType)
  promotionType?: PromotionType;
}
