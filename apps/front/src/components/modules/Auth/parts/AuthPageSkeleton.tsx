"use client";

import { GlassCard } from "@elements/glass-card";
import { Skeleton } from "@ui/skeleton";

const AuthPageSkeleton = () => {
  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
        <div className="flex justify-center lg:justify-start">
          <GlassCard className="w-full max-w-md">
            <div className="space-y-6">
              <Skeleton className="h-11 w-full rounded-md" />
              <div className="space-y-5">
                <Skeleton className="h-11 w-full rounded-md" />
                <Skeleton className="h-11 w-full rounded-md" />
                <Skeleton className="h-11 w-full rounded-md" />
                <Skeleton className="h-11 w-full rounded-md" />
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="order-1 flex flex-col items-center lg:order-2 lg:items-start">
          <Skeleton className="h-10 w-72 rounded-md sm:w-96" />
          <Skeleton className="mt-5 h-5 w-full max-w-xl rounded-full" />

          <div className="mt-8 grid w-full gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-lg border p-4">
                <div className="flex gap-3">
                  <Skeleton className="h-10 w-10 shrink-0 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32 rounded-full" />
                    <Skeleton className="h-3 w-full rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex w-full items-center gap-4">
            <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
            <Skeleton className="h-4 w-48 rounded-full" />
          </div>
        </div>
      </section>
    </main>
  );
};

export default AuthPageSkeleton;
