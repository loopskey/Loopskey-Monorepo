import { IsEmail, IsEnum, IsString } from "class-validator";
import { AuthGqlInputNames } from "@auth/enums/gql-names.enum";
import { Field, InputType } from "@nestjs/graphql";
import { AuthRegisterRole } from "@auth/enums/register-role.enum";

@InputType(AuthGqlInputNames.REGISTER)
export class RegisterInput {
  @Field(() => String) @IsEmail() email!: string;
  @Field(() => String) @IsString() password!: string;
  @Field(() => String) @IsString() fullName!: string;
  @Field(() => String) @IsString() confirmPassword!: string;
  @Field(() => AuthRegisterRole)
  @IsEnum(AuthRegisterRole)
  role!: AuthRegisterRole;
}
