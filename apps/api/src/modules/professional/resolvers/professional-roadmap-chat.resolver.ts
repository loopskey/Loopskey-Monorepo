import { ProfessionalRoadmapGenerationService } from "@professional/services/professional-roadmap-generation.service";
import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { ProfessionalRoadmapChatService } from "@professional/services/professional-roadmap-chat.service";
import { ProfessionalRoadmapDraftEntity } from "@professional/entities/professional-roadmap-draft.entity";
import { ProfessionalGqlMutationNames } from "@professional/enums/gql-names.enum";
import { ProfessionalPaginationInput } from "@professional/dtos/professional-pagination.input";
import { ProfessionalGqlQueryNames } from "@professional/enums/gql-names.enum";
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

  @Mutation(() => ProfessionalRoadmapDraftEntity, {
    name: ProfessionalGqlMutationNames.START_ROADMAP_DRAFT,
  })
  startRoadmapDraft(@CurrentUser() user: TResolverUser) {
    return this.chatService.startDraft(this.getUser(user));
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
    name: ProfessionalGqlMutationNames.REQUEST_ROADMAP_GENERATION,
  })
  requestRoadmapGeneration(
    @CurrentUser() user: TResolverUser,
    @Args("draftId", { type: () => ID }) draftId: string,
  ) {
    return this.generationService.requestGeneration(
      this.getUser(user),
      draftId,
    );
  }
}
