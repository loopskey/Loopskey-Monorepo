"use client";

import { Skeleton } from "@ui/skeleton";

export const DashboardSidebarSkeleton = () => {
  return (
    <aside className="flex h-full w-[72px] shrink-0 flex-col bg-primary md:w-64">
      <div className="flex h-16 shrink-0 items-center justify-center px-2 md:justify-start md:px-4">
        <Skeleton className="size-8 rounded-md bg-primary-foreground/20 md:w-28" />
      </div>

      <div className="min-h-0 flex-1 py-2 pl-2 md:pl-3">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton
            key={index}
            className="mb-1 h-14 rounded-l-[24px] bg-primary-foreground/15 md:h-[60px] md:rounded-l-[30px]"
          />
        ))}
      </div>

      <div className="shrink-0 border-t border-primary-foreground/20 p-2 md:p-3">
        <Skeleton className="h-12 rounded-md bg-primary-foreground/15" />
      </div>
    </aside>
  );
};

export const DashboardContentSkeleton = () => {
  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div className="space-y-3">
          <Skeleton className="h-4 w-40 rounded-full" />
          <Skeleton className="h-10 w-72 rounded-md md:w-96" />
          <Skeleton className="h-5 w-full max-w-2xl rounded-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-11 w-28 rounded-full" />
          <Skeleton className="h-11 w-32 rounded-full" />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-lg border p-5"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-md" />
            </div>
            <Skeleton className="mt-5 h-9 w-24 rounded-xl" />
            <Skeleton className="mt-4 h-3 w-full rounded-full" />
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="rounded-lg border p-6">
          <Skeleton className="h-6 w-52 rounded-xl" />
          <Skeleton className="mt-2 h-4 w-72 rounded-full" />
          <Skeleton className="mt-6 h-80 rounded-lg" />
        </div>

        <div className="rounded-lg border p-6">
          <Skeleton className="h-6 w-44 rounded-xl" />
          <Skeleton className="mt-2 h-4 w-64 rounded-full" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-20 rounded-lg" />
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-lg border p-6">
        <Skeleton className="h-6 w-48 rounded-xl" />
        <Skeleton className="mt-2 h-4 w-72 rounded-full" />
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-32 rounded-lg" />
          ))}
        </div>
      </section>
    </div>
  );
};

export const DashboardPageSkeleton = () => {
  return (
    <div className="flex h-[calc(100dvh-4rem)] overflow-hidden">
      <DashboardSidebarSkeleton />
      <main className="min-w-0 flex-1 overflow-y-auto bg-background px-3 py-4 md:px-6 md:py-6">
        <div className="mx-auto max-w-7xl">
          <DashboardContentSkeleton />
        </div>
      </main>
    </div>
  );
};
