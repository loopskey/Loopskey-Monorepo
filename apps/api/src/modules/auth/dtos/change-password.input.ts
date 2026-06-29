import { IsString, MaxLength, MinLength } from "class-validator";
import { AuthGqlInputNames } from "@auth/enums/gql-names.enum";
import { Field, InputType } from "@nestjs/graphql";

@InputType(AuthGqlInputNames.CHANGE_PASSWORD)
export class ChangePasswordInput {
  @Field(() => String)
  @IsString()
  @MaxLength(100)
  currentPassword!: string;

  @Field(() => String)
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  newPassword!: string;

  @Field(() => String)
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  confirmPassword!: string;
}
