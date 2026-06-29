import { GlassCard } from "@elements/glass-card";

const DetailSkeleton = () => {
  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <GlassCard className="h-[420px] animate-pulse" glow={false} />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <GlassCard className="h-[520px] animate-pulse" glow={false} />
          <GlassCard className="h-[320px] animate-pulse" glow={false} />
        </div>
      </div>
    </main>
  );
};

export default DetailSkeleton;
