import { IsEmail, IsEnum, IsString, IsUrl, MaxLength } from "class-validator";
import { IsOptional, IsPhoneNumber } from "class-validator";
import { UserGqlInputNames } from "@user/enums/gql-names.enum";
import { Role, UserStatus } from "@prisma/client";
import { Field, InputType } from "@nestjs/graphql";

@InputType(UserGqlInputNames.UPDATE_USER)
export class UpdateUserInput {
  @Field(() => String)
  @IsString()
  userId!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsPhoneNumber()
  @MaxLength(30)
  phone?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  firstName?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  lastName?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  fullName?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  avatarUrl?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;

  @Field(() => Role, { nullable: true })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @Field(() => UserStatus, { nullable: true })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
