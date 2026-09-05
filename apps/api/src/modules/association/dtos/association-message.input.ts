import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
} from "class-validator";
import { AssociationAttentionSection } from "@association/enums/association-attention.enum";
import { AssociationGqlInputNames } from "@association/enums/association-gql-names.enum";
import { MESSAGE_BATCH_MAX } from "@association/services/association-message.service";
import { AssociationMessageType } from "@prisma/client";
import { Field, ID, InputType } from "@nestjs/graphql";
import { ValidateNested } from "class-validator";
import { Type } from "class-transformer";

@InputType(AssociationGqlInputNames.ASSOCIATION_MESSAGE_AUDIENCE)
export class AssociationMessageAudienceInput {
  @Field(() => AssociationAttentionSection)
  @IsEnum(AssociationAttentionSection)
  section!: AssociationAttentionSection;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  groupId?: string;

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MESSAGE_BATCH_MAX)
  @IsString({ each: true })
  memberIds?: string[];
}

@InputType(AssociationGqlInputNames.SEND_ASSOCIATION_MESSAGE)
export class SendAssociationMessageInput {
  @Field(() => AssociationMessageType)
  @IsEnum(AssociationMessageType)
  messageType!: AssociationMessageType;

  @Field(() => AssociationMessageAudienceInput)
  @ValidateNested()
  @Type(() => AssociationMessageAudienceInput)
  audience!: AssociationMessageAudienceInput;
}
