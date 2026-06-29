import { TLearningParticlesBackgroundProps } from "@/types/element.types";
import { TParticleStyle } from "@/types/element.types";
import { cn } from "@/lib/utils";

const PARTICLES = Array.from({ length: 42 }).map((_, index) => {
  const x = `${(index * 37) % 100}%`;
  const y = `${(index * 61) % 100}%`;
  const z = `${(index % 9) * 12}px`;
  const s = `${0.55 + (index % 7) * 0.13}`;
  const d = `${7 + (index % 8)}s`;
  const delay = `${-(index % 10) * 0.75}s`;
  const mx = `${index % 2 === 0 ? 16 + (index % 6) * 4 : -16 - (index % 6) * 4}px`;
  const my = `${index % 3 === 0 ? 18 + (index % 5) * 4 : -14 - (index % 5) * 4}px`;
  return {
    x,
    y,
    z,
    s,
    d,
    delay,
    mx,
    my,
  };
});

export const LearningParticlesBackground = ({
  className,
  withGrid = true,
  withNoise = true,
  particleCount = 42,
}: TLearningParticlesBackgroundProps) => {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "learning-bg pointer-events-none fixed inset-0 -z-50 overflow-hidden",
        className,
      )}
    >
      <div className="absolute inset-0 perspective-[900px]">
        {PARTICLES.slice(0, particleCount).map((particle, index) => {
          const style: TParticleStyle = {
            "--x": particle.x,
            "--y": particle.y,
            "--z": particle.z,
            "--s": particle.s,
            "--d": particle.d,
            "--delay": particle.delay,
            "--mx": particle.mx,
            "--my": particle.my,
          };

          return (
            <span
              key={index}
              style={style}
              className={cn(
                "particle-3d absolute left-0 top-0 h-2 w-2 rounded-full",
                "bg-primary/30 shadow-[0_0_28px_rgba(59,130,246,0.45)]",
                "dark:bg-primary/35 dark:shadow-[0_0_34px_rgba(129,140,248,0.42)]",
                index % 5 === 0 && "h-3 w-3 bg-accent/35",
                index % 7 === 0 && "h-1.5 w-1.5 bg-premium/40",
              )}
            />
          );
        })}
      </div>

      {withGrid && (
        <div
          className={cn(
            "absolute inset-0 opacity-[0.18] dark:opacity-[0.11]",
            "bg-[linear-gradient(to_right,oklch(0.55_0.19_255/0.18)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.55_0.19_255/0.14)_1px,transparent_1px)]",
            "bg-[size:64px_64px]",
          )}
        />
      )}

      {withNoise && (
        <div className="absolute inset-0 opacity-[0.045] [background-image:radial-gradient(circle_at_center,currentColor_1px,transparent_1px)] [background-size:6px_6px]" />
      )}

      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
};
