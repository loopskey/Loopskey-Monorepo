import { ContentUrlGqlObjectNames } from "@contentUrl/enums/gql-names.enum";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { ContentUrlNamespace } from "@prisma/client";

import "@contentUrl/enums/content-url-register.enum";

@ObjectType(ContentUrlGqlObjectNames.SETTINGS)
export class ContentUrlSettingsEntity {
  @Field(() => ContentUrlNamespace) kind: ContentUrlNamespace;
  @Field(() => ID) contentId: string;
  @Field() slug: string;
  @Field(() => [String]) retiredSlugs: string[];
}

@ObjectType(ContentUrlGqlObjectNames.RESOLUTION)
export class ContentUrlResolutionEntity {
  @Field() slug: string;
}
