import { ProfessionalGqlObjectNames } from "@professional/enums/gql-names.enum";
import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType(ProfessionalGqlObjectNames.PAGE_INFO)
export class PageInfoEntity {
  @Field() hasNextPage: boolean;
  @Field(() => String, { nullable: true }) nextCursor?: string | null;
}
