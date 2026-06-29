import { IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { Field, Float, InputType } from "@nestjs/graphql";
import { ProviderGqlInputNames } from "@provider/enums/gql-names.enum";
import { PromotionType } from "@prisma/client";

@InputType(ProviderGqlInputNames.SUBMIT_PROMOTION_REQUEST_INPUT)
export class SubmitPromotionRequestInput {
  @Field()
  @IsString()
  eventId: string;

  @Field(() => PromotionType)
  @IsEnum(PromotionType)
  promotionType: PromotionType;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  budget?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  note?: string;
}
