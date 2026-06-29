import { AuthGqlObjectNames } from "@auth/enums/gql-names.enum";
import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType(AuthGqlObjectNames.AUTH_URL)
export class OAuthUrlEntity {
  @Field() url: string;
}
