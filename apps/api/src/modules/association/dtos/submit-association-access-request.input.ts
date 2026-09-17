import { AssociationGqlInputNames } from "@association/enums/association-gql-names.enum";
import { IsEmail, IsInt, IsString, MaxLength } from "class-validator";
import { Min, MinLength } from "class-validator";
import { Field, InputType, Int } from "@nestjs/graphql";
import { ASSOCIATION_LIMITS } from "@loopskey/api-contracts/validation";
import { trimString } from "@common/utils/function-helper";
import { Transform } from "class-transformer";

@InputType(AssociationGqlInputNames.SUBMIT_ASSOCIATION_ACCESS_REQUEST)
export class SubmitAssociationAccessRequestInput {
  @Field(() => String)
  @Transform(trimString)
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  representativeFullName!: string;

  @Field(() => String)
  @Transform(trimString)
  @IsString()
  @MinLength(ASSOCIATION_LIMITS.nameMin)
  @MaxLength(ASSOCIATION_LIMITS.nameMax)
  associationName!: string;

  @Field(() => String)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(ASSOCIATION_LIMITS.emailMax)
  workEmail!: string;

  @Field(() => String)
  @Transform(trimString)
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  representativeJobRole!: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  expectedMembers!: number;

  @Field(() => String)
  @Transform(trimString)
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  country!: string;

  @Field(() => String)
  @Transform(trimString)
  @IsString()
  @MinLength(5)
  @MaxLength(2000)
  goals!: string;
}
