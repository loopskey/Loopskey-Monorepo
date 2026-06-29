"use client";

import { Quote, Sparkles, Star } from "lucide-react";
import { RevealOnScroll } from "@elements/reveal-scroll";
import { GlassCard } from "@elements/glass-card";
import { useMemo } from "react";
import { useI18n } from "@hooks/useI18n";
import { cn } from "@lib/utils";

type TestimonialItem = {
  key: string;
  avatar: string;
  rating: number;
};

const testimonialItems: TestimonialItem[] = [
  {
    key: "engineer",
    avatar: "DP",
    rating: 5,
  },
  {
    key: "organization",
    avatar: "MG",
    rating: 5,
  },
  {
    key: "provider",
    avatar: "AN",
    rating: 5,
  },
];

const LandingTestimonials = () => {
  const { t } = useI18n();

  const testimonials = useMemo(() => {
    return testimonialItems.map((item) => ({
      ...item,
      quote: t(`landing.testimonials.items.${item.key}.quote`),
      name: t(`landing.testimonials.items.${item.key}.name`),
      role: t(`landing.testimonials.items.${item.key}.role`),
      tag: t(`landing.testimonials.items.${item.key}.tag`),
    }));
  }, [t]);

  return (
    <section className="relative overflow-x-clip px-4 py-16 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-0 top-16 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <RevealOnScroll direction="up">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-glass-border bg-background/55 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-primary shadow-sm backdrop-blur-xl ring-1 ring-white/40 dark:ring-white/5">
              <Sparkles className="h-4 w-4" />
              {t("landing.testimonials.eyebrow")}
            </span>

            <h2 className="mt-5 text-3xl font-medium leading-tight text-foreground md:text-5xl">
              {t("landing.testimonials.title")}
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {t("landing.testimonials.description")}
            </p>
          </div>
        </RevealOnScroll>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {testimonials.map((item, index) => (
            <RevealOnScroll
              key={item.key}
              delay={index * 110}
              direction={index === 1 ? "up" : index === 0 ? "left" : "right"}
            >
              <GlassCard
                glow={false}
                className={cn(
                  "group relative h-full overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:bg-primary/5",
                  index === 1 && "lg:-mt-6",
                )}
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.12),transparent_34%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="relative z-10 flex h-full flex-col">
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: item.rating }).map(
                        (_, starIndex) => (
                          <Star
                            key={`${item.key}-star-${starIndex}`}
                            className="h-4 w-4 fill-primary text-primary"
                          />
                        ),
                      )}
                    </div>

                    <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                      {item.tag}
                    </span>
                  </div>

                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                    <Quote className="h-6 w-6" />
                  </div>

                  <blockquote className="flex-1 text-base leading-8 text-foreground/90">
                    “{item.quote}”
                  </blockquote>

                  <div className="mt-8 flex items-center gap-4 border-t border-glass-border pt-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 text-sm font-bold text-primary ring-1 ring-primary/20">
                      {item.avatar}
                    </div>

                    <div>
                      <p className="font-semibold text-foreground">
                        {item.name}
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.role}
                      </p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingTestimonials;
