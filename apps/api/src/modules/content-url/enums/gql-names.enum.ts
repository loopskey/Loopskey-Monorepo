export enum ContentUrlGqlObjectNames {
  SETTINGS = "ContentUrlSettings",
  RESOLUTION = "ContentUrlResolution",
}

export enum ContentUrlGqlInputNames {
  CHANGE_SLUG = "ChangeContentSlugInput",
  ATTACH_RETIRED_SLUG = "AttachRetiredContentSlugInput",
}

export enum ContentUrlGqlQueryNames {
  CONTENT_URL = "contentUrl",
  RESOLVE_CONTENT_URL = "resolveContentUrl",
}

export enum ContentUrlGqlMutationNames {
  CHANGE_CONTENT_SLUG = "changeContentSlug",
  ATTACH_RETIRED_CONTENT_SLUG = "attachRetiredContentSlug",
}

export const CONTENT_URL_KIND_GQL_NAME = "ContentUrlKind";
