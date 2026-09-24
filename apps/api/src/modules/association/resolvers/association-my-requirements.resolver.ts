import { AssociationMyRequirementContentEntity } from "@association/entities/association-my-requirement.entity";
import { AssociationMyRequirementDetailEntity } from "@association/entities/association-my-requirement.entity";
import { AssociationContentEndorsementEntity } from "@association/entities/association-my-requirement.entity";
import { AssociationMyRequirementsService } from "@association/services/association-my-requirements.service";
import { AssociationMyRequirementEntity } from "@association/entities/association-my-requirement.entity";
import { Args, ID, Query, Resolver } from "@nestjs/graphql";
import { AssociationGqlQueryNames } from "@association/enums/association-gql-names.enum";
import { ContentType, Role } from "@prisma/client";
import { TResolverUser } from "@association/types/association-service.types";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { Roles } from "@common/decorators/roles.decorator";

@Resolver()
@Roles(Role.PROFESSIONAL)
export class AssociationMyRequirementsResolver {
  constructor(
    private readonly myRequirements: AssociationMyRequirementsService,
  ) {}

  @Query(() => [AssociationMyRequirementEntity], {
    name: AssociationGqlQueryNames.MY_REQUIREMENTS,
  })
  myAssociationRequirements(@CurrentUser() user: TResolverUser) {
    return this.myRequirements.list(user.id ?? user.sub!);
  }

  @Query(() => AssociationMyRequirementDetailEntity, {
    name: AssociationGqlQueryNames.MY_REQUIREMENT,
  })
  myAssociationRequirement(
    @CurrentUser() user: TResolverUser,
    @Args("requirementId", { type: () => ID }) requirementId: string,
  ) {
    return this.myRequirements.one(user.id ?? user.sub!, requirementId);
  }

  @Query(() => AssociationContentEndorsementEntity, {
    name: AssociationGqlQueryNames.MY_CONTENT_ENDORSEMENT,
    nullable: true,
  })
  myContentEndorsement(
    @CurrentUser() user: TResolverUser,
    @Args("contentType", { type: () => ContentType }) contentType: ContentType,
    @Args("contentId", { type: () => ID }) contentId: string,
  ) {
    return this.myRequirements.contentEndorsement(
      user.id ?? user.sub!,
      contentType,
      contentId,
    );
  }

  @Query(() => [AssociationMyRequirementContentEntity], {
    name: AssociationGqlQueryNames.MY_LEARNING_CONTENT,
  })
  myAssociationLearningContent(@CurrentUser() user: TResolverUser) {
    return this.myRequirements.myLearningContent(user.id ?? user.sub!);
  }
}
