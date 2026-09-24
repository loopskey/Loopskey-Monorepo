import { ProfessionalRoadmapGenerationService } from "@professional/services/professional-roadmap-generation.service";
import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { ProfessionalRoadmapGenerationEntity } from "@professional/entities/professional-roadmap-draft.entity";
import { ProfessionalRoadmapChatService } from "@professional/services/professional-roadmap-chat.service";
import { ProfessionalRoadmapDraftEntity } from "@professional/entities/professional-roadmap-draft.entity";
import { RoadmapSuggestionOptionsInput } from "@professional/dtos/roadmap-suggestion-options.input";
import { ProfessionalGqlMutationNames } from "@professional/enums/gql-names.enum";
import { ProfessionalPaginationInput } from "@professional/dtos/professional-pagination.input";
import { RoadmapWidgetOptionEntity } from "@professional/entities/professional-roadmap-draft.entity";
import { ProfessionalGqlQueryNames } from "@professional/enums/gql-names.enum";
import { PatchRoadmapCpdSetupInput } from "@professional/dtos/patch-roadmap-cpd-setup.input";
import { PatchRoadmapDraftInput } from "@professional/dtos/patch-roadmap-draft.input";
import { RoadmapChatTurnInput } from "@professional/dtos/roadmap-chat-turn.input";
import { TResolverUser } from "@professional/types/professional-service.types";
import { CurrentUser } from "@auth/decorators/current-user.decorator";
import { Roles } from "@auth/decorators/roles.decorator";
import { Role } from "@prisma/client";

@Resolver()
@Roles(Role.PROFESSIONAL)
export class ProfessionalRoadmapChatResolver {
  constructor(
    private readonly chatService: ProfessionalRoadmapChatService,
    private readonly generationService: ProfessionalRoadmapGenerationService,
  ) {}

  private getUser(user: TResolverUser) {
    return { id: user.id ?? user.sub!, role: user.role };
  }

  @Query(() => ProfessionalRoadmapDraftEntity, {
    nullable: true,
    name: ProfessionalGqlQueryNames.PROFESSIONAL_ROADMAP_DRAFT,
  })
  professionalRoadmapDraft(
    @CurrentUser() user: TResolverUser,
    @Args("draftId", { type: () => ID, nullable: true }) draftId?: string,
    @Args("transcript", { nullable: true })
    transcript?: ProfessionalPaginationInput,
  ) {
    return this.chatService.draft(this.getUser(user), draftId, transcript);
  }

  @Query(() => [RoadmapWidgetOptionEntity], {
    name: ProfessionalGqlQueryNames.ROADMAP_SUGGESTION_OPTIONS,
  })
  roadmapSuggestionOptions(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: RoadmapSuggestionOptionsInput,
  ) {
    return this.chatService.suggestionOptions(this.getUser(user), input);
  }

  @Mutation(() => ProfessionalRoadmapDraftEntity, {
    name: ProfessionalGqlMutationNames.START_ROADMAP_DRAFT,
  })
  startRoadmapDraft(@CurrentUser() user: TResolverUser) {
    return this.chatService.startDraft(this.getUser(user));
  }

  @Mutation(() => ProfessionalRoadmapDraftEntity, {
    name: ProfessionalGqlMutationNames.RESET_ROADMAP_DRAFT,
  })
  resetRoadmapDraft(
    @CurrentUser() user: TResolverUser,
    @Args("draftId", { type: () => ID, nullable: true }) draftId?: string,
  ) {
    return this.chatService.resetDraft(this.getUser(user), draftId);
  }

  @Query(() => ProfessionalRoadmapGenerationEntity, {
    nullable: true,
    name: ProfessionalGqlQueryNames.PROFESSIONAL_ROADMAP_GENERATION,
  })
  professionalRoadmapGeneration(
    @CurrentUser() user: TResolverUser,
    @Args("draftId", { type: () => ID, nullable: true }) draftId?: string,
  ) {
    return this.generationService.generationStatus(this.getUser(user), draftId);
  }

  @Mutation(() => ProfessionalRoadmapDraftEntity, {
    name: ProfessionalGqlMutationNames.SEND_ROADMAP_CHAT_TURN,
  })
  sendRoadmapChatTurn(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: RoadmapChatTurnInput,
  ) {
    return this.chatService.chatTurn(this.getUser(user), input);
  }

  @Mutation(() => ProfessionalRoadmapDraftEntity, {
    name: ProfessionalGqlMutationNames.PATCH_ROADMAP_DRAFT,
  })
  patchRoadmapDraft(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: PatchRoadmapDraftInput,
  ) {
    return this.chatService.patchDraft(this.getUser(user), input);
  }

  @Mutation(() => ProfessionalRoadmapDraftEntity, {
    name: ProfessionalGqlMutationNames.PATCH_ROADMAP_CPD_SETUP,
  })
  patchRoadmapCpdSetup(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: PatchRoadmapCpdSetupInput,
  ) {
    return this.chatService.patchCpdSetup(this.getUser(user), input);
  }

  @Mutation(() => ProfessionalRoadmapDraftEntity, {
    name: ProfessionalGqlMutationNames.REQUEST_ROADMAP_GENERATION,
  })
  async requestRoadmapGeneration(
    @CurrentUser() user: TResolverUser,
    @Args("draftId", { type: () => ID }) draftId: string,
  ) {
    const resolverUser = this.getUser(user);
    await this.generationService.requestGeneration(resolverUser, draftId);
    return this.chatService.draft(resolverUser, draftId);
  }
}
