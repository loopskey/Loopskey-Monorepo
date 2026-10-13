import { OutboxHandlerRegistry } from "@infrastructure/outbox/outbox-handler.port";
import { WishlistContentService } from "@contentAction/services/wishlist-content.service";
import { CatalogContentChangedHandler } from "@contentAction/handlers/catalog-content-changed.handler";

const setup = () => {
  const refreshWishlistSearchDocuments = jest.fn().mockResolvedValue(undefined);
  const wishlistContentService = {
    refreshWishlistSearchDocuments,
  } as unknown as WishlistContentService;
  const registry = { register: jest.fn() } as unknown as OutboxHandlerRegistry;
  const handler = new CatalogContentChangedHandler(
    registry,
    wishlistContentService,
  );
  return { handler, registry, refreshWishlistSearchDocuments };
};

describe("CatalogContentChangedHandler", () => {
  it("registers itself for catalog.content.changed on init", () => {
    const { handler, registry } = setup();
    handler.onModuleInit();
    expect(handler.eventName).toBe("catalog.content.changed");
    expect(registry.register).toHaveBeenCalledWith(handler);
  });

  it("refreshes the wishlist search document view when handled", async () => {
    const { handler, refreshWishlistSearchDocuments } = setup();
    await handler.handle();
    expect(refreshWishlistSearchDocuments).toHaveBeenCalledTimes(1);
  });
});
