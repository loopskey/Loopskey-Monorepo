import { AuthGqlObjectNames } from "@auth/enums/gql-names.enum";
import { Field, ObjectType } from "@nestjs/graphql";
import { AuthMessageCode } from "@auth/enums/message-code.enum";
import { AuthUserEntity } from "@auth/entities/auth-user.entity";

@ObjectType(AuthGqlObjectNames.AUTH_PAYLOAD)
export class AuthPayloadEntity {
  @Field(() => String) message!: string;
  @Field(() => Boolean) success!: boolean;
  @Field(() => String) code!: AuthMessageCode;
  @Field(() => AuthUserEntity, { nullable: true }) user?: AuthUserEntity | null;
}
