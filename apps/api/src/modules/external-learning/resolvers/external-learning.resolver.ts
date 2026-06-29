import { ExternalLearningActionResponseEntity } from "@ext/entities/external-learning-action-response.entity";
import { ExternalLearningGqlMutationNames } from "@ext/enums/gql-names.enum";
import { CreateExternalLearningClickInput } from "@ext/dtos/create-external-learning-click.input";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { PaginatedExternalLearningEntity } from "@ext/entities/paginated-external-learning.entity";
import { ExternalLearningActivityEntity } from "@ext/entities/external-learning-activity.entity";
import { ExternalLearningGqlQueryNames } from "@ext/enums/gql-names.enum";
import { ConfirmExternalLearningInput } from "@ext/dtos/confirm-external-learning.input";
import { OrganizationPaginationInput } from "@org/dtos/org-pagination.input";
import { ExternalLearningFilterInput } from "@ext/dtos/external-learning-filter.input";
import { ExternalLearningService } from "@ext/services/external-learning.service";
import { CurrentUser } from "@auth/decorators/current-user.decorator";
import { JwtPayload } from "@auth/types/jwt-payload.type";
import { Roles } from "@auth/decorators/roles.decorator";
import { Role } from "@prisma/client";

@Resolver(() => ExternalLearningActivityEntity)
@Roles(Role.PROFESSIONAL, Role.PROVIDER, Role.ORGANIZATION, Role.ADMIN)
export class ExternalLearningResolver {
  constructor(private readonly service: ExternalLearningService) {}

  private getUser(user: JwtPayload) {
    return {
      id: user.sub,
      role: user.role,
    };
  }

  @Mutation(() => ExternalLearningActivityEntity, {
    name: ExternalLearningGqlMutationNames.TRACK_EXTERNAL_LEARNING_CLICK,
  })
  trackExternalLearningClick(
    @CurrentUser() user: JwtPayload,
    @Args("input") input: CreateExternalLearningClickInput,
  ) {
    return this.service.trackClick(this.getUser(user), input);
  }

  @Query(() => PaginatedExternalLearningEntity, {
    name: ExternalLearningGqlQueryNames.MY_EXTERNAL_LEARNING_ACTIVITIES,
  })
  myExternalLearningActivities(
    @CurrentUser() user: JwtPayload,
    @Args("filter", { nullable: true }) filter?: ExternalLearningFilterInput,
    @Args("pagination", { nullable: true })
    pagination?: OrganizationPaginationInput,
  ) {
    return this.service.myActivities(this.getUser(user), filter, pagination);
  }

  @Mutation(() => ExternalLearningActivityEntity, {
    name: ExternalLearningGqlMutationNames.CONFIRM_EXTERNAL_LEARNING,
  })
  confirmExternalLearning(
    @CurrentUser() user: JwtPayload,
    @Args("input") input: ConfirmExternalLearningInput,
  ) {
    return this.service.confirm(this.getUser(user), input);
  }

  @Mutation(() => ExternalLearningActionResponseEntity, {
    name: ExternalLearningGqlMutationNames.IGNORE_EXTERNAL_LEARNING,
  })
  ignoreExternalLearning(
    @CurrentUser() user: JwtPayload,
    @Args("activityId") activityId: string,
  ) {
    return this.service.ignore(this.getUser(user), activityId);
  }
}
