import { BadRequestException } from "@nestjs/common";
import { ProfessionalMessageCode } from "@professional/enums/message-code.enum";

export type PduRequirementLink = {
  cpdPlanId?: string | null;
  associationRequirementId?: string | null;
};

export const exclusiveRequirementLink = (
  link: PduRequirementLink,
): PduRequirementLink => {
  if (link.cpdPlanId && link.associationRequirementId)
    throw new BadRequestException(
      ProfessionalMessageCode.PDU_ACTIVITY_REQUIREMENT_CONFLICT,
    );
  if (link.cpdPlanId)
    return { cpdPlanId: link.cpdPlanId, associationRequirementId: null };
  if (link.associationRequirementId)
    return {
      cpdPlanId: null,
      associationRequirementId: link.associationRequirementId,
    };
  return {
    cpdPlanId: link.cpdPlanId,
    associationRequirementId: link.associationRequirementId,
  };
};
