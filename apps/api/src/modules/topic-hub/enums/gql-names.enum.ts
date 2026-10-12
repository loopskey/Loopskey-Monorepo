export enum TopicHubGqlObjectNames {
  HUB = "TopicHub",
  ITEM = "TopicHubItem",
  SECTION = "TopicHubSection",
  SUMMARY = "TopicHubSummary",
  ADMIN_HUB = "AdminTopicHub",
  ADMIN_SUMMARY = "AdminTopicHubSummary",
  ADMIN_REFERENCE = "AdminTopicHubReference",
  ADMIN_TRANSLATION = "AdminTopicHubTranslation",
}

export enum TopicHubGqlInputNames {
  SAVE = "SaveTopicHubInput",
  SECTION = "TopicHubSectionInput",
  REFERENCE = "TopicHubReferenceInput",
  SET_STATUS = "SetTopicHubStatusInput",
  SET_INDEX_EXCLUSION = "SetTopicHubIndexExclusionInput",
  SET_TRANSLATION_PUBLICATION = "SetTopicHubTranslationPublicationInput",
}

export enum TopicHubGqlQueryNames {
  TOPIC_HUBS = "topicHubs",
  ADMIN_TOPIC_HUB = "adminTopicHub",
  ADMIN_TOPIC_HUBS = "adminTopicHubs",
  TOPIC_HUB_BY_SLUG = "topicHubBySlug",
  TOPIC_HUBS_FOR_CONTENT = "topicHubsForContent",
}

export enum TopicHubGqlMutationNames {
  SAVE_TOPIC_HUB = "saveTopicHub",
  SET_TOPIC_HUB_STATUS = "setTopicHubStatus",
  SET_TOPIC_HUB_TRANSLATION_PUBLICATION = "setTopicHubTranslationPublication",
  SET_TOPIC_HUB_INDEX_EXCLUSION = "setTopicHubIndexExclusion",
}

export const TOPIC_HUB_STATUS_GQL_NAME = "TopicHubStatus";
