import { AssociationGqlObjectNames } from "@association/enums/association-gql-names.enum";
import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_MEMBER_STATS)
export class AssociationMemberStatsEntity {
  @Field(() => Int) totalMembers: number;
  @Field(() => Int) activeMembers: number;
  @Field(() => Int) pendingActivation: number;
}
