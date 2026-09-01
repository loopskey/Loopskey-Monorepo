import { AssociationGqlObjectNames } from "@association/enums/association-gql-names.enum";
import { AssociationEntity } from "@association/entities/association.entity";
import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_ACTION_RESPONSE)
export class AssociationActionResponseEntity {
  @Field() code: string;
  @Field() message: string;
  @Field() success: boolean;
  @Field(() => AssociationEntity, { nullable: true })
  association: AssociationEntity | null;
}
