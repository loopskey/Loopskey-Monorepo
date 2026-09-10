import { OutboxHandlerRegistry } from "@infrastructure/outbox/outbox-handler.port";
import { PrismaService } from "@prisma/prisma.service";
import {
  IngestionItemPublishedHandler,
  unfetchableReason,
} from "@ingestion/handlers/ingestion-item-published.handler";

const setup = (
  item: { id: string; imageCandidateUrl: string | null } | null,
) => {
  const findUnique = jest.fn().mockResolvedValue(item);
  const updateMany = jest.fn().mockResolvedValue({ count: 1 });
  const prisma = {
    ingestionItem: { findUnique, updateMany },
  } as unknown as PrismaService;
  const registry = { register: jest.fn() } as unknown as OutboxHandlerRegistry;
  const handler = new IngestionItemPublishedHandler(prisma, registry);
  return { handler, findUnique, updateMany, registry };
};

describe("IngestionItemPublishedHandler", () => {
  it("registers itself for ingestion.item.published on init", () => {
    const { handler, registry } = setup(null);
    handler.onModuleInit();
    expect(handler.eventName).toBe("ingestion.item.published");
    expect(registry.register).toHaveBeenCalledWith(handler);
  });

  it("leaves a well-formed public https candidate in place and makes no write", async () => {
    const { handler, updateMany } = setup({
      id: "item-1",
      imageCandidateUrl: "https://images.example.com/a.jpg",
    });
    await handler.handle({ itemId: "item-1" });
    expect(updateMany).not.toHaveBeenCalled();
  });

  it("discards a candidate that is not fetchable and clears it on the item", async () => {
    const { handler, updateMany } = setup({
      id: "item-2",
      imageCandidateUrl: "http://images.example.com/a.jpg",
    });
    await handler.handle({ itemId: "item-2" });
    expect(updateMany).toHaveBeenCalledWith({
      where: {
        id: "item-2",
        imageCandidateUrl: "http://images.example.com/a.jpg",
      },
      data: { imageCandidateUrl: null },
    });
  });

  it("does nothing when the item has no candidate", async () => {
    const { handler, updateMany } = setup({
      id: "item-3",
      imageCandidateUrl: null,
    });
    await handler.handle({ itemId: "item-3" });
    expect(updateMany).not.toHaveBeenCalled();
  });

  it("does nothing when the item no longer exists", async () => {
    const { handler, updateMany } = setup(null);
    await handler.handle({ itemId: "gone" });
    expect(updateMany).not.toHaveBeenCalled();
  });

  it("ignores a payload without a string itemId", async () => {
    const { handler, findUnique } = setup(null);
    await handler.handle({});
    await handler.handle({ itemId: 42 });
    expect(findUnique).not.toHaveBeenCalled();
  });
});

describe("unfetchableReason", () => {
  it.each([
    ["https://cdn.example.com/x.png", null],
    ["https://sub.example.co.uk/x.png?v=2", null],
    ["http://cdn.example.com/x.png", "not https"],
    ["ftp://cdn.example.com/x.png", "not https"],
    ["not-a-url", "not a URL"],
    ["https://localhost/x.png", "loopback host"],
    ["https://build.localhost/x.png", "loopback host"],
    ["https://minio.local/x.png", "private host suffix"],
    ["https://svc.internal/x.png", "private host suffix"],
    ["https://127.0.0.1/x.png", "IP literal host"],
    ["https://10.0.0.5/x.png", "IP literal host"],
    ["https://169.254.169.254/latest/meta-data", "IP literal host"],
    ["https://[::1]/x.png", "IP literal host"],
  ])("%s -> %s", (input, expected) => {
    expect(unfetchableReason(input)).toBe(expected);
  });
});
