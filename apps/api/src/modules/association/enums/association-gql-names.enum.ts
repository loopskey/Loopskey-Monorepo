export enum AssociationGqlObjectNames {
  ASSOCIATION = "Association",
  ASSOCIATION_SETTINGS = "AssociationSettings",
  ASSOCIATION_ACTION_RESPONSE = "AssociationActionResponse",
}

export enum AssociationGqlInputNames {
  CREATE_ASSOCIATION_ACCOUNT = "CreateAssociationAccountInput",
  UPDATE_ASSOCIATION_PROFILE = "UpdateAssociationProfileInput",
  RESEND_ASSOCIATION_ACTIVATION = "ResendAssociationActivationInput",
}

export enum AssociationGqlQueryNames {
  PROFILE = "associationProfile",
}

export enum AssociationGqlMutationNames {
  CREATE_ACCOUNT = "createAssociationAccount",
  RESEND_ACTIVATION = "resendAssociationActivation",
  UPDATE_PROFILE = "updateAssociationProfile",
}
