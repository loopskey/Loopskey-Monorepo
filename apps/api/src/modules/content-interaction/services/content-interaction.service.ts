import { CartItemStatus, CartStatus, ContentType } from "@prisma/client";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { requestContext } from "@infrastructure/observability/request-context";
import { Prisma } from "@prisma/client";
import { UpdateEnrollmentProgressInput } from "@contentAction/dtos/update-enrollment-progress.input";
import { ContentInteractionMessageCode } from "@contentAction/enums/message-code";
import { type PodcastEngagementApi } from "@podcast/public/podcast-engagement-api";
import { TResolvedContentForAction } from "@contentAction/types/content-interaction.types";
import { type YouTubeEngagementApi } from "@youtube/public/youtube-engagement-api";
import { SubmitContentReviewInput } from "@contentAction/dtos/submit-content-review.input";
import { type CourseEngagementApi } from "@course/public/course-engagement-api";
import { ContentEnrollmentStatus } from "@prisma/client";
import { YOUTUBE_ENGAGEMENT_API } from "@youtube/public/youtube-engagement-api";
import { PODCAST_ENGAGEMENT_API } from "@podcast/public/podcast-engagement-api";
import { COURSE_ENGAGEMENT_API } from "@course/public/course-engagement-api";
import { BadRequestException } from "@nestjs/common";
import { ContentActionInput } from "@contentAction/dtos/content-action.input";
import { PrismaService } from "@prisma/prisma.service";
import { EVENTS_API } from "@events/public/events-api.token";
import { EventsApi } from "@events/public/events-api";
import { Inject } from "@nestjs/common";

const isUniqueViolation = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === "P2002";

@Injectable()
export class ContentInteractionService {
  private readonly logger = new Logger(ContentInteractionService.name);

  constructor(
    private readonly prismaService: PrismaService,
    @Inject(COURSE_ENGAGEMENT_API)
    private readonly courseApi: CourseEngagementApi,
    @Inject(EVENTS_API) private readonly eventsApi: EventsApi,
    @Inject(PODCAST_ENGAGEMENT_API)
    private readonly podcastApi: PodcastEngagementApi,
    @Inject(YOUTUBE_ENGAGEMENT_API)
    private readonly youtubeApi: YouTubeEngagementApi,
  ) {}

  /**
   * Flip the wishlist state for one content item.
   *
   * A toggle is ambiguous under concurrency and no implementation can fix that:
   * two simultaneous toggles of an absent item mean "add" to both callers, and
   * whichever order they land in, one of them is answering about a state the
   * other already changed. What is guaranteed here is narrower and sufficient —
   * each call performs one atomic operation, the two calls do not race into a
   * duplicate row or a missing-row error, and the final state is one a caller
   * asked for.
   *
   * `addToWishlist` and `removeFromWishlist` below have no such ambiguity, and
   * are what a client should reach for once explicit mutations are exposed.
   */
  async toggleWishlist(userId: string, input: ContentActionInput) {
    await this.resolveContent(input.contentType, input.contentId);
    const removed = await this.removeFromWishlist(userId, input);
    return removed.active === false && removed.changed
      ? removed.response
      : (await this.addToWishlist(userId, input)).response;
  }

  /**
   * Idempotent: a repeated add ends active without raising a duplicate error.
   *
   * Prisma's `upsert` is not the tool here. It falls back to a read followed by
   * a write for this shape, which is precisely the race being closed: two
   * simultaneous adds both find nothing and both insert. The unique constraint
   * is the arbiter instead, and losing to it means the entry the caller asked
   * for already exists — which is success, not a conflict.
   */
  private async addToWishlist(userId: string, input: ContentActionInput) {
    await this.prismaService.wishlistItem
      .create({
        data: {
          userId,
          contentType: input.contentType,
          contentId: input.contentId,
        },
      })
      .catch((error: unknown) => {
        if (!isUniqueViolation(error)) throw error;
      });
    return {
      changed: true,
      response: {
        success: true,
        code: ContentInteractionMessageCode.ADDED_TO_WISHLIST,
        message: "Added to wishlist.",
        active: true,
      },
    };
  }

