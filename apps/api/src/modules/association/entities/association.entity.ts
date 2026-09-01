import { AssociationSettingsEntity } from "@association/entities/association-settings.entity";
import { AssociationGqlObjectNames } from "@association/enums/association-gql-names.enum";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { UserStatus } from "@prisma/client";

@ObjectType(AssociationGqlObjectNames.ASSOCIATION)
export class AssociationEntity {
  @Field() name: string;
  @Field() updatedAt: Date;
  @Field() createdAt: Date;
  @Field(() => ID) id: string;
  @Field(() => UserStatus) ownerStatus: UserStatus;
  @Field(() => String, { nullable: true }) logoUrl: string | null;
  @Field(() => String, { nullable: true }) country: string | null;
  @Field(() => String, { nullable: true }) website: string | null;
  @Field(() => String, { nullable: true }) ownerEmail: string | null;
  @Field(() => String, { nullable: true }) description: string | null;
  @Field(() => String, { nullable: true }) contactEmail: string | null;
  @Field(() => String, { nullable: true }) ownerFullName: string | null;
  @Field(() => AssociationSettingsEntity, { nullable: true })
  settings: AssociationSettingsEntity | null;
}
