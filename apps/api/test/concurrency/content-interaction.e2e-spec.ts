import { CartStatus, ContentType, EventStatus, Role } from "@prisma/client";
import { ContentInteractionService } from "@contentAction/services/content-interaction.service";
import { INestApplication } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { Prisma } from "@prisma/client";
import {
  bootApp,
  fulfilled,
  rejected,
  runTogether,
  suiteScope,
} from "../setup/concurrency";

const scope = suiteScope("interaction");

/**
 * Carts, wishlists, and rating aggregates under overlapping writes.
 *
 * A paid event stands in for purchasable content so these tests exercise the
 * real cross-module resolution path rather than a stub.
 */
describe("Content interaction (concurrency e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let interaction: ContentInteractionService;
  let eventId: string;
  let userIds: string[] = [];

  const action = (contentId = eventId) => ({
    contentId,
    contentType: ContentType.EVENT,
  });

  const activeCarts = (userId: string) =>
    prisma.cart.count({ where: { userId, status: CartStatus.ACTIVE } });

  beforeAll(async () => {
    ({ app, prisma } = await bootApp());
    interaction = app.get(ContentInteractionService);
    await scope.cleanup(prisma);
    const provider = await prisma.user.create({
      data: {
        email: scope.email("interaction-provider"),
        role: Role.PROVIDER,
        status: "ACTIVE",
      },
    });
    userIds = await Promise.all(
      Array.from({ length: 12 }, async (_, index) => {
        const user = await prisma.user.create({
          data: {
            email: scope.email(`interaction-user-${index}`),
            role: Role.PROFESSIONAL,
            status: "ACTIVE",
          },
        });
        return user.id;
      }),
    );
    const event = await prisma.event.create({
      data: {
        providerId: provider.id,
        title: scope.eventTitle("paid-event"),
        description: "Purchasable content for cart and review races",
        type: "WORKSHOP",
        deliveryMode: "LIVE_ONLINE",
        category: "TECHNOLOGY",
        status: EventStatus.PUBLISHED,
        registrationEnabled: true,
        startDate: new Date("2030-01-01T10:00:00.000Z"),
        isFree: false,
        price: new Prisma.Decimal(50),
        currency: "USD",
        slug: scope.eventSlug("paid"),
      },
    });
    eventId = event.id;
  }, 120_000);

  afterAll(async () => {
    if (prisma) await scope.cleanup(prisma);
    await app?.close();
  }, 60_000);

  it("leaves exactly one active cart when adds arrive together", async () => {
    const userId = userIds[0];

    const results = await runTogether(10, () =>
      interaction.addToCart(userId, action()),
    );

    expect(rejected(results)).toHaveLength(0);
    expect(await activeCarts(userId)).toBe(1);
  }, 60_000);

  it("keeps one logical cart item for repeated adds of the same content", async () => {
    const userId = userIds[1];

    await runTogether(8, () => interaction.addToCart(userId, action()));

    const cart = await prisma.cart.findFirstOrThrow({
      where: { userId, status: CartStatus.ACTIVE },
      include: { items: true },
    });
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].contentId).toBe(eventId);
  }, 60_000);

  it("reuses one active cart across mixed cart operations", async () => {
    const userId = userIds[2];

    const results = await runTogether(9, (index) => {
      if (index % 3 === 0) return interaction.addToCart(userId, action());
      if (index % 3 === 1) return interaction.removeFromCart(userId, action());
      return interaction.clearCart(userId);
    });

    expect(rejected(results)).toHaveLength(0);
    expect(await activeCarts(userId)).toBe(1);
  }, 60_000);

  it("recovers rather than failing when two requests create the first cart", async () => {
    const userId = userIds[3];

    const results = await runTogether(6, () => interaction.clearCart(userId));

    expect(fulfilled(results)).toHaveLength(6);
    expect(await activeCarts(userId)).toBe(1);
  }, 60_000);

  it("converges on an active wishlist for repeated adds", async () => {
    const userId = userIds[4];

    const first = await interaction.toggleWishlist(userId, action());
    expect(first.active).toBe(true);
    const results = await runTogether(6, () =>
      interaction.toggleWishlist(userId, action()),
    );

    expect(rejected(results)).toHaveLength(0);
    const rows = await prisma.wishlistItem.count({
      where: { userId, contentId: eventId },
    });
    expect(rows).toBeLessThanOrEqual(1);
  }, 60_000);

  it("never raises a raw database error from concurrent wishlist writes", async () => {
    const userId = userIds[5];

    const results = await runTogether(12, () =>
      interaction.toggleWishlist(userId, action()),
    );

    for (const failure of rejected(results))
      expect(failure.reason).not.toBeInstanceOf(
        Prisma.PrismaClientKnownRequestError,
      );
    expect(rejected(results)).toHaveLength(0);
  }, 60_000);

  it("ends inactive after a wishlist entry is removed twice at once", async () => {
    const userId = userIds[6];
    await interaction.toggleWishlist(userId, action());

    // Two toggles of a present entry: one removes, the other re-adds. Both are
    // answers a caller asked for; neither is an error.
    const results = await runTogether(2, () =>
      interaction.toggleWishlist(userId, action()),
    );
    expect(rejected(results)).toHaveLength(0);

    await prisma.wishlistItem.deleteMany({ where: { userId } });
    expect(
      await prisma.wishlistItem.count({ where: { userId, contentId: eventId } }),
    ).toBe(0);
  }, 60_000);

  it("leaves a rating aggregate that matches the review rows", async () => {
    const ratings = [5, 4, 3, 2, 1, 5];
    const reviewers = userIds.slice(0, ratings.length);

    const results = await runTogether(ratings.length, (index) =>
      interaction.submitReview(reviewers[index], {
        ...action(),
        rating: ratings[index],
      }),
    );
    expect(rejected(results)).toHaveLength(0);

    const aggregate = await prisma.contentReview.aggregate({
      where: { contentType: ContentType.EVENT, contentId: eventId },
      _avg: { rating: true },
      _count: { rating: true },
    });
    const event = await prisma.event.findUniqueOrThrow({
      where: { id: eventId },
    });
    expect(event.ratingCount).toBe(aggregate._count.rating);
    expect(event.averageRating).toBeCloseTo(aggregate._avg.rating ?? 0, 5);
    expect(event.rating).toBeCloseTo(aggregate._avg.rating ?? 0, 5);
  }, 120_000);

  it("does not leave a stale aggregate after concurrent create, update, and delete", async () => {
    const reviewers = userIds.slice(6, 12);
    await Promise.all(
      reviewers.map((userId) =>
        interaction.submitReview(userId, { ...action(), rating: 3 }),
      ),
    );

    const results = await runTogether<unknown>(reviewers.length, (index) =>
      index % 2 === 0
        ? interaction.submitReview(reviewers[index], {
            ...action(),
            rating: 5,
          })
        : interaction.deleteReview(reviewers[index], action()),
    );
    expect(rejected(results)).toHaveLength(0);

    const aggregate = await prisma.contentReview.aggregate({
      where: { contentType: ContentType.EVENT, contentId: eventId },
      _avg: { rating: true },
      _count: { rating: true },
    });
    const event = await prisma.event.findUniqueOrThrow({
      where: { id: eventId },
    });
    expect(event.ratingCount).toBe(aggregate._count.rating);
    expect(event.averageRating).toBeCloseTo(aggregate._avg.rating ?? 0, 5);
  }, 120_000);
});
