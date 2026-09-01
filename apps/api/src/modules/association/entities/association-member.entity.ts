import { AssociationMemberGroupEntity } from "@association/entities/association-group.entity";
import { AssociationGqlObjectNames } from "@association/enums/association-gql-names.enum";
import { AssociationMemberStatus } from "@prisma/client";
import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_MEMBER)
export class AssociationMemberEntity {
  @Field() invitedAt: Date;
  @Field(() => ID) id: string;
  @Field(() => ID) userId: string;
  @Field(() => String, { nullable: true }) notes: string | null;
  @Field(() => String, { nullable: true }) email: string | null;
  @Field(() => Date, { nullable: true }) activatedAt: Date | null;
  @Field(() => String, { nullable: true }) fullName: string | null;
  @Field(() => String, { nullable: true }) avatarUrl: string | null;
  @Field(() => Date, { nullable: true }) deactivatedAt: Date | null;
  @Field(() => String, { nullable: true }) memberNumber: string | null;
  @Field(() => AssociationMemberStatus) status: AssociationMemberStatus;
  @Field(() => AssociationMemberGroupEntity, { nullable: true })
  group: AssociationMemberGroupEntity | null;
}
