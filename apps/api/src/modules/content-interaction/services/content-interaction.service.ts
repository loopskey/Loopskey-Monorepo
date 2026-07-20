import { CartItemStatus, CartStatus, ContentType } from "@prisma/client";
import { Injectable, NotFoundException } from "@nestjs/common";
import { UpdateEnrollmentProgressInput } from "@contentAction/dtos/update-enrollment-progress.input";
import { ContentInteractionMessageCode } from "@contentAction/enums/message-code";
import { TResolvedContentForAction } from "@contentAction/types/content-interaction.types";
import { SubmitContentReviewInput } from "@contentAction/dtos/submit-content-review.input";
import { ContentEnrollmentStatus } from "@prisma/client";
import { BadRequestException } from "@nestjs/common";
import { ContentActionInput } from "@contentAction/dtos/content-action.input";
import { PrismaService } from "@prisma/prisma.service";

@Injectable()
export class ContentInteractionService {
  constructor(private readonly prismaService: PrismaService) {}

  async toggleWishlist(userId: string, input: ContentActionInput) {
    await this.resolveContent(input.contentType, input.contentId);
    const existing = await this.prismaService.wishlistItem.findUnique({
      where: {
        userId_contentType_contentId: {
          userId,
          contentType: input.contentType,
          contentId: input.contentId,
        },
      },
    });
    if (existing) {
      await this.prismaService.wishlistItem.delete({
        where: { id: existing.id },
      });
      return {
        success: true,
        code: ContentInteractionMessageCode.REMOVED_FROM_WISHLIST,
        message: "Removed from wishlist.",
        active: false,
      };
    }
    await this.prismaService.wishlistItem.create({
      data: {
        userId,
        contentType: input.contentType,
        contentId: input.contentId,
      },
    });
    return {
      success: true,
      code: ContentInteractionMessageCode.ADDED_TO_WISHLIST,
      message: "Added to wishlist.",
      active: true,
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
      const registration = await this.prismaService.eventRegistration.findFirst(
        {
          where: {
            userId,
            eventId: input.contentId,
          },
        },
      );
      if (!registration)
        throw new NotFoundException("Event registration not found.");
      await this.prismaService.eventRegistration.update({
        where: { id: registration.id },
        data: {
          status: "CANCELED",
        },
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

  private async getOrCreateActiveCart(userId: string) {
    const existing = await this.prismaService.cart.findFirst({
      where: {
        userId,
        status: CartStatus.ACTIVE,
      },
    });
    if (existing) return existing;
    return this.prismaService.cart.create({
      data: {
        userId,
        status: CartStatus.ACTIVE,
      },
    });
  }

  private async registerEvent(userId: string, eventId: string) {
    const event = await this.prismaService.event.findFirst({
      where: { id: eventId, deletedAt: null },
    });
    if (!event) {
      throw new NotFoundException(
        ContentInteractionMessageCode.CONTENT_NOT_FOUND,
      );
    }
    await this.prismaService.eventRegistration.upsert({
      where: {
        eventId_userId: { eventId, userId },
      },
      create: {
        userId,
        eventId,
        status: "REGISTERED",
      },
      update: {
        status: "REGISTERED",
      },
    });
    await this.prismaService.event.update({
      where: { id: eventId },
      data: {
        attendees: {
          increment: 1,
        },
      },
    });
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
    if (contentType === ContentType.COURSE) {
      const course = await this.prismaService.course.findFirst({
        where: { id: contentId, deletedAt: null },
      });
      if (!course)
        throw new NotFoundException(
          ContentInteractionMessageCode.CONTENT_NOT_FOUND,
        );
      return {
        id: course.id,
        title: course.title,
        price: Number(course.price ?? 0),
        currency: course.currency ?? "USD",
        isFree: course.isFree,
        contentType,
      };
    }
    if (contentType === ContentType.EVENT) {
      const event = await this.prismaService.event.findFirst({
        where: { id: contentId, deletedAt: null },
      });
      if (!event) {
        throw new NotFoundException(
          ContentInteractionMessageCode.CONTENT_NOT_FOUND,
        );
      }
      return {
        id: event.id,
        title: event.title,
        price: Number(event.price ?? 0),
        currency: event.currency ?? "USD",
        isFree: event.isFree,
        contentType,
      };
    }
    if (contentType === ContentType.PODCAST) {
      const podcast = await this.prismaService.podcast.findFirst({
        where: { id: contentId, deletedAt: null },
      });
      if (!podcast) {
        throw new NotFoundException(
          ContentInteractionMessageCode.CONTENT_NOT_FOUND,
        );
      }
      return {
        id: podcast.id,
        title: podcast.title,
        price: 0,
        currency: "USD",
        isFree: true,
        contentType,
      };
    }
    const youtube = await this.prismaService.youTubeChannel.findFirst({
      where: { id: contentId, deletedAt: null },
    });
    if (!youtube) {
      throw new NotFoundException(
        ContentInteractionMessageCode.CONTENT_NOT_FOUND,
      );
    }
    return {
      id: youtube.id,
      title: youtube.title,
      price: 0,
      currency: "USD",
      isFree: true,
      contentType,
    };
  }

  private async recalculateRating(contentType: ContentType, contentId: string) {
    const aggregate = await this.prismaService.contentReview.aggregate({
      where: {
        contentType,
        contentId,
      },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });
    const average = aggregate._avg.rating ?? 0;
    const count = aggregate._count.rating ?? 0;
    if (contentType === ContentType.COURSE) {
      await this.prismaService.course.update({
        where: { id: contentId },
        data: {
          rating: average,
          ratingCount: count,
        },
      });
    }
    if (contentType === ContentType.EVENT) {
      await this.prismaService.event.update({
        where: { id: contentId },
        data: {
          averageRating: average,
          rating: average,
          ratingCount: count,
        },
      });
    }
    if (contentType === ContentType.PODCAST) {
      await this.prismaService.podcast.update({
        where: { id: contentId },
        data: {
          rating: average,
          ratingCount: count,
        },
      });
    }
    if (contentType === ContentType.YOUTUBE) {
      await this.prismaService.youTubeChannel.update({
        where: { id: contentId },
        data: {
          rating: average,
          ratingCount: count,
        },
      });
    }
  }

}
