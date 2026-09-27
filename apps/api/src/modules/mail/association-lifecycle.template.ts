import { AppLanguage, AssociationMessageType } from "@prisma/client";

import { renderAssociationEmail } from "@mail/association-message.template";
import { formatMessageDate } from "@mail/association-message.template";
import { type AssociationEmailCopy } from "@mail/association-message.template";
import { type TAssociationLifecycleInput } from "@mail/mail-service.type";

const englishCopy = (
  input: TAssociationLifecycleInput,
): AssociationEmailCopy => {
  const help = `Need help? Contact ${input.supportEmail}.`;
  const closing = `This message was sent by ${input.associationName} through ${input.appName}.`;

  if (input.messageType === AssociationMessageType.GROUP_ADDED)
    return {
      help,
      closing,
      action: "View your requirements",
      subject: `${input.associationName}: you joined ${input.groupTitle}`,
      heading: `You were added to ${input.groupTitle}`,
      lines: [
        `Hello ${input.memberName}.`,
        `${input.associationName} added you to the ${input.groupTitle} group.`,
        "Anything the association sets for this group now appears with your requirements and recommended learning.",
      ],
    };

  if (input.messageType === AssociationMessageType.REQUIREMENT_ASSIGNED) {
    const deadline = formatMessageDate(input.deadline, input.language);

    return {
      help,
      closing,
      action: "Open the requirement",
      subject: `${input.associationName}: new requirement "${input.requirementName}"`,
      heading: "A requirement was assigned to you",
      lines: [
        `Hello ${input.memberName}.`,
        `${input.associationName} assigned you the requirement "${input.requirementName}".`,
        deadline ? `It is due on ${deadline}.` : "It has no fixed deadline.",
        "Open it to see what counts toward it and which evidence is expected.",
      ],
    };
  }

  return {
    help,
    closing,
    action: "View the learning",
    subject: `${input.associationName}: new learning "${input.contentTitle}"`,
    heading: "Learning was assigned to you",
    lines: [
      `Hello ${input.memberName}.`,
      `${input.associationName} recommends "${input.contentTitle}" for you.`,
      input.requirementName
        ? `It counts toward the requirement "${input.requirementName}".`
        : "You will find it with the rest of your association's recommendations.",
    ],
  };
};

const frenchCopy = (
  input: TAssociationLifecycleInput,
): AssociationEmailCopy => {
  const help = `Besoin d'aide ? Contactez ${input.supportEmail}.`;
  const closing = `Ce message vous a été envoyé par ${input.associationName} via ${input.appName}.`;

  if (input.messageType === AssociationMessageType.GROUP_ADDED)
    return {
      help,
      closing,
      action: "Voir mes exigences",
      subject: `${input.associationName} : vous avez rejoint ${input.groupTitle}`,
      heading: `Vous avez été ajouté à ${input.groupTitle}`,
      lines: [
        `Bonjour ${input.memberName}.`,
        `${input.associationName} vous a ajouté au groupe ${input.groupTitle}.`,
        "Tout ce que l'association fixe pour ce groupe apparaît désormais avec vos exigences et vos formations recommandées.",
      ],
    };

  if (input.messageType === AssociationMessageType.REQUIREMENT_ASSIGNED) {
    const deadline = formatMessageDate(input.deadline, input.language);

    return {
      help,
      closing,
      action: "Ouvrir l'exigence",
      subject: `${input.associationName} : nouvelle exigence « ${input.requirementName} »`,
      heading: "Une exigence vous a été attribuée",
      lines: [
        `Bonjour ${input.memberName}.`,
        `${input.associationName} vous a attribué l'exigence « ${input.requirementName} ».`,
        deadline
          ? `Elle est à compléter avant le ${deadline}.`
          : "Elle n'a pas d'échéance fixe.",
        "Ouvrez-la pour voir ce qui y compte et quelles preuves sont attendues.",
      ],
    };
  }

  return {
    help,
    closing,
    action: "Voir la formation",
    subject: `${input.associationName} : nouvelle formation « ${input.contentTitle} »`,
    heading: "Une formation vous a été attribuée",
    lines: [
      `Bonjour ${input.memberName}.`,
      `${input.associationName} vous recommande « ${input.contentTitle} ».`,
      input.requirementName
        ? `Elle compte pour l'exigence « ${input.requirementName} ».`
        : "Vous la retrouverez avec les autres recommandations de votre association.",
    ],
  };
};

export const buildAssociationLifecycleEmail = (
  input: TAssociationLifecycleInput,
) =>
  renderAssociationEmail({
    copy:
      input.language === AppLanguage.FR
        ? frenchCopy(input)
        : englishCopy(input),
    appName: input.appName,
    actionUrl: input.actionUrl,
    associationName: input.associationName,
  });
