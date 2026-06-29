export enum EventGqlObjectNames {
  EVENT = "Event",
  EVENT_PAGE_INFO = "EventPageInfo",
  PAGINATED_EVENTS = "PaginatedEvents",
  EVENT_REGISTRATION = "EventRegistration",
  EVENT_SCHEDULE_ITEM = "EventScheduleItem",
}

export enum EventGqlInputNames {
  EVENT_SORT = "EventSortInput",
  CREATE_EVENT = "CreateEventInput",
  UPDATE_EVENT = "UpdateEventInput",
  EVENT_FILTER = "EventFilterInput",
  REGISTER_EVENT = "RegisterEventInput",
  EVENT_PAGINATION = "EventPaginationInput",
}

export enum EventGqlQueryNames {
  EVENTS = "events",
  EVENT_BY_ID = "eventById",
  EVENT_BY_SLUG = "eventBySlug",
  FEATURED_EVENTS = "featuredEvents",
  UPCOMING_EVENTS = "upcomingEvents",
  MY_PROVIDER_EVENTS = "myProviderEvents",
  MY_REGISTERED_EVENTS = "myRegisteredEvents",
}

export enum EventGqlMutationNames {
  CREATE_EVENT = "createEvent",
  UPDATE_EVENT = "updateEvent",
  CANCEL_EVENT = "cancelEvent",
  DELETE_EVENT = "deleteEvent",
  RESTORE_EVENT = "restoreEvent",
  PUBLISH_EVENT = "publishEvent",
  ARCHIVE_EVENT = "archiveEvent",
  REGISTER_EVENT = "registerEvent",
  CANCEL_EVENT_REGISTRATION = "cancelEventRegistration",
}
