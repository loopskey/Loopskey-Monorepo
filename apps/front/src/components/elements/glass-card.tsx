import { TGlassCardProps } from "@/types/element.types";
import { cn } from "@/lib/utils";

export const GlassCard = ({
  className,
  glow = true,
  ...props
}: TGlassCardProps) => {
  return (
    <div
      className={cn(
        "glass-panel glass-card-enter rounded-[2rem] p-6 md:p-5",
        "transition-transform duration-500 hover:-translate-y-1",
        glow &&
          "before:pointer-events-none before:absolute before:inset-x-8 before:top-0 before:z-[1] before:h-px before:bg-gradient-to-r before:from-transparent before:via-primary/55 before:to-transparent",
        className,
      )}
      {...props}
    />
  );
};
