import { ContentInteractionGqlMutationNames } from "@contentAction/enums/gql-names.enum";
import { ContentInteractionGqlQueryNames } from "@contentAction/enums/gql-names.enum";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UpdateEnrollmentProgressInput } from "@contentAction/dtos/update-enrollment-progress.input";
import { ContentActionPayloadEntity } from "@contentAction/entities/content-action-payload.entity";
import { ContentInteractionService } from "@contentAction/services/content-interaction.service";
import { SubmitContentReviewInput } from "@contentAction/dtos/submit-content-review.input";
import { ContentEnrollmentEntity } from "@contentAction/entities/content-enrollment.entity";
import { TCurrentUserPayload } from "@contentAction/types/content-interaction.types";
import { ContentReviewEntity } from "@contentAction/entities/content-review.entity";
import { ContentActionInput } from "@contentAction/dtos/content-action.input";
import { CurrentUser } from "@auth/decorators/current-user.decorator";
import { ContentType } from "@prisma/client";
import { CartEntity } from "@contentAction/entities/cart.entity";

@Resolver()
export class ContentInteractionResolver {
  constructor(
    private readonly contentInteractionService: ContentInteractionService,
  ) {}

  @Query(() => [ContentEnrollmentEntity], {
    name: ContentInteractionGqlQueryNames.MY_ENROLLMENTS,
  })
  myEnrollments(@CurrentUser() user: TCurrentUserPayload) {
    return this.contentInteractionService.myEnrollments(user.id ?? user.sub!);
  }

  @Query(() => CartEntity, {
    name: ContentInteractionGqlQueryNames.MY_CART,
    nullable: true,
  })
  myCart(@CurrentUser() user: TCurrentUserPayload) {
    return this.contentInteractionService.myCart(user.id ?? user.sub!);
  }

  @Query(() => [ContentReviewEntity], {
    name: ContentInteractionGqlQueryNames.CONTENT_REVIEWS,
  })
  contentReviews(
    @Args("contentType", { type: () => ContentType }) contentType: ContentType,
    @Args("contentId") contentId: string,
  ) {
    return this.contentInteractionService.contentReviews(
      contentType,
      contentId,
    );
  }

  @Query(() => ContentReviewEntity, {
    name: ContentInteractionGqlQueryNames.MY_REVIEW_FOR_CONTENT,
    nullable: true,
  })
  myReviewForContent(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("contentType", { type: () => ContentType }) contentType: ContentType,
    @Args("contentId") contentId: string,
  ) {
    return this.contentInteractionService.myReviewForContent(
      user.id ?? user.sub!,
      contentType,
      contentId,
    );
  }

  @Mutation(() => ContentActionPayloadEntity, {
    name: ContentInteractionGqlMutationNames.TOGGLE_WISHLIST,
  })
  toggleWishlist(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("input") input: ContentActionInput,
  ) {
    return this.contentInteractionService.toggleWishlist(
      user.id ?? user.sub!,
      input,
    );
  }

  @Mutation(() => ContentActionPayloadEntity, {
    name: ContentInteractionGqlMutationNames.ENROLL_CONTENT,
  })
  enrollContent(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("input") input: ContentActionInput,
  ) {
    return this.contentInteractionService.enrollContent(
      user.id ?? user.sub!,
      input,
    );
  }

  @Mutation(() => ContentActionPayloadEntity, {
    name: ContentInteractionGqlMutationNames.CANCEL_CONTENT_ENROLLMENT,
  })
  cancelContentEnrollment(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("input") input: ContentActionInput,
  ) {
    return this.contentInteractionService.cancelContentEnrollment(
      user.id ?? user.sub!,
      input,
    );
  }

  @Mutation(() => ContentActionPayloadEntity, {
    name: ContentInteractionGqlMutationNames.UPDATE_ENROLLMENT_PROGRESS,
  })
  updateEnrollmentProgress(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("input") input: UpdateEnrollmentProgressInput,
  ) {
    return this.contentInteractionService.updateEnrollmentProgress(
      user.id ?? user.sub!,
      input,
    );
  }

  @Mutation(() => ContentReviewEntity, {
    name: ContentInteractionGqlMutationNames.SUBMIT_CONTENT_REVIEW,
  })
  submitContentReview(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("input") input: SubmitContentReviewInput,
  ) {
    return this.contentInteractionService.submitReview(
      user.id ?? user.sub!,
      input,
    );
  }

  @Mutation(() => ContentActionPayloadEntity, {
    name: ContentInteractionGqlMutationNames.DELETE_CONTENT_REVIEW,
  })
  deleteContentReview(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("input") input: ContentActionInput,
  ) {
    return this.contentInteractionService.deleteReview(
      user.id ?? user.sub!,
      input,
    );
  }

  @Mutation(() => ContentActionPayloadEntity, {
    name: ContentInteractionGqlMutationNames.ADD_TO_CART,
  })
  addToCart(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("input") input: ContentActionInput,
  ) {
    return this.contentInteractionService.addToCart(
      user.id ?? user.sub!,
      input,
    );
  }

  @Mutation(() => ContentActionPayloadEntity, {
    name: ContentInteractionGqlMutationNames.REMOVE_FROM_CART,
  })
  removeFromCart(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("input") input: ContentActionInput,
  ) {
    return this.contentInteractionService.removeFromCart(
      user.id ?? user.sub!,
      input,
    );
  }

  @Mutation(() => ContentActionPayloadEntity, {
    name: ContentInteractionGqlMutationNames.CLEAR_CART,
  })
  clearCart(@CurrentUser() user: TCurrentUserPayload) {
    return this.contentInteractionService.clearCart(user.id ?? user.sub!);
  }
}
