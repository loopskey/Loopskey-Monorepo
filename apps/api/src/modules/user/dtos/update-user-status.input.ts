import { UserGqlInputNames } from "@user/enums/gql-names.enum";
import { IsEnum, IsString } from "class-validator";
import { Field, InputType } from "@nestjs/graphql";
import { UserStatus } from "@prisma/client";

@InputType(UserGqlInputNames.UPDATE_USER_STATUS)
export class UpdateUserStatusInput {
  @Field(() => String) @IsString() userId!: string;
  @Field(() => UserStatus) @IsEnum(UserStatus) status!: UserStatus;
}
