import { AppLanguage, AssociationMessageType } from "@prisma/client";

import { escapeHtml } from "@mail/association-email.template";
import { type TAssociationMessageInput } from "@mail/mail-service.type";

export const ASSOCIATION_MESSAGE_TEMPLATE_VERSION = 1;

type Copy = {
  subject: string;
  heading: string;
  lines: string[];
  action: string;
  closing: string;
  help: string;
};

const number = (value: number, language: AppLanguage) =>
  value.toLocaleString(language === AppLanguage.FR ? "fr-FR" : "en-GB");

const date = (value: Date | null, language: AppLanguage) =>
  value
    ? value.toLocaleDateString(
        language === AppLanguage.FR ? "fr-FR" : "en-GB",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        },
      )
    : null;

const englishCopy = (input: TAssociationMessageInput): Copy => {
  const help = `Need help? Contact ${input.supportEmail}.`;
  const closing = `This message was sent by ${input.associationName} through ${input.appName}.`;
  const action = "Open your dashboard";

  if (input.messageType === AssociationMessageType.WELCOME)
    return {
      help,
      action,
      closing,
      subject: `${input.associationName}: welcome`,
      heading: `Welcome to ${input.associationName}`,
      lines: [
        `Hello ${input.memberName}, and welcome.`,
        `${input.associationName} tracks its members' continuing development through ${input.appName}. Your dashboard shows what is required of you, what you have already earned, and how much time you have.`,
        "Nothing is expected of you today. Sign in when you are ready and have a look at what applies to you.",
      ],
    };

  if (input.messageType === AssociationMessageType.CATEGORY_BEHIND)
    return {
      help,
      action,
      closing,
      subject: `${input.associationName}: ${input.categoryName} needs attention`,
      heading: `You are furthest behind in ${input.categoryName}`,
      lines: [
        `Hello ${input.memberName}.`,
        `Across the requirements ${input.associationName} has set you, ${input.categoryName} is the area where you have earned the least: ${number(input.percent, input.language)}% of what that category asks for.`,
        "Your dashboard lists the learning that counts toward it.",
      ],
    };

  if (input.messageType === AssociationMessageType.CERTIFICATE_EXPIRING) {
    const expires = date(input.expiresOn, input.language);

    return {
      help,
      action,
      closing,
      subject: `${input.associationName}: your ${input.certificateTitle} certificate`,
      heading: "A certificate is expiring",
      lines: [
        `Hello ${input.memberName}.`,
        expires
          ? `Your ${input.certificateTitle} certificate expires on ${expires}.`
          : `Your ${input.certificateTitle} certificate has expired.`,
        `${input.associationName} counts it toward your requirements while it is valid, so renewing it keeps your record intact.`,
      ],
    };
  }

  const deadline = date(input.deadline, input.language);

  return {
    help,
    action,
    closing,
    subject: `${input.associationName}: your progress is behind`,
    heading: "Your progress is behind",
    lines: [
      `Hello ${input.memberName}.`,
      `You have earned ${number(input.completedCredits, input.language)} of the ${number(input.requiredCredits, input.language)} credits ${input.associationName} requires, which is ${number(input.percent, input.language)}%.`,
      deadline
        ? `Your earliest deadline is ${deadline}.`
        : "There is still time, and your dashboard shows exactly what is missing.",
    ],
  };
};

const frenchCopy = (input: TAssociationMessageInput): Copy => {
  const help = `Besoin d'aide ? Contactez ${input.supportEmail}.`;
  const closing = `Ce message vous a été envoyé par ${input.associationName} via ${input.appName}.`;
  const action = "Ouvrir mon tableau de bord";

  if (input.messageType === AssociationMessageType.WELCOME)
    return {
      help,
      action,
      closing,
      subject: `${input.associationName} : bienvenue`,
      heading: `Bienvenue à ${input.associationName}`,
      lines: [
        `Bonjour ${input.memberName}, et bienvenue.`,
        `${input.associationName} suit le développement professionnel de ses membres via ${input.appName}. Votre tableau de bord indique ce qui vous est demandé, ce que vous avez déjà obtenu et le temps dont vous disposez.`,
        "Rien ne vous est demandé aujourd'hui. Connectez-vous quand vous le souhaitez pour voir ce qui vous concerne.",
      ],
    };

  if (input.messageType === AssociationMessageType.CATEGORY_BEHIND)
    return {
      help,
      action,
      closing,
      subject: `${input.associationName} : ${input.categoryName} demande votre attention`,
      heading: `C'est en ${input.categoryName} que vous êtes le plus en retard`,
      lines: [
        `Bonjour ${input.memberName}.`,
        `Parmi les exigences que ${input.associationName} vous a fixées, ${input.categoryName} est le domaine où vous avez obtenu le moins : ${number(input.percent, input.language)} % de ce que cette catégorie demande.`,
        "Votre tableau de bord liste les formations qui y comptent.",
      ],
    };

  if (input.messageType === AssociationMessageType.CERTIFICATE_EXPIRING) {
    const expires = date(input.expiresOn, input.language);

    return {
      help,
      action,
      closing,
      subject: `${input.associationName} : votre certificat ${input.certificateTitle}`,
      heading: "Un certificat arrive à échéance",
      lines: [
        `Bonjour ${input.memberName}.`,
        expires
          ? `Votre certificat ${input.certificateTitle} expire le ${expires}.`
          : `Votre certificat ${input.certificateTitle} a expiré.`,
        `${input.associationName} le comptabilise dans vos exigences tant qu'il est valide : le renouveler préserve votre dossier.`,
      ],
    };
  }

  const deadline = date(input.deadline, input.language);

  return {
    help,
    action,
    closing,
    subject: `${input.associationName} : votre progression est en retard`,
    heading: "Votre progression est en retard",
    lines: [
      `Bonjour ${input.memberName}.`,
      `Vous avez obtenu ${number(input.completedCredits, input.language)} des ${number(input.requiredCredits, input.language)} crédits exigés par ${input.associationName}, soit ${number(input.percent, input.language)} %.`,
      deadline
        ? `Votre échéance la plus proche est le ${deadline}.`
        : "Il vous reste du temps, et votre tableau de bord indique précisément ce qui manque.",
    ],
  };
};

const copyFor = (input: TAssociationMessageInput) =>
  input.language === AppLanguage.FR ? frenchCopy(input) : englishCopy(input);

export const buildAssociationMessageEmail = (
  input: TAssociationMessageInput,
) => {
  const copy = copyFor(input);
  const appName = escapeHtml(input.appName);
  const paragraphs = copy.lines
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");

  return {
    subject: copy.subject,
    text: [
      ...copy.lines,
      `${copy.action}: ${input.dashboardUrl}`,
      copy.closing,
      copy.help,
    ].join(" "),
    html: `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#111827;background:#f6f8fb;padding:32px"><main style="max-width:600px;margin:auto;background:white;padding:32px;border-radius:16px"><strong style="color:#2563eb">${escapeHtml(input.associationName)}</strong><h1>${escapeHtml(copy.heading)}</h1>${paragraphs}<p><a href="${escapeHtml(input.dashboardUrl)}" style="display:inline-block;padding:12px 20px;background:#2563eb;color:white;text-decoration:none;border-radius:10px">${escapeHtml(copy.action)}</a></p><p style="color:#6b7280">${escapeHtml(copy.closing)}</p><p style="color:#6b7280">${escapeHtml(copy.help)}</p><p style="color:#9ca3af;font-size:12px">${appName}</p></main></body></html>`,
  };
};
