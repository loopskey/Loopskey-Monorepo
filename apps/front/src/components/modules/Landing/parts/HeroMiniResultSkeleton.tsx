const HeroMiniResultSkeleton = () => {
  return (
    <div className="rounded-lg border p-3 shadow-sm">
      <div className="flex gap-3">
        <div className="h-16 w-16 animate-pulse rounded-md bg-muted" />
        <div className="min-w-0 flex-1 space-y-3 py-1">
          <div className="h-3 w-24 animate-pulse rounded-full bg-muted" />
          <div className="h-4 w-full animate-pulse rounded-full bg-muted" />
          <div className="h-3 w-32 animate-pulse rounded-full bg-muted" />
        </div>
      </div>
    </div>
  );
};

export default HeroMiniResultSkeleton;
