import { ExternalLearningGqlObjectNames } from "@ext/enums/gql-names.enum";
import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType(ExternalLearningGqlObjectNames.EXTERNAL_LEARNING_ACTION_RESPONSE)
export class ExternalLearningActionResponseEntity {
  @Field() code: string;
  @Field() message: string;
  @Field() success: boolean;
}