  /** Idempotent: a repeated remove ends inactive rather than not-found. */
  private async removeFromWishlist(userId: string, input: ContentActionInput) {
    const { count } = await this.prismaService.wishlistItem.deleteMany({
      where: {
        userId,
        contentType: input.contentType,
        contentId: input.contentId,
      },
    });
    return {
      changed: count > 0,
      active: false as const,
      response: {
        success: true,
        code: ContentInteractionMessageCode.REMOVED_FROM_WISHLIST,
        message: "Removed from wishlist.",
        active: false,
      },
    };
  }

  async enrollContent(userId: string, input: ContentActionInput) {
    await this.resolveContent(input.contentType, input.contentId);
    if (input.contentType === ContentType.EVENT)
      return this.registerEvent(userId, input.contentId);
    const enrollment = await this.prismaService.contentEnrollment.upsert({
      where: {
        userId_contentType_contentId: {
          userId,
          contentType: input.contentType,
          contentId: input.contentId,
        },
      },
      create: {
        userId,
        contentType: input.contentType,
        contentId: input.contentId,
        status: ContentEnrollmentStatus.ACTIVE,
      },
      update: {
        status: ContentEnrollmentStatus.ACTIVE,
        canceledAt: null,
      },
    });
    return {
      success: true,
      code: ContentInteractionMessageCode.ENROLLMENT_CREATED,
      message: "Enrollment created successfully.",
      active: enrollment.status === ContentEnrollmentStatus.ACTIVE,
    };
  }

  async cancelContentEnrollment(userId: string, input: ContentActionInput) {
    if (input.contentType === ContentType.EVENT) {
      await this.eventsApi.cancelEventRegistration({
        userId,
        eventId: input.contentId,
      });
      return {
        success: true,
        code: ContentInteractionMessageCode.EVENT_REGISTRATION_CANCELED,
        message: "Event registration canceled.",
        active: false,
      };
    }
    const enrollment = await this.prismaService.contentEnrollment.findUnique({
      where: {
        userId_contentType_contentId: {
          userId,
          contentType: input.contentType,
          contentId: input.contentId,
        },
      },
    });
    if (!enrollment) throw new NotFoundException("Enrollment not found.");
    await this.prismaService.contentEnrollment.update({
      where: { id: enrollment.id },
      data: {
        status: ContentEnrollmentStatus.CANCELED,
        canceledAt: new Date(),
      },
    });
    return {
      success: true,
      code: ContentInteractionMessageCode.ENROLLMENT_CANCELED,
      message: "Enrollment canceled.",
      active: false,
    };
  }

  async updateEnrollmentProgress(
    userId: string,
    input: UpdateEnrollmentProgressInput,
  ) {
    if (input.contentType === ContentType.EVENT) {
      throw new BadRequestException(
        "Event progress is handled through attendance.",
      );
    }
    const enrollment = await this.prismaService.contentEnrollment.findUnique({
      where: {
        userId_contentType_contentId: {
          userId,
          contentType: input.contentType,
          contentId: input.contentId,
        },
      },
    });
    if (!enrollment) throw new NotFoundException("Enrollment not found.");
    await this.prismaService.contentEnrollment.update({
      where: { id: enrollment.id },
      data: {
        progress: input.progress,
        status:
          input.progress >= 100
            ? ContentEnrollmentStatus.COMPLETED
            : ContentEnrollmentStatus.ACTIVE,
        completedAt: input.progress >= 100 ? new Date() : null,
      },
    });
    return {
      success: true,
      code: ContentInteractionMessageCode.ENROLLMENT_PROGRESS_UPDATED,
      message: "Enrollment progress updated.",
      active: true,
    };
  }

