import { AssociationRecord } from "@association/types/association-service.types";

export const projectAssociation = (association: AssociationRecord) => {
  const { owner, ...rest } = association;
  return {
    ...rest,
    ownerEmail: owner.email,
    ownerFullName: owner.fullName,
    ownerStatus: owner.status,
  };
};

export type AssociationProjection = ReturnType<typeof projectAssociation>;
