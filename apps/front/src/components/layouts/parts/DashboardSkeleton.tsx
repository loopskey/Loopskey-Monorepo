"use client";

import { Skeleton } from "@ui/skeleton";

export const DashboardSidebarSkeleton = () => {
  return (
    <aside className="sticky top-0 hidden h-screen shrink-0 border-r border-glass-border md:block md:w-[84px] xl:w-72">
      <div className="flex h-full flex-col">
        <div className="flex h-20 items-center justify-center px-4 xl:justify-start">
          <Skeleton className="h-10 w-10 rounded-2xl xl:w-36" />
        </div>

        <div className="mt-4 space-y-2 px-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-14 rounded-2xl" />
          ))}
        </div>

        <div className="mt-auto border-t border-glass-border p-3">
          <Skeleton className="h-12 rounded-2xl" />
        </div>
      </div>
    </aside>
  );
};

export const DashboardBottomNavSkeleton = () => {
  return (
    <nav className="fixed bottom-3 left-3 right-3 z-50 rounded-[2rem] border border-glass-border bg-background/85 p-2 shadow-2xl backdrop-blur-2xl md:hidden">
      <div className="grid grid-cols-4 gap-1">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-14 rounded-2xl" />
        ))}
      </div>
    </nav>
  );
};

export const DashboardContentSkeleton = () => {
  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div className="space-y-3">
          <Skeleton className="h-4 w-40 rounded-full" />
          <Skeleton className="h-10 w-72 rounded-2xl md:w-96" />
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
            className="rounded-[2rem] border border-glass-border bg-background/60 p-5 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-2xl" />
            </div>
            <Skeleton className="mt-5 h-9 w-24 rounded-xl" />
            <Skeleton className="mt-4 h-3 w-full rounded-full" />
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="rounded-[2rem] border border-glass-border bg-background/60 p-6 backdrop-blur-xl">
          <Skeleton className="h-6 w-52 rounded-xl" />
          <Skeleton className="mt-2 h-4 w-72 rounded-full" />
          <Skeleton className="mt-6 h-80 rounded-[2rem]" />
        </div>

        <div className="rounded-[2rem] border border-glass-border bg-background/60 p-6 backdrop-blur-xl">
          <Skeleton className="h-6 w-44 rounded-xl" />
          <Skeleton className="mt-2 h-4 w-64 rounded-full" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-20 rounded-3xl" />
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-glass-border bg-background/60 p-6 backdrop-blur-xl">
        <Skeleton className="h-6 w-48 rounded-xl" />
        <Skeleton className="mt-2 h-4 w-72 rounded-full" />
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-32 rounded-3xl" />
          ))}
        </div>
      </section>
    </div>
  );
};

export const DashboardPageSkeleton = () => {
  return (
    <div className="min-h-screen">
      <div className="flex min-h-screen overflow-hidden">
        <DashboardSidebarSkeleton />
        <main className="min-w-0 flex-1 overflow-y-auto px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-8">
          <div className="mx-auto max-w-7xl">
            <DashboardContentSkeleton />
          </div>
        </main>
      </div>
      <DashboardBottomNavSkeleton />
    </div>
  );
};
