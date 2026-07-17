import * as P from "@prisma/client";

type CatalogueCategory = {
  name: string;
  requiredCredits: number;
};

type CatalogueCertification = {
  id: string;
  name: string;
  abbreviation: string;
  organization: string;
  creditType: P.CreditType;
  renewalCycleLabel: string;
  association?: string | null;
  totalRequiredCredits: number;
  categories: CatalogueCategory[];
  suggestedDeadline?: Date | null;
  organizationAbbr?: string | null;
  renewalCycleMonths: number | null;
};

export const CERTIFICATION_CATALOGUE: CatalogueCertification[] = [
  {
    id: "cert-pmp",
    name: "Project Management Professional",
    abbreviation: "PMP",
    organization: "Project Management Institute",
    organizationAbbr: "PMI",
    association: "Project Management Institute (PMI)",
    creditType: P.CreditType.PDU,
    renewalCycleLabel: "Every 3 years",
    renewalCycleMonths: 36,
    totalRequiredCredits: 60,
    suggestedDeadline: new Date(Date.UTC(2026, 11, 31)),
    categories: [
      { name: "Ways of Working", requiredCredits: 20 },
      { name: "Power Skills", requiredCredits: 20 },
      { name: "Business Acumen", requiredCredits: 20 },
    ],
  },
  {
    id: "cert-pmi-acp",
    name: "Agile Certified Practitioner",
    abbreviation: "PMI-ACP",
    organization: "Project Management Institute",
    organizationAbbr: "PMI",
    association: "Project Management Institute (PMI)",
    creditType: P.CreditType.PDU,
    renewalCycleLabel: "Every 3 years",
    renewalCycleMonths: 36,
    totalRequiredCredits: 30,
    suggestedDeadline: new Date(Date.UTC(2026, 11, 31)),
    categories: [
      { name: "Agile Principles & Mindset", requiredCredits: 12 },
      { name: "Team Facilitation & Coaching", requiredCredits: 10 },
      { name: "Value-Driven Delivery", requiredCredits: 8 },
    ],
  },
  {
    id: "cert-cfa",
    name: "Chartered Financial Analyst",
    abbreviation: "CFA",
    organization: "CFA Institute",
    organizationAbbr: null,
    association: "CFA Institute",
    creditType: P.CreditType.CPD,
    renewalCycleLabel: "Annual",
    renewalCycleMonths: 12,
    totalRequiredCredits: 20,
    suggestedDeadline: new Date(Date.UTC(2026, 11, 31)),
    categories: [],
  },
  {
    id: "cert-cpa",
    name: "Chartered Professional Accountant",
    abbreviation: "CPA",
    organization: "CPA Canada",
    organizationAbbr: null,
    association: "Chartered Professional Accountants of Canada",
    creditType: P.CreditType.CPD,
    renewalCycleLabel: "Rolling 3-year cycle",
    renewalCycleMonths: 36,
    totalRequiredCredits: 20,
    suggestedDeadline: new Date(Date.UTC(2026, 11, 31)),
    categories: [],
  },
  {
    id: "cert-cissp",
    name: "Certified Information Systems Security Professional",
    abbreviation: "CISSP",
    organization: "ISC2",
    organizationAbbr: "ISC2",
    association:
      "International Information System Security Certification Consortium",
    creditType: P.CreditType.CPE,
    renewalCycleLabel: "Every 3 years",
    renewalCycleMonths: 36,
    totalRequiredCredits: 120,
    suggestedDeadline: new Date(Date.UTC(2026, 11, 31)),
    categories: [
      {
        name: "Group A – Directly related to CISSP domains",
        requiredCredits: 90,
      },
      { name: "Group B – Professional development", requiredCredits: 30 },
    ],
  },
];

export const seedCertificationCatalogue = async (prisma: P.PrismaClient) => {
  for (const cert of CERTIFICATION_CATALOGUE) {
    const { id, categories, ...data } = cert;
    await prisma.certification.upsert({
      where: { id },
      create: { id, ...data },
      update: { ...data },
    });
    await prisma.certificationCategory.deleteMany({
      where: { certificationId: id },
    });
    if (categories.length)
      await prisma.certificationCategory.createMany({
        data: categories.map((category, index) => ({
          certificationId: id,
          name: category.name,
          requiredCredits: category.requiredCredits,
          order: index,
        })),
      });
  }

  console.log(
    `📜 Certification catalogue: ${CERTIFICATION_CATALOGUE.length} certifications`,
  );
  return CERTIFICATION_CATALOGUE.length;
};
