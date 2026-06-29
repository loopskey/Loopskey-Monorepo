import { ContentInteractionGqlObjectNames } from "@contentAction/enums/gql-names.enum";
import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType(ContentInteractionGqlObjectNames.CONTENT_ACTION_PAYLOAD)
export class ContentActionPayloadEntity {
  @Field() code: string;
  @Field() message: string;
  @Field() success: boolean;
  @Field(() => Boolean, { nullable: true }) active?: boolean | null;
}
