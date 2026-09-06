import { PaginatedAssociationMessageHistoryEntity } from "@association/entities/association-message.entity";
import { PaginatedAssociationAttentionRowsEntity } from "@association/entities/association-message.entity";
import { AssociationMessagePreviewEntity } from "@association/entities/association-message.entity";
import { AssociationAttentionListsEntity } from "@association/entities/association-message.entity";
import { AssociationMessageBatchEntity } from "@association/entities/association-message.entity";
import { AssociationAttentionSection } from "@association/enums/association-attention.enum";
import { AssociationAttentionService } from "@association/services/association-attention.service";
import { AssociationMessageService } from "@association/services/association-message.service";
import { AssociationReportPaginationInput } from "@association/dtos/association-report.input";
import { AssociationGqlMutationNames } from "@association/enums/association-gql-names.enum";
import { AssociationGqlQueryNames } from "@association/enums/association-gql-names.enum";
import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { TResolverUser } from "@association/types/association-service.types";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { AssociationMessageType } from "@prisma/client";
import { Roles } from "@common/decorators/roles.decorator";
import { Role } from "@prisma/client";

import * as DTO from "@association/dtos/association-message.input";

@Resolver()
@Roles(Role.ASSOCIATION, Role.ADMIN)
export class AssociationMessageResolver {
  constructor(
    private readonly attention: AssociationAttentionService,
    private readonly messages: AssociationMessageService,
  ) {}

  private getUser(user: TResolverUser) {
    return { id: user.id ?? user.sub!, role: user.role };
  }

  @Query(() => AssociationAttentionListsEntity, {
    name: AssociationGqlQueryNames.ATTENTION_LISTS,
  })
  associationAttentionLists(
    @CurrentUser() user: TResolverUser,
    @Args("associationId", { type: () => ID, nullable: true })
    associationId?: string,
  ) {
    return this.attention.lists(this.getUser(user), associationId);
  }

  @Query(() => PaginatedAssociationAttentionRowsEntity, {
    name: AssociationGqlQueryNames.ATTENTION_MEMBERS,
  })
  associationAttentionMembers(
    @CurrentUser() user: TResolverUser,
    @Args("section", { type: () => AssociationAttentionSection })
    section: AssociationAttentionSection,
    @Args("pagination", { nullable: true })
    pagination?: AssociationReportPaginationInput,
    @Args("associationId", { type: () => ID, nullable: true })
    associationId?: string,
  ) {
    return this.attention.section(
      this.getUser(user),
      section,
      pagination,
      associationId,
    );
  }

  @Query(() => AssociationMessagePreviewEntity, {
    name: AssociationGqlQueryNames.MESSAGE_PREVIEW,
  })
  @Roles(Role.ASSOCIATION)
  associationMessagePreview(
    @CurrentUser() user: TResolverUser,
    @Args("messageType", { type: () => AssociationMessageType })
    messageType: AssociationMessageType,
    @Args("audience") audience: DTO.AssociationMessageAudienceInput,
  ) {
    return this.messages.preview(this.getUser(user), messageType, audience);
  }

  @Query(() => PaginatedAssociationMessageHistoryEntity, {
    name: AssociationGqlQueryNames.MESSAGE_HISTORY,
  })
  associationMessageHistory(
    @CurrentUser() user: TResolverUser,
    @Args("pagination", { nullable: true })
    pagination?: AssociationReportPaginationInput,
    @Args("associationId", { type: () => ID, nullable: true })
    associationId?: string,
  ) {
    return this.messages.history(this.getUser(user), pagination, associationId);
  }

  @Mutation(() => AssociationMessageBatchEntity, {
    name: AssociationGqlMutationNames.SEND_MESSAGE,
  })
  @Roles(Role.ASSOCIATION)
  sendAssociationMessage(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: DTO.SendAssociationMessageInput,
  ) {
    return this.messages.send(
      this.getUser(user),
      input.messageType,
      input.audience,
    );
  }
}
