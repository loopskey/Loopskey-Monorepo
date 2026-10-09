import { Injectable } from "@nestjs/common";

const DEDUPE_WINDOW_MS = 30 * 60 * 1000;
const VIEWER_WINDOW_MS = 60 * 60 * 1000;
const VIEWER_LIMIT = 60;

type ViewerBucket = { count: number; resetAt: number };

@Injectable()
export class EventViewSignalLimiter {
  private readonly seen = new Map<string, number>();
  private readonly viewers = new Map<string, ViewerBucket>();

  allow(viewerKey: string, eventId: string, now = Date.now()) {
    this.evictExpired(now);
    const seenKey = `${viewerKey}:${eventId}`;
    if ((this.seen.get(seenKey) ?? 0) > now) return false;

    const bucket = this.viewers.get(viewerKey);
    if (!bucket) {
      this.viewers.set(viewerKey, {
        count: 1,
        resetAt: now + VIEWER_WINDOW_MS,
      });
    } else if (bucket.count >= VIEWER_LIMIT) {
      return false;
    } else {
      bucket.count += 1;
    }

    this.seen.set(seenKey, now + DEDUPE_WINDOW_MS);
    return true;
  }

  private evictExpired(now: number) {
    for (const [key, expiresAt] of this.seen)
      if (expiresAt <= now) this.seen.delete(key);
    for (const [key, bucket] of this.viewers)
      if (bucket.resetAt <= now) this.viewers.delete(key);
  }
}
