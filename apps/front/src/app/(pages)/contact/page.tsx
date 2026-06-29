"use client";

import { FloatingTextareaField } from "@elements/floating-textarea";
import { FloatingInputField } from "@elements/floating-input";
import { RevealOnScroll } from "@elements/reveal-scroll";
import { useContactPage } from "@hooks/useContact";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";

import dynamic from "next/dynamic";

import * as L from "lucide-react";
import * as F from "@ui/form";

const ContactMap = dynamic(
  () => import("@modules/Pages/ContactMap").then((module) => module.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[320px] items-center justify-center rounded-[2rem] border border-glass-border bg-background/55 text-sm text-muted-foreground">
        Loading map...
      </div>
    ),
  },
);

const contactIconMap = {
  email: L.Mail,
  phone: L.Phone,
  office: L.MapPin,
};

const ContactPage = () => {
  const {
    t,
    form,
    contactItems,
    scrollToForm,
    isSubmitting,
    submitContactForm,
  } = useContactPage();

  return (
    <main className="overflow-hidden">
      <section className="relative px-4 py-10">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.18),transparent_34%),radial-gradient(circle_at_bottom_right,hsl(var(--accent)/0.14),transparent_32%)]" />

        <div className="mx-auto max-w-7xl">
          <RevealOnScroll direction="up">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex w-fit items-center rounded-full border border-glass-border bg-background/55 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-primary shadow-sm backdrop-blur-xl ring-1 ring-white/40 dark:ring-white/5">
                {t("contactPage.hero.eyebrow")}
              </span>

              <h1 className="mt-6 text-4xl font-medium tracking-tight text-foreground md:text-6xl">
                {t("contactPage.hero.title")}{" "}
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  {t("contactPage.hero.highlight")}
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                {t("contactPage.hero.description")}
              </p>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="mx-auto grid max-w-7xl gap-8 xl:grid-cols-[1.05fr_0.95fr] px-4 sm:px-6 lg:px-8">
          <RevealOnScroll direction="left">
            <GlassCard id="contact-form" className="p-6 md:p-8">
              <div className="mb-7">
                <span className="inline-flex w-fit items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-primary">
                  {t("contactPage.form.eyebrow")}
                </span>
                <h2 className="mt-4 text-2xl font-medium text-foreground md:text-3xl">
                  {t("contactPage.form.title")}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {t("contactPage.form.description")}
                </p>
              </div>
              <F.Form {...form}>
                <form onSubmit={submitContactForm} className="space-y-5">
                  <div className="grid gap-5 md:grid-cols-2">
                    <FloatingInputField
                      name="fullName"
                      autoComplete="name"
                      control={form.control}
                      label={t("contactPage.form.fullName")}
                      leftIcon={<L.UserRound className="h-4 w-4" />}
                    />

                    <FloatingInputField
                      type="email"
                      name="workEmail"
                      autoComplete="email"
                      control={form.control}
                      label={t("contactPage.form.workEmail")}
                      leftIcon={<L.Mail className="h-4 w-4" />}
                    />
                  </div>

                  <FloatingInputField
                    name="company"
                    control={form.control}
                    autoComplete="organization"
                    label={t("contactPage.form.company")}
                    leftIcon={<L.Building2 className="h-4 w-4" />}
                  />

                  <FloatingTextareaField
                    name="message"
                    control={form.control}
                    textareaClassName="min-h-40"
                    label={t("contactPage.form.message")}
                    leftIcon={<L.MessageSquare className="h-4 w-4" />}
                  />

                  <Button
                    size="lg"
                    radius="xl"
                    type="submit"
                    variant="brand"
                    disabled={isSubmitting}
                    className="w-full md:w-auto"
                  >
                    <L.Send className="h-4 w-4" />
                    {t("contactPage.form.submit")}
                  </Button>
                </form>
              </F.Form>
            </GlassCard>
          </RevealOnScroll>

          <RevealOnScroll direction="right" delay={120}>
            <div className="space-y-6">
              <GlassCard className="p-6 md:p-8">
                <div className="mb-6">
                  <span className="inline-flex w-fit items-center rounded-full border border-glass-border bg-background/55 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-primary shadow-sm backdrop-blur-xl">
                    {t("contactPage.info.eyebrow")}
                  </span>
                  <h2 className="mt-4 text-2xl font-medium text-foreground">
                    {t("contactPage.info.title")}
                  </h2>
                </div>
                <div className="grid gap-4">
                  {contactItems.map((item, index) => {
                    const Icon =
                      contactIconMap[item.type as keyof typeof contactIconMap];
                    return (
                      <RevealOnScroll
                        key={item.type}
                        direction="right"
                        delay={index * 90}
                      >
                        <div className="group rounded-3xl border border-glass-border bg-background/45 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:bg-primary/5">
                          <div className="flex items-start gap-4">
                            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {item.title}
                              </p>
                              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                {item.value}
                              </p>
                            </div>
                          </div>
                        </div>
                      </RevealOnScroll>
                    );
                  })}
                </div>
              </GlassCard>

              <GlassCard className="p-6 md:p-8">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                    <L.MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {t("contactPage.map.title")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("contactPage.map.description")}
                    </p>
                  </div>
                </div>
                <ContactMap />
              </GlassCard>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <section className="px-4 pb-28">
        <div className="mx-auto max-w-7xl">
          <RevealOnScroll direction="up">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-primary/20 bg-slate-600 p-8 text-white shadow-2xl md:p-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.35),transparent_34%),radial-gradient(circle_at_bottom_right,hsl(var(--accent)/0.25),transparent_30%)]" />
              <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white/80 backdrop-blur-xl">
                    <L.Sparkles className="h-4 w-4" />
                    {t("contactPage.cta.eyebrow")}
                  </div>
                  <h2 className="text-3xl font-medium md:text-4xl">
                    {t("contactPage.cta.title")}
                  </h2>
                  <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-300">
                    {t("contactPage.cta.description")}
                  </p>
                </div>

                <Button
                  size="lg"
                  radius="xl"
                  type="button"
                  variant="brand"
                  onClick={scrollToForm}
                  className="w-full lg:w-auto"
                >
                  {t("contactPage.cta.button")}
                </Button>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>
    </main>
  );
};

export default ContactPage;
