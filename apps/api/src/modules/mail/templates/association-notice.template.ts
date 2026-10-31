import { AppLanguage, AssociationMessageType } from "@prisma/client";
import { paragraph, renderEmail, singleLine } from "@mail/utils/email-layout";

import { type TAssociationLifecycleInput } from "@mail/types/mail-service.types";
import { type TAssociationMessageInput } from "@mail/types/mail-service.types";

type NoticeCopy = {
  subject: string;
  heading: string;
  lines: string[];
  action: string;
};

const isFrench = (language: AppLanguage) => language === AppLanguage.FR;

const localeOf = (language: AppLanguage) =>
  isFrench(language) ? "fr-FR" : "en-GB";

const numberOf = (value: number, language: AppLanguage) =>
  value.toLocaleString(localeOf(language));

const percentOf = (value: number, language: AppLanguage) =>
  isFrench(language)
    ? `${numberOf(value, language)} %`
    : `${numberOf(value, language)}%`;

const dateOf = (value: Date, language: AppLanguage) =>
  value.toLocaleDateString(localeOf(language), {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

const calendarDay = (value: Date) =>
  Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());

const messageCopy = (
  input: TAssociationMessageInput,
  now: Date,
): NoticeCopy => {
  const fr = isFrench(input.language);
  const member = singleLine(input.memberName);
  const association = singleLine(input.associationName);
  const app = input.appName;

  if (input.messageType === AssociationMessageType.WELCOME)
    return fr
      ? {
          subject: `Bienvenue chez ${association} sur ${app}`,
          heading: `Bienvenue, ${member} !`,
          lines: [
            `Bonjour ${member},`,
            `Vous faites désormais partie de ${association} sur ${app}. Votre tableau de bord vous permet de suivre vos exigences de formation continue, de voir ce que vous avez déjà accompli et de découvrir des formations recommandées.`,
            "Explorez votre tableau de bord quand vous serez prêt(e).",
          ],
          action: "Accéder à mon tableau de bord",
        }
      : {
          subject: `Welcome to ${association} on ${app}`,
          heading: `Welcome, ${member}!`,
          lines: [
            `Hi ${member},`,
            `You're officially part of ${association} on ${app}. Your dashboard is where you'll track your continuing education requirements, see what you've already completed, and discover recommended learning.`,
            "Explore your dashboard whenever you're ready.",
          ],
          action: "Go to your dashboard",
        };

  if (input.messageType === AssociationMessageType.CATEGORY_BEHIND) {
    const category = singleLine(input.categoryName);
    const percent = percentOf(input.percent, input.language);

    return fr
      ? {
          subject: `${category} demande votre attention`,
          heading: `C'est en ${category} que vous avez le plus de retard`,
          lines: [
            `Bonjour ${member},`,
            `Parmi les exigences fixées par ${association}, ${category} est le domaine où vous avez le plus de progrès à faire — ${percent} complété.`,
            "Votre tableau de bord liste les formations qui y comptent.",
          ],
          action: "Voir les formations recommandées",
        }
      : {
          subject: `${category} needs your attention`,
          heading: `You're furthest behind in ${category}`,
          lines: [
            `Hi ${member},`,
            `Of all the requirements ${association} has set for you, ${category} is where you have the most ground to cover — ${percent} complete.`,
            "Your dashboard lists the learning that counts toward it.",
          ],
          action: "See recommended learning",
        };
  }

  if (input.messageType === AssociationMessageType.CERTIFICATE_EXPIRING) {
    if (!input.expiresOn)
      throw new Error(
        "A certificate message needs the certificate expiry date.",
      );

    const certificate = singleLine(input.certificateTitle);
    const hasExpired = calendarDay(input.expiresOn) < calendarDay(now);
    const date = dateOf(input.expiresOn, input.language);

    return fr
      ? {
          subject: hasExpired
            ? `Votre certificat ${certificate} a expiré`
            : `Votre certificat ${certificate} arrive à échéance`,
          heading: "Il est temps de renouveler votre certificat",
          lines: [
            `Bonjour ${member},`,
            hasExpired
              ? `Votre certificat ${certificate} a expiré.`
              : `Votre certificat ${certificate} expire le ${date}.`,
            `${association} le comptabilise dans vos exigences tant qu'il est valide — renouvelez-le pour garder votre dossier à jour.`,
          ],
          action: "Accéder à mon tableau de bord",
        }
      : {
          subject: hasExpired
            ? `Your ${certificate} certificate has expired`
            : `Your ${certificate} certificate is expiring`,
          heading: "Time to renew your certificate",
          lines: [
            `Hi ${member},`,
            hasExpired
              ? `Your ${certificate} certificate has expired.`
              : `Your ${certificate} certificate expires on ${date}.`,
            `${association} counts it toward your requirements while it's valid — renew it to keep your record up to date.`,
          ],
          action: "Go to your dashboard",
        };
  }

  const done = numberOf(input.completedCredits, input.language);
  const required = numberOf(input.requiredCredits, input.language);
  const percent = percentOf(input.percent, input.language);
  const deadline = input.deadline
    ? dateOf(input.deadline, input.language)
    : null;

  return fr
    ? {
        subject: `Votre progression chez ${association}`,
        heading: "Votre progression est en retard",
        lines: [
          `Bonjour ${member},`,
          `Vous avez obtenu ${done} crédits sur les ${required} exigés par ${association}, soit ${percent}.`,
          deadline
            ? `Votre échéance la plus proche est le ${deadline}.`
            : "Aucune échéance immédiate, mais plus tôt vous commencez, plus ce sera simple.",
        ],
        action: "Voir ce qu'il manque",
      }
    : {
        subject: `Your progress with ${association}`,
        heading: "You're behind on your requirements",
        lines: [
          `Hi ${member},`,
          `You've completed ${done} of the ${required} credits ${association} requires — that's ${percent}.`,
          deadline
            ? `Your earliest deadline is ${deadline}.`
            : "There's no immediate deadline, but the sooner you start, the easier it'll be.",
        ],
        action: "See what's missing",
      };
};

const lifecycleCopy = (input: TAssociationLifecycleInput): NoticeCopy => {
  const fr = isFrench(input.language);
  const member = singleLine(input.memberName);
  const association = singleLine(input.associationName);

  if (input.messageType === AssociationMessageType.GROUP_ADDED) {
    const group = singleLine(input.groupTitle);

    return fr
      ? {
          subject: `Vous avez rejoint ${group} chez ${association}`,
          heading: `Vous faites maintenant partie de ${group}`,
          lines: [
            `Bonjour ${member},`,
            `${association} vous a ajouté au groupe ${group}.`,
            "Les exigences et formations recommandées définies pour ce groupe apparaissent désormais sur votre tableau de bord.",
          ],
          action: "Voir mes exigences",
        }
      : {
          subject: `You've joined ${group} at ${association}`,
          heading: `You're now part of ${group}`,
          lines: [
            `Hi ${member},`,
            `${association} added you to the ${group} group.`,
            "Any requirements or recommended learning set for this group now appear on your dashboard.",
          ],
          action: "View your requirements",
        };
  }

  if (input.messageType === AssociationMessageType.REQUIREMENT_ASSIGNED) {
    const requirement = singleLine(input.requirementName);
    const deadline = input.deadline
      ? dateOf(input.deadline, input.language)
      : null;

    return fr
      ? {
          subject: `Nouvelle exigence : ${requirement}`,
          heading: "Une nouvelle exigence vous a été attribuée",
          lines: [
            `Bonjour ${member},`,
            `${association} vous a attribué une nouvelle exigence : « ${requirement} ».`,
            deadline
              ? `À compléter avant le ${deadline}.`
              : "Aucune échéance fixe.",
            "Ouvrez-la pour voir ce qui y compte et quelles preuves sont attendues.",
          ],
          action: "Ouvrir l'exigence",
        }
      : {
          subject: `New requirement: ${requirement}`,
          heading: "A new requirement has been assigned to you",
          lines: [
            `Hi ${member},`,
            `${association} has assigned you a new requirement: "${requirement}".`,
            deadline ? `Due ${deadline}.` : "No fixed deadline.",
            "Open it to see what counts toward it and what evidence is expected.",
          ],
          action: "Open the requirement",
        };
  }

  const title = singleLine(input.contentTitle);
  const requirement = input.requirementName
    ? singleLine(input.requirementName)
    : null;

  return fr
    ? {
        subject: `Nouvelle formation recommandée : ${title}`,
        heading: "Une nouvelle formation vous est recommandée",
        lines: [
          `Bonjour ${member},`,
          `${association} vous recommande « ${title} ».`,
          requirement
            ? `Elle compte pour l'exigence « ${requirement} ».`
            : "Vous la retrouverez avec vos autres recommandations.",
        ],
        action: "Voir la formation",
      }
    : {
        subject: `New recommended learning: ${title}`,
        heading: "New learning recommended for you",
        lines: [
          `Hi ${member},`,
          `${association} recommends "${title}" for you.`,
          requirement
            ? `This counts toward "${requirement}".`
            : "You'll find it alongside your other recommendations.",
        ],
        action: "View the learning",
      };
};

const render = (
  copy: NoticeCopy,
  input: { appName: string; language: AppLanguage },
  actionUrl: string,
) =>
  renderEmail({
    brand: input.appName,
    subject: copy.subject,
    heading: copy.heading,
    language: isFrench(input.language) ? "fr" : "en",
    blocks: [
      ...copy.lines.map((line) => paragraph(line)),
      { kind: "cta", label: copy.action, url: actionUrl },
    ],
  });

export const buildAssociationMessageEmailV2 = (
  input: TAssociationMessageInput,
  now: Date = new Date(),
) =>
  render(
    messageCopy(input, now),
    input,
    input.messageType === AssociationMessageType.WELCOME ||
      input.messageType === AssociationMessageType.CERTIFICATE_EXPIRING
      ? input.dashboardUrl
      : (input.requirementsUrl ?? input.dashboardUrl),
  );

export const buildAssociationLifecycleEmailV2 = (
  input: TAssociationLifecycleInput,
) => render(lifecycleCopy(input), input, input.actionUrl);
