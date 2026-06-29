import { IsEmail, IsEnum, IsString, MaxLength } from "class-validator";
import { AuthGqlInputNames } from "@auth/enums/gql-names.enum";
import { Field, InputType } from "@nestjs/graphql";
import { IsOptional } from "class-validator";
import { Role } from "@prisma/client";

@InputType(AuthGqlInputNames.LOGIN)
export class LoginInput {
  @Field(() => String) @IsEmail() @MaxLength(255) email!: string;
  @Field(() => String) @IsString() @MaxLength(100) password!: string;
  @Field(() => Role, { nullable: true })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
