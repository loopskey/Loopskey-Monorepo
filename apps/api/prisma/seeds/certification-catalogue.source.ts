import * as P from "@prisma/client";

export const CERTIFICATION_CATALOGUE_SOURCE_VERSION = "sample-2026.1";

export type TCertificationSourceCategory = {
  name: string;
  requiredCredits: number;
};

export type TCertificationSourceItem = {
  id: string;
  name: string;
  aliases: string[];
  isActive: boolean;
  abbreviation: string;
  organization: string;
  creditType: P.CreditType;
  renewalCycleLabel: string;
  association?: string | null;
  totalRequiredCredits: number;
  organizationAbbr?: string | null;
  renewalCycleMonths: number | null;
  categories: TCertificationSourceCategory[];
};

export const CERTIFICATION_CATALOGUE_SOURCE: TCertificationSourceItem[] = [
  {
    id: "cert-pmp",
    name: "Project Management Professional",
    abbreviation: "PMP",
    organization: "Project Management Institute",
    organizationAbbr: "PMI",
    association: "Project Management Institute (PMI)",
    aliases: ["Project Management Professional (PMI)", "PMI-PMP"],
    creditType: P.CreditType.PDU,
    renewalCycleLabel: "Every 3 years",
    renewalCycleMonths: 36,
    totalRequiredCredits: 60,
    isActive: true,
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
    aliases: ["Agile Certified Practitioner (PMI)", "PMI ACP"],
    creditType: P.CreditType.PDU,
    renewalCycleLabel: "Every 3 years",
    renewalCycleMonths: 36,
    totalRequiredCredits: 30,
    isActive: true,
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
    aliases: ["Chartered Financial Analyst (CFA Institute)"],
    creditType: P.CreditType.CPD,
    renewalCycleLabel: "Annual",
    renewalCycleMonths: 12,
    totalRequiredCredits: 20,
    isActive: true,
    categories: [],
  },
  {
    id: "cert-cpa",
    name: "Chartered Professional Accountant",
    abbreviation: "CPA",
    organization: "CPA Canada",
    organizationAbbr: null,
    association: "Chartered Professional Accountants of Canada",
    aliases: ["Chartered Professional Accountant (CPA Canada)", "CPA Canada"],
    creditType: P.CreditType.CPD,
    renewalCycleLabel: "Rolling 3-year cycle",
    renewalCycleMonths: 36,
    totalRequiredCredits: 20,
    isActive: true,
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
    aliases: [
      "Certified Information Systems Security Professional (ISC2)",
      "ISC2 CISSP",
    ],
    creditType: P.CreditType.CPE,
    renewalCycleLabel: "Every 3 years",
    renewalCycleMonths: 36,
    totalRequiredCredits: 120,
    isActive: true,
    categories: [
      {
        name: "Group A – Directly related to CISSP domains",
        requiredCredits: 90,
      },
      { name: "Group B – Professional development", requiredCredits: 30 },
    ],
  },
];
