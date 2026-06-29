import { GlassCard } from "@elements/glass-card";

const LandingContentSkeleton = () => {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.35fr]">
      <GlassCard className="h-[620px] animate-pulse" glow={false}>
        <div className="relative z-10 space-y-5">
          <div className="h-72 rounded-3xl bg-muted" />
          <div className="h-6 w-2/3 rounded-full bg-muted" />
          <div className="h-4 w-full rounded-full bg-muted" />
          <div className="h-4 w-3/4 rounded-full bg-muted" />
          <div className="h-12 w-full rounded-2xl bg-muted" />
        </div>
      </GlassCard>

      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <GlassCard
            key={index}
            glow={false}
            className="h-[420px] animate-pulse"
          >
            <div className="relative z-10 space-y-4">
              <div className="h-44 rounded-3xl bg-muted" />
              <div className="h-5 w-3/4 rounded-full bg-muted" />
              <div className="h-4 w-full rounded-full bg-muted" />
              <div className="h-4 w-2/3 rounded-full bg-muted" />
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default LandingContentSkeleton;
