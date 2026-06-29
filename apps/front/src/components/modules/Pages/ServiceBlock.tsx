import { TServiceBlockProps } from "@/types/pages.types";
import { ArrowRight, Check } from "lucide-react";
import { RevealOnScroll } from "@elements/reveal-scroll";
import { GlassCard } from "@elements/glass-card";
import { useI18n } from "@hooks/useI18n";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";
import { cn } from "@lib/utils";

import Image from "next/image";
import Link from "next/link";

const ServiceBlock = ({
  index,
  service,
  consultationHref,
}: TServiceBlockProps) => {
  const { t } = useI18n();

  const Icon = service.icon;
  const isReversed = index % 2 === 1;

  return (
    <RevealOnScroll direction={service.direction} delay={index * 80}>
      <GlassCard className="group overflow-hidden p-0">
        <div
          className={cn(
            "grid gap-0 lg:grid-cols-2",
            isReversed && "lg:[&>div:first-child]:order-2",
          )}
        >
          <div className="relative min-h-[320px] overflow-hidden bg-muted">
            <Image
              fill
              src={service.image}
              sizes="(max-width: 1024px) 100vw, 50vw"
              alt={t(`servicesPage.services.items.${service.key}.title`)}
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-transparent to-background/20" />
            <div className="absolute left-5 top-5 rounded-2xl border border-white/15 bg-background/70 p-3 text-primary shadow-xl backdrop-blur-xl">
              <Icon className="h-6 w-6" />
            </div>
          </div>
          <div className="flex flex-col justify-center p-6 md:p-8 lg:p-10">
            <Badge variant="secondary" className="w-fit rounded-full">
              {t(`servicesPage.services.items.${service.key}.badge`)}
            </Badge>
            <h3 className="mt-4 text-2xl font-medium tracking-tight md:text-3xl">
              {t(`servicesPage.services.items.${service.key}.title`)}
            </h3>
            <p className="mt-4 leading-7 text-muted-foreground">
              {t(`servicesPage.services.items.${service.key}.description`)}
            </p>
            <div className="mt-6 grid gap-3">
              {[0, 1, 2, 3, 4].map((benefitIndex) => (
                <RevealOnScroll
                  key={benefitIndex}
                  delay={120 + benefitIndex * 70}
                  direction={isReversed ? "left" : "right"}
                >
                  <div className="flex items-start gap-3 rounded-2xl border border-glass-border bg-background/45 p-3">
                    <div className="mt-0.5 rounded-full bg-primary/10 p-1 text-primary">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <p className="text-sm leading-6">
                      {t(
                        `servicesPage.services.items.${service.key}.benefits.${benefitIndex}`,
                      )}
                    </p>
                  </div>
                </RevealOnScroll>
              ))}
            </div>

            <div className="mt-7">
              <Button asChild radius="xl" variant="brand">
                <Link href={consultationHref}>
                  {t("servicesPage.common.bookConsultation")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </GlassCard>
    </RevealOnScroll>
  );
};

export default ServiceBlock;
