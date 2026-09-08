import { TGlassCardProps } from "@/types/element.types";
import { cn } from "@/lib/utils";

export const GlassCard = ({
  className,
  glow: _glow,
  ...props
}: TGlassCardProps) => {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-4 text-card-foreground shadow-sm md:p-6",
        className,
      )}
      {...props}
    />
  );
};
