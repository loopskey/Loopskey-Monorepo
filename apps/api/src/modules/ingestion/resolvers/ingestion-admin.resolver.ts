import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { PaginatedIngestionSourcesEntity } from "@ingestion/entities/ingestion-source.entity";
import { PaginatedIngestionBatchesEntity } from "@ingestion/entities/ingestion-batch.entity";
import { PaginatedIngestionItemsEntity } from "@ingestion/entities/ingestion-item.entity";
import { IssuedIngestionApiKeyEntity } from "@ingestion/entities/ingestion-api-key.entity";
import { CreateIngestionSourceInput } from "@ingestion/dtos/create-ingestion-source.input";
import { UpdateIngestionSourceInput } from "@ingestion/dtos/update-ingestion-source.input";
import { IngestionSourceFilterInput } from "@ingestion/dtos/ingestion-source-filter.input";
import { IngestionBatchDetailEntity } from "@ingestion/entities/ingestion-batch.entity";
import { IngestionGqlMutationNames } from "@ingestion/enums/ingestion-gql-names.enum";
import { IssueIngestionApiKeyInput } from "@ingestion/dtos/issue-ingestion-api-key.input";
import { IngestionItemFilterInput } from "@ingestion/dtos/ingestion-item-filter.input";
import { IngestionPaginationInput } from "@ingestion/dtos/ingestion-pagination.input";
import { RejectIngestionItemInput } from "@ingestion/dtos/reject-ingestion-item.input";
import { IngestionGqlQueryNames } from "@ingestion/enums/ingestion-gql-names.enum";
import { IngestionSourceEntity } from "@ingestion/entities/ingestion-source.entity";
import { IngestionApiKeyEntity } from "@ingestion/entities/ingestion-api-key.entity";
import { IngestionAdminService } from "@ingestion/services/ingestion-admin.service";
import { IngestionItemEntity } from "@ingestion/entities/ingestion-item.entity";
import { TResolverUser } from "@ingestion/types/ingestion-admin.types";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { Roles } from "@common/decorators/roles.decorator";
import { Role } from "@prisma/client";

@Resolver()
@Roles(Role.ADMIN)
export class IngestionAdminResolver {
  constructor(private readonly admin: IngestionAdminService) {}

  private actorId(user: TResolverUser) {
    return (user.id ?? user.sub) as string;
  }

  @Query(() => PaginatedIngestionSourcesEntity, {
    name: IngestionGqlQueryNames.INGESTION_SOURCES,
  })
  ingestionSources(
    @Args("filter", { nullable: true }) filter?: IngestionSourceFilterInput,
    @Args("pagination", { nullable: true })
    pagination?: IngestionPaginationInput,
  ) {
    return this.admin.listSources(filter, {
      take: pagination?.take ?? 20,
      cursor: pagination?.cursor,
    });
  }

  @Query(() => IngestionSourceEntity, {
    name: IngestionGqlQueryNames.INGESTION_SOURCE,
  })
  ingestionSource(@Args("sourceId") sourceId: string) {
    return this.admin.getSource(sourceId);
  }

  @Query(() => [IngestionApiKeyEntity], {
    name: IngestionGqlQueryNames.INGESTION_API_KEYS,
  })
  ingestionApiKeys(@Args("sourceId") sourceId: string) {
    return this.admin.listKeys(sourceId);
  }

  @Query(() => PaginatedIngestionBatchesEntity, {
    name: IngestionGqlQueryNames.INGESTION_BATCHES,
  })
  ingestionBatches(
    @Args("sourceId") sourceId: string,
    @Args("pagination", { nullable: true })
    pagination?: IngestionPaginationInput,
  ) {
    return this.admin.listBatches(sourceId, {
      take: pagination?.take ?? 20,
      cursor: pagination?.cursor,
    });
  }

  @Query(() => IngestionBatchDetailEntity, {
    name: IngestionGqlQueryNames.INGESTION_BATCH,
  })
  ingestionBatch(@Args("batchId") batchId: string) {
    return this.admin.getBatch(batchId);
  }

  @Query(() => PaginatedIngestionItemsEntity, {
    name: IngestionGqlQueryNames.INGESTION_ITEMS,
  })
  ingestionItems(
    @Args("filter", { nullable: true }) filter?: IngestionItemFilterInput,
    @Args("pagination", { nullable: true })
    pagination?: IngestionPaginationInput,
  ) {
    return this.admin.listItems(filter, {
      take: pagination?.take ?? 20,
      cursor: pagination?.cursor,
    });
  }

  @Mutation(() => IngestionSourceEntity, {
    name: IngestionGqlMutationNames.CREATE_INGESTION_SOURCE,
  })
  createIngestionSource(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: CreateIngestionSourceInput,
  ) {
    return this.admin.createSource(this.actorId(user), input);
  }

  @Mutation(() => IngestionSourceEntity, {
    name: IngestionGqlMutationNames.UPDATE_INGESTION_SOURCE,
  })
  updateIngestionSource(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: UpdateIngestionSourceInput,
  ) {
    return this.admin.updateSource(this.actorId(user), input);
  }

  @Mutation(() => IngestionSourceEntity, {
    name: IngestionGqlMutationNames.ACTIVATE_INGESTION_SOURCE,
  })
  activateIngestionSource(
    @CurrentUser() user: TResolverUser,
    @Args("sourceId") sourceId: string,
  ) {
    return this.admin.setSourceActive(this.actorId(user), sourceId, true);
  }

  @Mutation(() => IngestionSourceEntity, {
    name: IngestionGqlMutationNames.DEACTIVATE_INGESTION_SOURCE,
  })
  deactivateIngestionSource(
    @CurrentUser() user: TResolverUser,
    @Args("sourceId") sourceId: string,
  ) {
    return this.admin.setSourceActive(this.actorId(user), sourceId, false);
  }

  @Mutation(() => IssuedIngestionApiKeyEntity, {
    name: IngestionGqlMutationNames.ISSUE_INGESTION_API_KEY,
  })
  issueIngestionApiKey(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: IssueIngestionApiKeyInput,
  ) {
    return this.admin.issueKey(this.actorId(user), input);
  }

  @Mutation(() => IngestionApiKeyEntity, {
    name: IngestionGqlMutationNames.REVOKE_INGESTION_API_KEY,
  })
  revokeIngestionApiKey(
    @CurrentUser() user: TResolverUser,
    @Args("keyId") keyId: string,
  ) {
    return this.admin.revokeKey(this.actorId(user), keyId);
  }

  @Mutation(() => IngestionItemEntity, {
    name: IngestionGqlMutationNames.APPROVE_INGESTION_ITEM,
  })
  approveIngestionItem(
    @CurrentUser() user: TResolverUser,
    @Args("itemId") itemId: string,
  ) {
    return this.admin.approveItem(this.actorId(user), itemId);
  }

  @Mutation(() => IngestionItemEntity, {
    name: IngestionGqlMutationNames.REJECT_INGESTION_ITEM,
  })
  rejectIngestionItem(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: RejectIngestionItemInput,
  ) {
    return this.admin.rejectItem(
      this.actorId(user),
      input.itemId,
      input.reason,
    );
  }
}
