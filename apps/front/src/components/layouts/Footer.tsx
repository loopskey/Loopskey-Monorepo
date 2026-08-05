"use client";

import { siteLinks, socialLinks } from "@/utils/constant";
import { TFooterLink, TSocialLink } from "@/types/element.types";
import { Facebook, Linkedin } from "lucide-react";
import { FooterColumn } from "@layouts/parts/footer-column";
import { Youtube } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { Logo } from "@layouts/parts/logo";

import Link from "next/link";

const Footer = () => {
  const { t } = useI18n();

  const solutionLinks: TFooterLink[] = [
    {
      href: siteLinks.professionals,
      label: "For Professionals",
    },
    {
      href: siteLinks.associations,
      label: "For Associations",
    },
    {
      href: siteLinks.organizations,
      label: "For Organizations",
    },
    {
      href: siteLinks.solutionContentProviders,
      label: "For Content Providers",
    },
  ];

  const supportLinks: TFooterLink[] = [
    {
      href: siteLinks.faq,
      label: "Help Center",
    },
    {
      href: siteLinks.contact,
      label: "Contact Us",
    },
    {
      href: siteLinks.accessibility,
      label: "Accessibility",
    },
    {
      href: siteLinks.securityDataProtection,
      label: "Security & Data Protection",
    },
  ];

  const legalLinks: TFooterLink[] = [
    {
      href: siteLinks.termsOfService,
      label: "Terms of Use",
    },
    {
      href: siteLinks.privacyPolicy,
      label: "Privacy Policy",
    },
    {
      href: siteLinks.cookiePolicy,
      label: "Cookie Statement",
    },
  ];

  const bottomBarLegalLinks: TFooterLink[] = [
    {
      href: siteLinks.privacyPolicy,
      label: t("footer.privacyPolicy"),
    },
    {
      href: siteLinks.termsOfService,
      label: t("footer.termsOfService"),
    },
  ];

  const companyLinks: TFooterLink[] = [
    { href: siteLinks.about, label: "About LoopsKey" },
    { href: siteLinks.associationPartners, label: "Association Partners" },
    { href: siteLinks.companyContentProviders, label: "Content Providers" },
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
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div>
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

          <div>
            <FooterColumn title="Solutions" links={solutionLinks} />
          </div>

          <div>
            <FooterColumn title="Support" links={supportLinks} />
          </div>

          <div>
            <FooterColumn title="Legal" links={legalLinks} />
          </div>

          <div>
            <FooterColumn title="Company" links={companyLinks} />
          </div>
        </div>

        <div className="mt-12 border-t border-border/70 pt-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} LoopsKey.{" "}
              {t("footer.allRightsReserved")}
            </p>

            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {bottomBarLegalLinks.map((link) => (
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
