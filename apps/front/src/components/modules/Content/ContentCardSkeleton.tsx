import { GlassCard } from "@elements/glass-card";
import { cn } from "@/lib/utils";

const ContentCardSkeleton = ({ className }: { className?: string }) => {
  return (
    <GlassCard
      glow={false}
      className={cn("overflow-hidden p-0", "animate-pulse", className)}
    >
      <div className="relative z-10">
        <div className="h-48 w-full rounded-t-[2rem] bg-muted/70" />
        <div className="space-y-4 p-5">
          <div className="h-4 w-24 rounded-full bg-muted" />
          <div className="h-6 w-4/5 rounded-full bg-muted" />
          <div className="h-4 w-full rounded-full bg-muted" />
          <div className="h-4 w-3/4 rounded-full bg-muted" />
          <div className="flex items-center justify-between pt-4">
            <div className="h-9 w-24 rounded-full bg-muted" />
            <div className="h-9 w-28 rounded-full bg-muted" />
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default ContentCardSkeleton;
