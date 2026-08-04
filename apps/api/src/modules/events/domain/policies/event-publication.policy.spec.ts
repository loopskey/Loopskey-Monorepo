import { EventStatus } from "@prisma/client";
import { shouldEmitEventPublished } from "./event-publication.policy";

describe("event publication policy", () => {
  it("emits a fact only when publication changes state", () => {
    expect(shouldEmitEventPublished(EventStatus.DRAFT)).toBe(true);
    expect(shouldEmitEventPublished(EventStatus.ARCHIVED)).toBe(true);
    expect(shouldEmitEventPublished(EventStatus.PUBLISHED)).toBe(false);
  });
});
