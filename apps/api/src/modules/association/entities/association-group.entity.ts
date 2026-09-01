import { AssociationGqlObjectNames } from "@association/enums/association-gql-names.enum";
import { Field, ID, Int, ObjectType } from "@nestjs/graphql";

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_GROUP)
export class AssociationGroupEntity {
  @Field() title: string;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
  @Field() isActive: boolean;
  @Field(() => ID) id: string;
  @Field(() => Int) memberCount: number;
  @Field(() => String, { nullable: true }) description: string | null;
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_MEMBER_GROUP)
export class AssociationMemberGroupEntity {
  @Field() title: string;
  @Field() isActive: boolean;
  @Field(() => ID) id: string;
}
