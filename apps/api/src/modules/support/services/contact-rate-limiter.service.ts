import { Injectable } from "@nestjs/common";

type Bucket = { count: number; resetAt: number };

@Injectable()
export class ContactRateLimiterService {
  private readonly buckets = new Map<string, Bucket>();
  private readonly recentSubmissions = new Map<string, number>();

  consume(key: string, limit: number, windowMs: number, now = Date.now()) {
    this.evictExpired(now);
    const bucket = this.buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, retryAfterSeconds: 0 };
    }
    if (bucket.count >= limit) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(
          1,
          Math.ceil((bucket.resetAt - now) / 1000),
        ),
      };
    }
    bucket.count += 1;
    return { allowed: true, retryAfterSeconds: 0 };
  }

  claim(key: string, windowMs: number, now = Date.now()) {
    this.evictExpired(now);
    const seenAt = this.recentSubmissions.get(key);
    if (seenAt !== undefined && seenAt > now) return false;
    this.recentSubmissions.set(key, now + windowMs);
    return true;
  }

  release(key: string) {
    this.recentSubmissions.delete(key);
  }

  private evictExpired(now: number) {
    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) this.buckets.delete(key);
    }
    for (const [key, expiresAt] of this.recentSubmissions) {
      if (expiresAt <= now) this.recentSubmissions.delete(key);
    }
  }
}
