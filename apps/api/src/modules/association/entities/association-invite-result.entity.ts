import { AssociationGqlObjectNames } from "@association/enums/association-gql-names.enum";
import { AssociationInviteOutcome } from "@association/enums/association-register.enum";
import { AssociationMemberEntity } from "@association/entities/association-member.entity";
import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_INVITE_RESULT)
export class AssociationInviteResultEntity {
  @Field(() => AssociationMemberEntity) member: AssociationMemberEntity;
  @Field(() => AssociationInviteOutcome) outcome: AssociationInviteOutcome;
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_BULK_INVITE_FAILURE)
export class AssociationBulkInviteFailureEntity {
  @Field() code: string;
  @Field() email: string;
  @Field() reason: string;
  @Field(() => Int) row: number;
}

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_BULK_INVITE_RESULT)
export class AssociationBulkInviteResultEntity {
  @Field(() => Int) linked: number;
  @Field(() => Int) failed: number;
  @Field(() => Int) invited: number;
  @Field(() => Int) totalRows: number;
  @Field(() => [AssociationBulkInviteFailureEntity])
  failures: AssociationBulkInviteFailureEntity[];
}
