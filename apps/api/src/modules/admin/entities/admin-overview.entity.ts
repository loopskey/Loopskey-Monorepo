import { AdminDashboardGqlObjectNames } from "@admin/enums/gql-names.enum";
import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType(AdminDashboardGqlObjectNames.ADMIN_REQUEST_TREND_POINT)
export class AdminRequestTrendPointEntity {
  @Field() date: string;
  @Field(() => Int) count: number;
}

@ObjectType(AdminDashboardGqlObjectNames.ADMIN_DASHBOARD_OVERVIEW)
export class AdminDashboardOverviewEntity {
  @Field(() => Int) totalRequests: number;
  @Field(() => Int) pendingRequests: number;
  @Field(() => Int) approvedRequests: number;
  @Field(() => Int) rejectedRequests: number;
  @Field(() => [AdminRequestTrendPointEntity])
  requestTrend: AdminRequestTrendPointEntity[];
}
