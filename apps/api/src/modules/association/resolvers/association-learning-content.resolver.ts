import { PaginatedAssociationLearningContentsEntity } from "@association/entities/association-learning-content.entity";
import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { AssociationLearningContentService } from "@association/services/association-learning-content.service";
import { AssociationLearningContentEntity } from "@association/entities/association-learning-content.entity";
import { AssociationActionResponseEntity } from "@association/entities/association-action-response.entity";
import { AssociationCatalogItemEntity } from "@association/entities/association-learning-content.entity";
import { AssociationGqlMutationNames } from "@association/enums/association-gql-names.enum";
import { AssociationPaginationInput } from "@association/dtos/association-pagination.input";
import { AssociationGqlQueryNames } from "@association/enums/association-gql-names.enum";
import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { TResolverUser } from "@association/types/association-service.types";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { Roles } from "@common/decorators/roles.decorator";
import { Role } from "@prisma/client";

import * as DTO from "@association/dtos/association-learning-content.input";

@Resolver()
@Roles(Role.ASSOCIATION, Role.ADMIN)
export class AssociationLearningContentResolver {
  constructor(private readonly library: AssociationLearningContentService) {}

  private getUser(user: TResolverUser) {
    return { id: user.id ?? user.sub!, role: user.role };
  }

  @Query(() => PaginatedAssociationLearningContentsEntity, {
    name: AssociationGqlQueryNames.LEARNING_CONTENTS,
  })
  associationLearningContents(
    @CurrentUser() user: TResolverUser,
    @Args("filter", { nullable: true })
    filter?: DTO.AssociationLearningContentFilterInput,
    @Args("pagination", { nullable: true })
    pagination?: AssociationPaginationInput,
    @Args("associationId", { type: () => ID, nullable: true })
    associationId?: string,
  ) {
    return this.library.list(
      this.getUser(user),
      filter,
      pagination,
      associationId,
    );
  }

  @Query(() => AssociationLearningContentEntity, {
    name: AssociationGqlQueryNames.LEARNING_CONTENT,
  })
  associationLearningContent(
    @CurrentUser() user: TResolverUser,
    @Args("learningContentId", { type: () => ID }) learningContentId: string,
    @Args("associationId", { type: () => ID, nullable: true })
    associationId?: string,
  ) {
    return this.library.one(
      this.getUser(user),
      learningContentId,
      associationId,
    );
  }

  @Query(() => [AssociationCatalogItemEntity], {
    name: AssociationGqlQueryNames.CATALOG_SEARCH,
  })
  associationCatalogSearch(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: DTO.AssociationCatalogSearchInput,
    @Args("associationId", { type: () => ID, nullable: true })
    associationId?: string,
  ) {
    return this.library.searchCatalog(this.getUser(user), input, associationId);
  }

  @Roles(Role.ASSOCIATION)
  @Mutation(() => AssociationLearningContentEntity, {
    name: AssociationGqlMutationNames.CREATE_LEARNING_CONTENT,
  })
  createAssociationLearningContent(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: DTO.CreateAssociationLearningContentInput,
  ) {
    return this.library.create(this.getUser(user), input);
  }

  @Roles(Role.ASSOCIATION)
  @Mutation(() => AssociationLearningContentEntity, {
    name: AssociationGqlMutationNames.UPDATE_LEARNING_CONTENT,
  })
  updateAssociationLearningContent(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: DTO.UpdateAssociationLearningContentInput,
  ) {
    return this.library.update(this.getUser(user), input);
  }

  @Roles(Role.ASSOCIATION)
  @Mutation(() => AssociationLearningContentEntity, {
    name: AssociationGqlMutationNames.PUBLISH_LEARNING_CONTENT,
  })
  publishAssociationLearningContent(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: DTO.PublishAssociationLearningContentInput,
  ) {
    return this.library.publish(this.getUser(user), input);
  }

  @Roles(Role.ASSOCIATION)
  @Mutation(() => AssociationLearningContentEntity, {
    name: AssociationGqlMutationNames.WITHDRAW_LEARNING_CONTENT,
  })
  withdrawAssociationLearningContent(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: DTO.AssociationLearningContentIdInput,
  ) {
    return this.library.withdraw(this.getUser(user), input.learningContentId);
  }

  @Roles(Role.ASSOCIATION)
  @Mutation(() => AssociationActionResponseEntity, {
    name: AssociationGqlMutationNames.DELETE_LEARNING_CONTENT,
  })
  async deleteAssociationLearningContent(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: DTO.AssociationLearningContentIdInput,
  ) {
    await this.library.remove(this.getUser(user), input.learningContentId);

    return {
      success: true,
      association: null,
      code: AssociationMessageCode.LEARNING_CONTENT_DELETED,
      message: "The draft item was deleted.",
    };
  }
}
