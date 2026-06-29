import { IsBoolean, IsEnum, IsString, MaxLength } from "class-validator";
import { UserGqlInputNames } from "@user/enums/gql-names.enum";
import { Field, InputType } from "@nestjs/graphql";
import { Role, UserStatus } from "@prisma/client";
import { IsOptional } from "class-validator";

@InputType(UserGqlInputNames.USER_FILTER)
export class UserFilterInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @Field(() => Role, { nullable: true })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @Field(() => UserStatus, { nullable: true })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  includeDeleted?: boolean = false;
}
