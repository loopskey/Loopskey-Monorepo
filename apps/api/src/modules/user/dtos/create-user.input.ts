import { IsEnum, IsOptional, IsPhoneNumber, MaxLength } from "class-validator";
import { IsEmail, IsString, IsUrl, MinLength } from "class-validator";
import { UserGqlInputNames } from "@user/enums/gql-names.enum";
import { Field, InputType } from "@nestjs/graphql";
import { Role, UserStatus } from "@prisma/client";

@InputType(UserGqlInputNames.CREATE_USER)
export class CreateUserInput {
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

  @Field(() => String)
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password!: string;

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

  @Field(() => Role, { nullable: true, defaultValue: Role.PROFESSIONAL })
  @IsOptional()
  @IsEnum(Role)
  role?: Role = Role.PROFESSIONAL;

  @Field(() => UserStatus, { nullable: true, defaultValue: UserStatus.PENDING })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus = UserStatus.PENDING;
}
