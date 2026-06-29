import { AdminDashboardGqlObjectNames } from "@admin/enums/gql-names.enum";
import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType(AdminDashboardGqlObjectNames.ADMIN_CHART_POINT)
export class AdminChartPointEntity {
  @Field() label: string;
  @Field(() => Int) total: number;
  @Field(() => Int) providers: number;
  @Field(() => Int) professionals: number;
  @Field(() => String, { nullable: true }) date?: string | null;
}
