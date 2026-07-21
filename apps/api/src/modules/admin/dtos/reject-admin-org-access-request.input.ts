import { IsString, MaxLength, MinLength } from "class-validator";
import { Field, InputType } from "@nestjs/graphql";
import { Transform } from "class-transformer";

@InputType()
export class RejectAdminOrgAccessRequestInput {
  @Field()
  @IsString()
  @MinLength(1)
  requestId!: string;

  @Field()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value,
  )
  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  reason!: string;
}
