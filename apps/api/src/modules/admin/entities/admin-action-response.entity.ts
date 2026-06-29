import { AdminDashboardGqlObjectNames } from "@admin/enums/gql-names.enum";
import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType(AdminDashboardGqlObjectNames.ADMIN_ACTION_RESPONSE)
export class AdminActionResponseEntity {
  @Field() code: string;
  @Field() message: string;
  @Field() success: boolean;
}
