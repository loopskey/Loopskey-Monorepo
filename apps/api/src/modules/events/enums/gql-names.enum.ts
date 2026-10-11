export enum EventGqlObjectNames {
  EVENT_TRANSLATION = "EventTranslation",
  EVENT = "Event",
  EVENT_PAGE_INFO = "EventPageInfo",
  PAGINATED_EVENTS = "PaginatedEvents",
  EVENT_REGISTRATION = "EventRegistration",
  EVENT_SCHEDULE_ITEM = "EventScheduleItem",
  EVENT_FILTER_FACETS = "EventFilterFacets",
  EVENT_CATEGORY_FACET = "EventCategoryFacet",
  EVENT_TYPE_FACET = "EventTypeFacet",
}

export enum EventGqlInputNames {
  SAVE_EVENT_TRANSLATION = "SaveEventTranslationInput",
  SET_EVENT_TRANSLATION_PUBLICATION = "SetEventTranslationPublicationInput",
  EVENT_SORT = "EventSortInput",
  CREATE_EVENT = "CreateEventInput",
  UPDATE_EVENT = "UpdateEventInput",
  EVENT_FILTER = "EventFilterInput",
  REGISTER_EVENT = "RegisterEventInput",
  EVENT_PAGINATION = "EventPaginationInput",
}

export enum EventGqlQueryNames {
  EVENT_TRANSLATIONS = "eventTranslations",
  EVENTS = "events",
  EVENT_BY_ID = "eventById",
  EVENT_BY_SLUG = "eventBySlug",
  FEATURED_EVENTS = "featuredEvents",
  UPCOMING_EVENTS = "upcomingEvents",
  MY_PROVIDER_EVENTS = "myProviderEvents",
  MY_REGISTERED_EVENTS = "myRegisteredEvents",
  EVENT_FILTER_FACETS = "eventFilterFacets",
}

export enum EventGqlMutationNames {
  SAVE_EVENT_TRANSLATION = "saveEventTranslation",
  SET_EVENT_TRANSLATION_PUBLICATION = "setEventTranslationPublication",
  CREATE_EVENT = "createEvent",
  UPDATE_EVENT = "updateEvent",
  CANCEL_EVENT = "cancelEvent",
  DELETE_EVENT = "deleteEvent",
  RESTORE_EVENT = "restoreEvent",
  PUBLISH_EVENT = "publishEvent",
  ARCHIVE_EVENT = "archiveEvent",
  REGISTER_EVENT = "registerEvent",
  RECORD_EVENT_VIEW = "recordEventView",
  CANCEL_EVENT_REGISTRATION = "cancelEventRegistration",
}
