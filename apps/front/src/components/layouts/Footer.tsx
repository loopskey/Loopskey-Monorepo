"use client";

import { companyEmail, siteLinks, socialLinks } from "@/utils/constant";
import { TFooterLink, TSocialLink } from "@/types/element.types";
import { Mail, MapPin, Youtube } from "lucide-react";
import { Facebook, Linkedin } from "lucide-react";
import { FooterColumn } from "@layouts/parts/footer-column";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { Logo } from "@layouts/parts/logo";

import Link from "next/link";

const Footer = () => {
  const { t } = useI18n();

  const exploreLinks: TFooterLink[] = [
    {
      href: siteLinks.content,
      label: t("navigation.courses"),
    },
    {
      href: siteLinks.services,
      label: t("navigation.services"),
    },
    {
      href: siteLinks.contact,
      label: t("navigation.contact"),
    },
    {
      href: siteLinks.about,
      label: t("navigation.about"),
    },
  ];

  const resourceLinks: TFooterLink[] = [
    {
      href: siteLinks.faq,
      label: t("footer."),
    },
    {
      href: siteLinks.beProvider,
      label: t("footer.beProvider"),
    },
    {
      href: siteLinks.beProfessional,
      label: t("footer.beProfessional"),
    },
    {
      href: siteLinks.beOrganization,
      label: t("footer.beOrganization"),
    },
  ];

  const legalLinks: TFooterLink[] = [
    {
      href: siteLinks.privacyPolicy,
      label: t("footer.privacyPolicy"),
    },
    {
      href: siteLinks.termsOfService,
      label: t("footer.termsOfService"),
    },
  ];

  const socials: TSocialLink[] = [
    {
      href: socialLinks.linkedin,
      label: t("social.linkedin"),
      icon: <Linkedin className="h-4 w-4" />,
    },
    {
      href: socialLinks.x,
      label: t("social.x"),
      icon: <span className="text-sm font-black">𝕏</span>,
    },
    {
      href: socialLinks.facebook,
      label: t("social.facebook"),
      icon: <Facebook className="h-4 w-4" />,
    },
    {
      href: socialLinks.youtube,
      label: t("social.youtube"),
      icon: <Youtube className="h-4 w-4" />,
    },
  ];

  return (
    <footer className="relative mt-24 overflow-hidden border-t border-glass-border bg-background/60 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(59,130,246,0.12),transparent_30%),radial-gradient(circle_at_85%_10%,rgba(20,184,166,0.1),transparent_28%),radial-gradient(circle_at_50%_105%,rgba(245,158,11,0.08),transparent_34%)]" />

      <div className="relative mx-auto max-w-7xl py-14 lg:py-18 px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo />
            <p className="mt-5 max-w-sm text-sm leading-7 text-muted-foreground">
              {t("footer.brandDescription")}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              {socials.map((social) => (
                <Button
                  asChild
                  size="icon"
                  radius="full"
                  variant="glass"
                  key={social.href}
                  className="h-10 w-10"
                >
                  <Link
                    target="_blank"
                    rel="noreferrer"
                    href={social.href}
                    aria-label={social.label}
                  >
                    {social.icon}
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <FooterColumn title={t("footer.explore")} links={exploreLinks} />
          </div>

          <div className="lg:col-span-3">
            <FooterColumn title={t("footer.resources")} links={resourceLinks} />
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-foreground">
              {t("footer.contactUs")}
            </h3>

            <div className="mt-5 space-y-4">
              <Link
                href={`mailto:${companyEmail}`}
                className="group flex items-start gap-3 rounded-2xl border border-border/70 bg-background/50 p-4 text-sm transition-all hover:border-primary/30 hover:bg-primary/5"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Mail className="h-4 w-4" />
                </span>

                <span className="min-w-0">
                  <span className="block font-semibold text-foreground">
                    {t("footer.emailLabel")}
                  </span>
                  <span className="mt-1 block break-all text-muted-foreground group-hover:text-primary">
                    {companyEmail}
                  </span>
                </span>
              </Link>

              <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background/50 p-4 text-sm">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/20 text-primary">
                  <MapPin className="h-4 w-4" />
                </span>

                <span>
                  <span className="block font-semibold text-foreground">
                    LoopsKey
                  </span>
                  <span className="mt-1 block text-muted-foreground">
                    {t("footer.builtFor")}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border/70 pt-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} LoopsKey.{" "}
              {t("footer.allRightsReserved")}
            </p>

            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