  async myEnrollments(userId: string) {
    return this.prismaService.contentEnrollment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async submitReview(userId: string, input: SubmitContentReviewInput) {
    await this.resolveContent(input.contentType, input.contentId);
    const review = await this.prismaService.contentReview.upsert({
      where: {
        userId_contentType_contentId: {
          userId,
          contentType: input.contentType,
          contentId: input.contentId,
        },
      },
      create: {
        userId,
        contentType: input.contentType,
        contentId: input.contentId,
        rating: input.rating,
        comment: input.comment?.trim(),
      },
      update: {
        rating: input.rating,
        comment: input.comment?.trim(),
      },
    });
    await this.recalculateRating(input.contentType, input.contentId);
    return review;
  }

  async deleteReview(userId: string, input: ContentActionInput) {
    const review = await this.prismaService.contentReview.findUnique({
      where: {
        userId_contentType_contentId: {
          userId,
          contentType: input.contentType,
          contentId: input.contentId,
        },
      },
    });
    if (!review) throw new NotFoundException("Review not found.");
    await this.prismaService.contentReview.delete({
      where: { id: review.id },
    });
    await this.recalculateRating(input.contentType, input.contentId);
    return {
      success: true,
      code: ContentInteractionMessageCode.REVIEW_DELETED,
      message: "Review deleted.",
      active: false,
    };
  }

  async contentReviews(contentType: ContentType, contentId: string) {
    return this.prismaService.contentReview.findMany({
      where: {
        contentType,
        contentId,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async myReviewForContent(
    userId: string,
    contentType: ContentType,
    contentId: string,
  ) {
    return this.prismaService.contentReview.findUnique({
      where: {
        userId_contentType_contentId: {
          userId,
          contentType,
          contentId,
        },
      },
    });
  }

  async addToCart(userId: string, input: ContentActionInput) {
    const content = await this.resolveContent(
      input.contentType,
      input.contentId,
    );
    if (content.isFree || content.price <= 0) {
      throw new BadRequestException(
        ContentInteractionMessageCode.CONTENT_NOT_PURCHASABLE,
      );
    }
    const cart = await this.getOrCreateActiveCart(userId);
    await this.prismaService.cartItem.upsert({
      where: {
        cartId_contentType_contentId: {
          cartId: cart.id,
          contentType: input.contentType,
          contentId: input.contentId,
        },
      },
      create: {
        cartId: cart.id,
        contentType: input.contentType,
        contentId: input.contentId,
        titleSnapshot: content.title,
        priceSnapshot: content.price,
        currency: content.currency,
      },
      update: {
        status: CartItemStatus.ACTIVE,
        titleSnapshot: content.title,
        priceSnapshot: content.price,
        currency: content.currency,
      },
    });
    return {
      success: true,
      code: ContentInteractionMessageCode.ADDED_TO_CART,
      message: "Added to cart.",
      active: true,
    };
  }

  async removeFromCart(userId: string, input: ContentActionInput) {
    const cart = await this.getOrCreateActiveCart(userId);
    const item = await this.prismaService.cartItem.findUnique({
      where: {
        cartId_contentType_contentId: {
          cartId: cart.id,
          contentType: input.contentType,
          contentId: input.contentId,
        },
      },
    });
    if (!item) {
      return {
        success: true,
        code: ContentInteractionMessageCode.REMOVED_FROM_CART,
        message: "Removed from cart.",
        active: false,
      };
    }
    await this.prismaService.cartItem.update({
      where: { id: item.id },
      data: {
        status: CartItemStatus.REMOVED,
      },
    });
    return {
      success: true,
      code: ContentInteractionMessageCode.REMOVED_FROM_CART,
      message: "Removed from cart.",
      active: false,
    };
  }

  async myCart(userId: string) {
    return this.prismaService.cart.findFirst({
      where: {
        userId,
        status: CartStatus.ACTIVE,
      },
      include: {
        items: {
          where: {
            status: CartItemStatus.ACTIVE,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });
  }

  async clearCart(userId: string) {
    const cart = await this.getOrCreateActiveCart(userId);
    await this.prismaService.cartItem.updateMany({
      where: {
        cartId: cart.id,
        status: CartItemStatus.ACTIVE,
      },
      data: {
        status: CartItemStatus.REMOVED,
      },
    });
    return {
      success: true,
      code: ContentInteractionMessageCode.CART_CLEARED,
      message: "Cart cleared.",
      active: false,
    };
  }

  async contentInteractionStatus(
    userId: string,
    contentType: ContentType,
    contentId: string,
  ) {
    const [wishlist, enrollment, review, cart] = await Promise.all([
      this.prismaService.wishlistItem.findUnique({
        where: {
          userId_contentType_contentId: {
            userId,
            contentType,
            contentId,
          },
        },
      }),
      this.prismaService.contentEnrollment.findUnique({
        where: {
          userId_contentType_contentId: {
            userId,
            contentType,
            contentId,
          },
        },
      }),
      this.prismaService.contentReview.findUnique({
        where: {
          userId_contentType_contentId: {
            userId,
            contentType,
            contentId,
          },
        },
      }),
      this.myCart(userId),
    ]);
    const cartItem = cart?.items?.find(
      (item) =>
        item.contentType === contentType && item.contentId === contentId,
    );
    return {
      isWishlisted: Boolean(wishlist),
      isEnrolled:
        enrollment?.status === ContentEnrollmentStatus.ACTIVE ||
        enrollment?.status === ContentEnrollmentStatus.COMPLETED,
      myRating: review?.rating ?? null,
      isInCart: Boolean(cartItem),
    };
  }

  /**
   * One active cart per user, enforced by the partial unique index on
   * `Cart(userId) WHERE status = 'ACTIVE'` rather than by the read below.
   *
   * The read is the fast path. When two requests both find no cart and both
   * try to create one, the index rejects the loser, and the right answer for
   * that request is the cart the winner made — not an internal error.
   */
  private async getOrCreateActiveCart(userId: string) {
    const existing = await this.prismaService.cart.findFirst({
      where: { userId, status: CartStatus.ACTIVE },
    });
    if (existing) return existing;
    try {
      return await this.prismaService.cart.create({
        data: { userId, status: CartStatus.ACTIVE },
      });
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
      this.logger.warn("Recovered a concurrent active-cart creation", {
        userId,
        correlationId: requestContext.correlationId(),
      });
      return this.prismaService.cart.findFirstOrThrow({
        where: { userId, status: CartStatus.ACTIVE },
      });
    }
  }

  private async registerEvent(userId: string, eventId: string) {
    await this.eventsApi.enrollInEvent({ eventId, userId });
    return {
      success: true,
      code: ContentInteractionMessageCode.EVENT_REGISTERED,
      message: "Event registered successfully.",
      active: true,
    };
  }

  private async resolveContent(
    contentType: ContentType,
    contentId: string,
  ): Promise<TResolvedContentForAction> {
    try {
      const content =
        contentType === ContentType.COURSE
          ? await this.courseApi.resolveCourse(contentId)
          : contentType === ContentType.EVENT
            ? await this.eventsApi.resolveEvent(contentId)
            : contentType === ContentType.PODCAST
              ? await this.podcastApi.resolvePodcast(contentId)
              : await this.youtubeApi.resolveChannel(contentId);
      return { ...content, contentType };
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(
          ContentInteractionMessageCode.CONTENT_NOT_FOUND,
        );
      throw error;
    }
  }

  /**
   * Recompute a content item's rating aggregate from the review rows that are
   * its source of truth, and publish it.
   *
   * Read-then-write is the whole hazard here: two reviewers submitting at once
   * can both read, and the one that reads the older set can commit last,
   * leaving an average that matches no version of the data. The advisory lock
   * closes that window by serialising recomputation per content item, and the
   * write happens inside the same transaction that holds the lock, so the
   * ordering the lock establishes is the ordering the ratings land in.
   *
   * The lock is transaction-scoped, so a crash releases it as surely as a
   * commit does, and it is taken on a hash of the content key, so reviews of
   * different items never wait on each other.
   */
  private async recalculateRating(contentType: ContentType, contentId: string) {
    await this.prismaService.$transaction(async (tx) => {
      // `$executeRaw`, not `$queryRaw`: the lock function returns void, which
      // has no Prisma type to deserialize into. The lock is taken either way.
      await tx.$executeRaw`
        SELECT pg_advisory_xact_lock(
          hashtext('content-review-aggregate'),
          hashtext(${`${contentType}:${contentId}`})
        )`;
      const aggregate = await tx.contentReview.aggregate({
        where: { contentType, contentId },
        _avg: { rating: true },
        _count: { rating: true },
      });
      await this.publishRating(
        contentType,
        contentId,
        aggregate._avg.rating ?? 0,
        aggregate._count.rating ?? 0,
        tx,
      );
    });
  }

  private publishRating(
    contentType: ContentType,
    contentId: string,
    average: number,
    count: number,
    writer: Prisma.TransactionClient,
  ) {
    if (contentType === ContentType.COURSE)
      return this.courseApi.updateCourseRating(
        contentId,
        average,
        count,
        writer,
      );
    if (contentType === ContentType.EVENT)
      return this.eventsApi.updateEventRating(
        contentId,
        average,
        count,
        writer,
      );
    if (contentType === ContentType.PODCAST)
      return this.podcastApi.updatePodcastRating(
        contentId,
        average,
        count,
        writer,
      );
    return this.youtubeApi.updateChannelRating(
      contentId,
      average,
      count,
      writer,
    );
  }
}
