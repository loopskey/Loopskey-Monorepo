import { SetProviderPublicProfileIndexExclusionInput } from "@provider/dtos/provider-public-profile.input";
import { ProviderPublicProfileUrlApiService } from "@provider/application/provider-public-profile-url-api.service";
import { ModerateProviderPublicProfileInput } from "@provider/dtos/provider-public-profile.input";
import { AdminProviderPublicProfileEntity } from "@provider/entities/provider-public-profile.entity";
import { ProviderPublicProfileDraftEntity } from "@provider/entities/provider-public-profile.entity";
import { ProviderPublicProfileReadService } from "@provider/services/provider-public-profile-read.service";
import { ReviewProviderPublicProfileInput } from "@provider/dtos/provider-public-profile.input";
import { SubmitProviderPublicProfileInput } from "@provider/dtos/provider-public-profile.input";
import { ProviderProfileGqlMutationNames } from "@provider/enums/public-profile-gql-names.enum";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { SaveProviderPublicProfileInput } from "@provider/dtos/provider-public-profile.input";
import { ProviderProfileGqlQueryNames } from "@provider/enums/public-profile-gql-names.enum";
import { ProviderPublicProfileService } from "@provider/services/provider-public-profile.service";
import { ProviderPublicProfileEntity } from "@provider/entities/provider-public-profile.entity";
import { ProviderProfileReviewState } from "@prisma/client";
import { EditorialUrlShardSetEntity } from "@common/types/editorial-url.types";
import { ProviderPublicBylineEntity } from "@provider/entities/provider-public-profile.entity";
import { ContentUrlNamespace, Role } from "@prisma/client";
import { EditorialUrlPageEntity } from "@common/types/editorial-url.types";
import { EditorialUrlPageInput } from "@common/types/editorial-url.types";
import { toEditorialShardSet } from "@common/types/editorial-url.types";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { Public } from "@common/decorators/public.decorator";
import { Roles } from "@common/decorators/roles.decorator";

import type { JwtPayload } from "@common/types/jwt-payload.type";

import "@provider/enums/public-profile-register.enum";

const actorOf = (user: JwtPayload) => ({ id: user.sub });

@Resolver()
export class ProviderPublicProfileResolver {
  constructor(
    private readonly profiles: ProviderPublicProfileService,
    private readonly reads: ProviderPublicProfileReadService,
    private readonly urls: ProviderPublicProfileUrlApiService,
  ) {}

  @Public()
  @Query(() => ProviderPublicProfileEntity, {
    name: ProviderProfileGqlQueryNames.PUBLIC_BY_SLUG,
  })
  providerPublicProfileBySlug(@Args("slug") slug: string) {
    return this.reads.bySlug(slug);
  }

  @Public()
  @Query(() => ProviderPublicBylineEntity, {
    nullable: true,
    name: ProviderProfileGqlQueryNames.BYLINE_FOR_CONTENT,
  })
  providerPublicBylineForContent(
    @Args("kind", { type: () => ContentUrlNamespace })
    kind: ContentUrlNamespace,
    @Args("contentId") contentId: string,
  ) {
    return this.reads.bylineForContent(kind, contentId);
  }

  @Public()
  @Query(() => EditorialUrlShardSetEntity, {
    name: ProviderProfileGqlQueryNames.URL_SHARDS,
  })
  async providerProfileUrlShards() {
    return toEditorialShardSet(await this.urls.readShards());
  }

  @Public()
  @Query(() => EditorialUrlPageEntity, {
    name: ProviderProfileGqlQueryNames.URL_PAGE,
  })
  providerProfileUrlPage(@Args("input") input: EditorialUrlPageInput) {
    return this.urls.readPage(input);
  }

  @Roles(Role.PROVIDER)
  @Query(() => ProviderPublicProfileDraftEntity, {
    nullable: true,
    name: ProviderProfileGqlQueryNames.MY_PROFILE,
  })
  myProviderPublicProfile(@CurrentUser() user: JwtPayload) {
    return this.profiles.own(actorOf(user));
  }

  @Roles(Role.PROVIDER)
  @Mutation(() => ProviderPublicProfileDraftEntity, {
    name: ProviderProfileGqlMutationNames.SAVE,
  })
  saveProviderPublicProfile(
    @CurrentUser() user: JwtPayload,
    @Args("input") input: SaveProviderPublicProfileInput,
  ) {
    return this.profiles.save(actorOf(user), input);
  }

  @Roles(Role.PROVIDER)
  @Mutation(() => ProviderPublicProfileDraftEntity, {
    name: ProviderProfileGqlMutationNames.SUBMIT,
  })
  submitProviderPublicProfile(
    @CurrentUser() user: JwtPayload,
    @Args("input") input: SubmitProviderPublicProfileInput,
  ) {
    return this.profiles.submit(actorOf(user), input);
  }

  @Roles(Role.PROVIDER)
  @Mutation(() => ProviderPublicProfileDraftEntity, {
    name: ProviderProfileGqlMutationNames.WITHDRAW,
  })
  withdrawProviderPublicProfile(@CurrentUser() user: JwtPayload) {
    return this.profiles.withdrawOwn(actorOf(user));
  }

  @Roles(Role.ADMIN)
  @Query(() => [AdminProviderPublicProfileEntity], {
    name: ProviderProfileGqlQueryNames.ADMIN_PROFILES,
  })
  adminProviderPublicProfiles(
    @Args("reviewState", {
      type: () => ProviderProfileReviewState,
      nullable: true,
    })
    reviewState?: ProviderProfileReviewState,
  ) {
    return this.profiles.adminList(reviewState);
  }

  @Roles(Role.ADMIN)
  @Mutation(() => AdminProviderPublicProfileEntity, {
    name: ProviderProfileGqlMutationNames.REVIEW,
  })
  reviewProviderPublicProfile(
    @CurrentUser() user: JwtPayload,
    @Args("input") input: ReviewProviderPublicProfileInput,
  ) {
    return this.profiles.review(actorOf(user), input);
  }

  @Roles(Role.ADMIN)
  @Mutation(() => AdminProviderPublicProfileEntity, {
    name: ProviderProfileGqlMutationNames.MODERATE_WITHDRAW,
  })
  withdrawProviderPublicProfileAsAdmin(
    @CurrentUser() user: JwtPayload,
    @Args("input") input: ModerateProviderPublicProfileInput,
  ) {
    return this.profiles.withdrawAsAdmin(actorOf(user), input);
  }

  @Roles(Role.ADMIN)
  @Mutation(() => AdminProviderPublicProfileEntity, {
    name: ProviderProfileGqlMutationNames.SET_INDEX_EXCLUSION,
  })
  setProviderPublicProfileIndexExclusion(
    @CurrentUser() user: JwtPayload,
    @Args("input") input: SetProviderPublicProfileIndexExclusionInput,
  ) {
    return this.profiles.setIndexExclusion(actorOf(user), input);
  }
}
