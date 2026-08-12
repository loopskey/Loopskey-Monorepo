import * as Types from "@/lib/graphql/base";
import { TypedDocumentString } from "@/lib/graphql/base";
export type EventCardFieldsFragment = { __typename?: 'Event', id: string, pdu: number, slug: string, type: Types.EventType, title: string, views: number, price?: number | null, status: Types.EventStatus, isFree: boolean, rating: number, speaker?: string | null, endDate?: string | null, timezone: string, imageUrl?: string | null, category: Types.EventCategory, location?: string | null, currency: string, capacity?: number | null, language?: Types.AppLanguage | null, startDate: string, onlineUrl?: string | null, attendees: number, organizer?: string | null, updatedAt: string, deletedAt?: string | null, createdAt: string, providerId?: string | null, description: string, ratingCount: number, pduCategory?: Types.PduCategory | null, deliveryMode: Types.EventDeliveryMode, averageRating: number, specificTopic?: string | null, earlyBirdDiscount?: number | null, promotionVideoUrl?: string | null, registrationEnabled: boolean };

export type EventScheduleItemFieldsFragment = { __typename?: 'EventScheduleItem', id: string, title: string, speaker?: string | null, eventId: string, endTime: string, updatedAt: string, createdAt: string, dayNumber: number, startTime: string, description?: string | null };

export type EventDetailFieldsFragment = { __typename?: 'Event', id: string, pdu: number, slug: string, type: Types.EventType, title: string, views: number, price?: number | null, status: Types.EventStatus, isFree: boolean, rating: number, speaker?: string | null, endDate?: string | null, timezone: string, imageUrl?: string | null, category: Types.EventCategory, location?: string | null, currency: string, capacity?: number | null, language?: Types.AppLanguage | null, startDate: string, onlineUrl?: string | null, attendees: number, organizer?: string | null, updatedAt: string, deletedAt?: string | null, createdAt: string, providerId?: string | null, description: string, ratingCount: number, pduCategory?: Types.PduCategory | null, deliveryMode: Types.EventDeliveryMode, averageRating: number, specificTopic?: string | null, earlyBirdDiscount?: number | null, promotionVideoUrl?: string | null, registrationEnabled: boolean, scheduleItems?: Array<{ __typename?: 'EventScheduleItem', id: string, title: string, speaker?: string | null, eventId: string, endTime: string, updatedAt: string, createdAt: string, dayNumber: number, startTime: string, description?: string | null }> | null };

export type EventRegistrationFieldsFragment = { __typename?: 'EventRegistration', id: string, userId: string, status: Types.EventRegistrationStatus, eventId: string, createdAt: string, updatedAt: string, attendedAt?: string | null, completedAt?: string | null };

export type EventPageInfoFieldsFragment = { __typename?: 'EventPageInfo', nextCursor?: string | null, hasNextPage: boolean };

export type EventsQueryVariables = Types.Exact<{
  filter?: Types.InputMaybe<Types.EventFilterInput>;
  pagination?: Types.InputMaybe<Types.EventPaginationInput>;
  sort?: Types.InputMaybe<Types.EventSortInput>;
}>;


export type EventsQuery = { __typename?: 'Query', events: { __typename?: 'PaginatedEvents', totalCount: number, items: Array<{ __typename?: 'Event', id: string, pdu: number, slug: string, type: Types.EventType, title: string, views: number, price?: number | null, status: Types.EventStatus, isFree: boolean, rating: number, speaker?: string | null, endDate?: string | null, timezone: string, imageUrl?: string | null, category: Types.EventCategory, location?: string | null, currency: string, capacity?: number | null, language?: Types.AppLanguage | null, startDate: string, onlineUrl?: string | null, attendees: number, organizer?: string | null, updatedAt: string, deletedAt?: string | null, createdAt: string, providerId?: string | null, description: string, ratingCount: number, pduCategory?: Types.PduCategory | null, deliveryMode: Types.EventDeliveryMode, averageRating: number, specificTopic?: string | null, earlyBirdDiscount?: number | null, promotionVideoUrl?: string | null, registrationEnabled: boolean }>, pageInfo: { __typename?: 'EventPageInfo', nextCursor?: string | null, hasNextPage: boolean } } };

export type EventByIdQueryVariables = Types.Exact<{
  eventId: Types.Scalars['String']['input'];
}>;


export type EventByIdQuery = { __typename?: 'Query', eventById: { __typename?: 'Event', id: string, pdu: number, slug: string, type: Types.EventType, title: string, views: number, price?: number | null, status: Types.EventStatus, isFree: boolean, rating: number, speaker?: string | null, endDate?: string | null, timezone: string, imageUrl?: string | null, category: Types.EventCategory, location?: string | null, currency: string, capacity?: number | null, language?: Types.AppLanguage | null, startDate: string, onlineUrl?: string | null, attendees: number, organizer?: string | null, updatedAt: string, deletedAt?: string | null, createdAt: string, providerId?: string | null, description: string, ratingCount: number, pduCategory?: Types.PduCategory | null, deliveryMode: Types.EventDeliveryMode, averageRating: number, specificTopic?: string | null, earlyBirdDiscount?: number | null, promotionVideoUrl?: string | null, registrationEnabled: boolean, scheduleItems?: Array<{ __typename?: 'EventScheduleItem', id: string, title: string, speaker?: string | null, eventId: string, endTime: string, updatedAt: string, createdAt: string, dayNumber: number, startTime: string, description?: string | null }> | null } };

export type EventBySlugQueryVariables = Types.Exact<{
  slug: Types.Scalars['String']['input'];
}>;


export type EventBySlugQuery = { __typename?: 'Query', eventBySlug: { __typename?: 'Event', id: string, pdu: number, slug: string, type: Types.EventType, title: string, views: number, price?: number | null, status: Types.EventStatus, isFree: boolean, rating: number, speaker?: string | null, endDate?: string | null, timezone: string, imageUrl?: string | null, category: Types.EventCategory, location?: string | null, currency: string, capacity?: number | null, language?: Types.AppLanguage | null, startDate: string, onlineUrl?: string | null, attendees: number, organizer?: string | null, updatedAt: string, deletedAt?: string | null, createdAt: string, providerId?: string | null, description: string, ratingCount: number, pduCategory?: Types.PduCategory | null, deliveryMode: Types.EventDeliveryMode, averageRating: number, specificTopic?: string | null, earlyBirdDiscount?: number | null, promotionVideoUrl?: string | null, registrationEnabled: boolean, scheduleItems?: Array<{ __typename?: 'EventScheduleItem', id: string, title: string, speaker?: string | null, eventId: string, endTime: string, updatedAt: string, createdAt: string, dayNumber: number, startTime: string, description?: string | null }> | null } };

export type UpcomingEventsQueryVariables = Types.Exact<{
  take?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type UpcomingEventsQuery = { __typename?: 'Query', upcomingEvents: Array<{ __typename?: 'Event', id: string, pdu: number, slug: string, type: Types.EventType, title: string, views: number, price?: number | null, status: Types.EventStatus, isFree: boolean, rating: number, speaker?: string | null, endDate?: string | null, timezone: string, imageUrl?: string | null, category: Types.EventCategory, location?: string | null, currency: string, capacity?: number | null, language?: Types.AppLanguage | null, startDate: string, onlineUrl?: string | null, attendees: number, organizer?: string | null, updatedAt: string, deletedAt?: string | null, createdAt: string, providerId?: string | null, description: string, ratingCount: number, pduCategory?: Types.PduCategory | null, deliveryMode: Types.EventDeliveryMode, averageRating: number, specificTopic?: string | null, earlyBirdDiscount?: number | null, promotionVideoUrl?: string | null, registrationEnabled: boolean }> };

export type FeaturedEventsQueryVariables = Types.Exact<{
  take?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type FeaturedEventsQuery = { __typename?: 'Query', featuredEvents: Array<{ __typename?: 'Event', id: string, pdu: number, slug: string, type: Types.EventType, title: string, views: number, price?: number | null, status: Types.EventStatus, isFree: boolean, rating: number, speaker?: string | null, endDate?: string | null, timezone: string, imageUrl?: string | null, category: Types.EventCategory, location?: string | null, currency: string, capacity?: number | null, language?: Types.AppLanguage | null, startDate: string, onlineUrl?: string | null, attendees: number, organizer?: string | null, updatedAt: string, deletedAt?: string | null, createdAt: string, providerId?: string | null, description: string, ratingCount: number, pduCategory?: Types.PduCategory | null, deliveryMode: Types.EventDeliveryMode, averageRating: number, specificTopic?: string | null, earlyBirdDiscount?: number | null, promotionVideoUrl?: string | null, registrationEnabled: boolean }> };

export type MyProviderEventsQueryVariables = Types.Exact<{
  filter?: Types.InputMaybe<Types.EventFilterInput>;
  pagination?: Types.InputMaybe<Types.EventPaginationInput>;
  sort?: Types.InputMaybe<Types.EventSortInput>;
}>;


export type MyProviderEventsQuery = { __typename?: 'Query', myProviderEvents: { __typename?: 'PaginatedEvents', totalCount: number, items: Array<{ __typename?: 'Event', id: string, pdu: number, slug: string, type: Types.EventType, title: string, views: number, price?: number | null, status: Types.EventStatus, isFree: boolean, rating: number, speaker?: string | null, endDate?: string | null, timezone: string, imageUrl?: string | null, category: Types.EventCategory, location?: string | null, currency: string, capacity?: number | null, language?: Types.AppLanguage | null, startDate: string, onlineUrl?: string | null, attendees: number, organizer?: string | null, updatedAt: string, deletedAt?: string | null, createdAt: string, providerId?: string | null, description: string, ratingCount: number, pduCategory?: Types.PduCategory | null, deliveryMode: Types.EventDeliveryMode, averageRating: number, specificTopic?: string | null, earlyBirdDiscount?: number | null, promotionVideoUrl?: string | null, registrationEnabled: boolean }>, pageInfo: { __typename?: 'EventPageInfo', nextCursor?: string | null, hasNextPage: boolean } } };

export type MyRegisteredEventsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type MyRegisteredEventsQuery = { __typename?: 'Query', myRegisteredEvents: Array<{ __typename?: 'EventRegistration', id: string, userId: string, status: Types.EventRegistrationStatus, eventId: string, createdAt: string, updatedAt: string, attendedAt?: string | null, completedAt?: string | null }> };

export type CreateEventMutationVariables = Types.Exact<{
  input: Types.CreateEventInput;
}>;


export type CreateEventMutation = { __typename?: 'Mutation', createEvent: { __typename?: 'Event', id: string, pdu: number, slug: string, type: Types.EventType, title: string, views: number, price?: number | null, status: Types.EventStatus, isFree: boolean, rating: number, speaker?: string | null, endDate?: string | null, timezone: string, imageUrl?: string | null, category: Types.EventCategory, location?: string | null, currency: string, capacity?: number | null, language?: Types.AppLanguage | null, startDate: string, onlineUrl?: string | null, attendees: number, organizer?: string | null, updatedAt: string, deletedAt?: string | null, createdAt: string, providerId?: string | null, description: string, ratingCount: number, pduCategory?: Types.PduCategory | null, deliveryMode: Types.EventDeliveryMode, averageRating: number, specificTopic?: string | null, earlyBirdDiscount?: number | null, promotionVideoUrl?: string | null, registrationEnabled: boolean, scheduleItems?: Array<{ __typename?: 'EventScheduleItem', id: string, title: string, speaker?: string | null, eventId: string, endTime: string, updatedAt: string, createdAt: string, dayNumber: number, startTime: string, description?: string | null }> | null } };

export type UpdateEventMutationVariables = Types.Exact<{
  input: Types.UpdateEventInput;
}>;


export type UpdateEventMutation = { __typename?: 'Mutation', updateEvent: { __typename?: 'Event', id: string, pdu: number, slug: string, type: Types.EventType, title: string, views: number, price?: number | null, status: Types.EventStatus, isFree: boolean, rating: number, speaker?: string | null, endDate?: string | null, timezone: string, imageUrl?: string | null, category: Types.EventCategory, location?: string | null, currency: string, capacity?: number | null, language?: Types.AppLanguage | null, startDate: string, onlineUrl?: string | null, attendees: number, organizer?: string | null, updatedAt: string, deletedAt?: string | null, createdAt: string, providerId?: string | null, description: string, ratingCount: number, pduCategory?: Types.PduCategory | null, deliveryMode: Types.EventDeliveryMode, averageRating: number, specificTopic?: string | null, earlyBirdDiscount?: number | null, promotionVideoUrl?: string | null, registrationEnabled: boolean, scheduleItems?: Array<{ __typename?: 'EventScheduleItem', id: string, title: string, speaker?: string | null, eventId: string, endTime: string, updatedAt: string, createdAt: string, dayNumber: number, startTime: string, description?: string | null }> | null } };

export type RegisterEventMutationVariables = Types.Exact<{
  eventId: Types.Scalars['String']['input'];
}>;


export type RegisterEventMutation = { __typename?: 'Mutation', registerEvent: { __typename?: 'EventRegistration', id: string, userId: string, status: Types.EventRegistrationStatus, eventId: string, createdAt: string, updatedAt: string, attendedAt?: string | null, completedAt?: string | null } };

export type CancelEventRegistrationMutationVariables = Types.Exact<{
  eventId: Types.Scalars['String']['input'];
}>;


export type CancelEventRegistrationMutation = { __typename?: 'Mutation', cancelEventRegistration: { __typename?: 'EventRegistration', id: string, userId: string, status: Types.EventRegistrationStatus, eventId: string, createdAt: string, updatedAt: string, attendedAt?: string | null, completedAt?: string | null } };

export type PublishEventMutationVariables = Types.Exact<{
  eventId: Types.Scalars['String']['input'];
}>;


export type PublishEventMutation = { __typename?: 'Mutation', publishEvent: { __typename?: 'Event', id: string, pdu: number, slug: string, type: Types.EventType, title: string, views: number, price?: number | null, status: Types.EventStatus, isFree: boolean, rating: number, speaker?: string | null, endDate?: string | null, timezone: string, imageUrl?: string | null, category: Types.EventCategory, location?: string | null, currency: string, capacity?: number | null, language?: Types.AppLanguage | null, startDate: string, onlineUrl?: string | null, attendees: number, organizer?: string | null, updatedAt: string, deletedAt?: string | null, createdAt: string, providerId?: string | null, description: string, ratingCount: number, pduCategory?: Types.PduCategory | null, deliveryMode: Types.EventDeliveryMode, averageRating: number, specificTopic?: string | null, earlyBirdDiscount?: number | null, promotionVideoUrl?: string | null, registrationEnabled: boolean } };

export type ArchiveEventMutationVariables = Types.Exact<{
  eventId: Types.Scalars['String']['input'];
}>;


export type ArchiveEventMutation = { __typename?: 'Mutation', archiveEvent: { __typename?: 'Event', id: string, pdu: number, slug: string, type: Types.EventType, title: string, views: number, price?: number | null, status: Types.EventStatus, isFree: boolean, rating: number, speaker?: string | null, endDate?: string | null, timezone: string, imageUrl?: string | null, category: Types.EventCategory, location?: string | null, currency: string, capacity?: number | null, language?: Types.AppLanguage | null, startDate: string, onlineUrl?: string | null, attendees: number, organizer?: string | null, updatedAt: string, deletedAt?: string | null, createdAt: string, providerId?: string | null, description: string, ratingCount: number, pduCategory?: Types.PduCategory | null, deliveryMode: Types.EventDeliveryMode, averageRating: number, specificTopic?: string | null, earlyBirdDiscount?: number | null, promotionVideoUrl?: string | null, registrationEnabled: boolean } };

export type CancelEventMutationVariables = Types.Exact<{
  eventId: Types.Scalars['String']['input'];
}>;


export type CancelEventMutation = { __typename?: 'Mutation', cancelEvent: { __typename?: 'Event', id: string, pdu: number, slug: string, type: Types.EventType, title: string, views: number, price?: number | null, status: Types.EventStatus, isFree: boolean, rating: number, speaker?: string | null, endDate?: string | null, timezone: string, imageUrl?: string | null, category: Types.EventCategory, location?: string | null, currency: string, capacity?: number | null, language?: Types.AppLanguage | null, startDate: string, onlineUrl?: string | null, attendees: number, organizer?: string | null, updatedAt: string, deletedAt?: string | null, createdAt: string, providerId?: string | null, description: string, ratingCount: number, pduCategory?: Types.PduCategory | null, deliveryMode: Types.EventDeliveryMode, averageRating: number, specificTopic?: string | null, earlyBirdDiscount?: number | null, promotionVideoUrl?: string | null, registrationEnabled: boolean } };

export type DeleteEventMutationVariables = Types.Exact<{
  eventId: Types.Scalars['String']['input'];
}>;


export type DeleteEventMutation = { __typename?: 'Mutation', deleteEvent: { __typename?: 'Event', id: string, pdu: number, slug: string, type: Types.EventType, title: string, views: number, price?: number | null, status: Types.EventStatus, isFree: boolean, rating: number, speaker?: string | null, endDate?: string | null, timezone: string, imageUrl?: string | null, category: Types.EventCategory, location?: string | null, currency: string, capacity?: number | null, language?: Types.AppLanguage | null, startDate: string, onlineUrl?: string | null, attendees: number, organizer?: string | null, updatedAt: string, deletedAt?: string | null, createdAt: string, providerId?: string | null, description: string, ratingCount: number, pduCategory?: Types.PduCategory | null, deliveryMode: Types.EventDeliveryMode, averageRating: number, specificTopic?: string | null, earlyBirdDiscount?: number | null, promotionVideoUrl?: string | null, registrationEnabled: boolean } };

export type RestoreEventMutationVariables = Types.Exact<{
  eventId: Types.Scalars['String']['input'];
}>;


export type RestoreEventMutation = { __typename?: 'Mutation', restoreEvent: { __typename?: 'Event', id: string, pdu: number, slug: string, type: Types.EventType, title: string, views: number, price?: number | null, status: Types.EventStatus, isFree: boolean, rating: number, speaker?: string | null, endDate?: string | null, timezone: string, imageUrl?: string | null, category: Types.EventCategory, location?: string | null, currency: string, capacity?: number | null, language?: Types.AppLanguage | null, startDate: string, onlineUrl?: string | null, attendees: number, organizer?: string | null, updatedAt: string, deletedAt?: string | null, createdAt: string, providerId?: string | null, description: string, ratingCount: number, pduCategory?: Types.PduCategory | null, deliveryMode: Types.EventDeliveryMode, averageRating: number, specificTopic?: string | null, earlyBirdDiscount?: number | null, promotionVideoUrl?: string | null, registrationEnabled: boolean } };

export const EventCardFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment EventCardFields on Event {
  id
  pdu
  slug
  type
  title
  views
  price
  status
  isFree
  rating
  speaker
  endDate
  timezone
  imageUrl
  category
  location
  currency
  capacity
  language
  startDate
  onlineUrl
  attendees
  organizer
  updatedAt
  deletedAt
  createdAt
  providerId
  description
  ratingCount
  pduCategory
  deliveryMode
  averageRating
  specificTopic
  earlyBirdDiscount
  promotionVideoUrl
  registrationEnabled
}
    `, {"fragmentName":"EventCardFields"}) as unknown as TypedDocumentString<EventCardFieldsFragment, unknown>;
export const EventScheduleItemFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment EventScheduleItemFields on EventScheduleItem {
  id
  title
  speaker
  eventId
  endTime
  updatedAt
  createdAt
  dayNumber
  startTime
  description
}
    `, {"fragmentName":"EventScheduleItemFields"}) as unknown as TypedDocumentString<EventScheduleItemFieldsFragment, unknown>;
export const EventDetailFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment EventDetailFields on Event {
  ...EventCardFields
  scheduleItems {
    ...EventScheduleItemFields
  }
}
    fragment EventCardFields on Event {
  id
  pdu
  slug
  type
  title
  views
  price
  status
  isFree
  rating
  speaker
  endDate
  timezone
  imageUrl
  category
  location
  currency
  capacity
  language
  startDate
  onlineUrl
  attendees
  organizer
  updatedAt
  deletedAt
  createdAt
  providerId
  description
  ratingCount
  pduCategory
  deliveryMode
  averageRating
  specificTopic
  earlyBirdDiscount
  promotionVideoUrl
  registrationEnabled
}
fragment EventScheduleItemFields on EventScheduleItem {
  id
  title
  speaker
  eventId
  endTime
  updatedAt
  createdAt
  dayNumber
  startTime
  description
}`, {"fragmentName":"EventDetailFields"}) as unknown as TypedDocumentString<EventDetailFieldsFragment, unknown>;
export const EventRegistrationFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment EventRegistrationFields on EventRegistration {
  id
  userId
  status
  eventId
  createdAt
  updatedAt
  attendedAt
  completedAt
}
    `, {"fragmentName":"EventRegistrationFields"}) as unknown as TypedDocumentString<EventRegistrationFieldsFragment, unknown>;
export const EventPageInfoFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment EventPageInfoFields on EventPageInfo {
  nextCursor
  hasNextPage
}
    `, {"fragmentName":"EventPageInfoFields"}) as unknown as TypedDocumentString<EventPageInfoFieldsFragment, unknown>;
export const EventsDocument = /*#__PURE__*/ new TypedDocumentString(`
    query Events($filter: EventFilterInput, $pagination: EventPaginationInput, $sort: EventSortInput) {
  events(filter: $filter, pagination: $pagination, sort: $sort) {
    items {
      ...EventCardFields
    }
    totalCount
    pageInfo {
      ...EventPageInfoFields
    }
  }
}
    fragment EventCardFields on Event {
  id
  pdu
  slug
  type
  title
  views
  price
  status
  isFree
  rating
  speaker
  endDate
  timezone
  imageUrl
  category
  location
  currency
  capacity
  language
  startDate
  onlineUrl
  attendees
  organizer
  updatedAt
  deletedAt
  createdAt
  providerId
  description
  ratingCount
  pduCategory
  deliveryMode
  averageRating
  specificTopic
  earlyBirdDiscount
  promotionVideoUrl
  registrationEnabled
}
fragment EventPageInfoFields on EventPageInfo {
  nextCursor
  hasNextPage
}`) as unknown as TypedDocumentString<EventsQuery, EventsQueryVariables>;
export const EventByIdDocument = /*#__PURE__*/ new TypedDocumentString(`
    query EventById($eventId: String!) {
  eventById(eventId: $eventId) {
    ...EventDetailFields
  }
}
    fragment EventCardFields on Event {
  id
  pdu
  slug
  type
  title
  views
  price
  status
  isFree
  rating
  speaker
  endDate
  timezone
  imageUrl
  category
  location
  currency
  capacity
  language
  startDate
  onlineUrl
  attendees
  organizer
  updatedAt
  deletedAt
  createdAt
  providerId
  description
  ratingCount
  pduCategory
  deliveryMode
  averageRating
  specificTopic
  earlyBirdDiscount
  promotionVideoUrl
  registrationEnabled
}
fragment EventScheduleItemFields on EventScheduleItem {
  id
  title
  speaker
  eventId
  endTime
  updatedAt
  createdAt
  dayNumber
  startTime
  description
}
fragment EventDetailFields on Event {
  ...EventCardFields
  scheduleItems {
    ...EventScheduleItemFields
  }
}`) as unknown as TypedDocumentString<EventByIdQuery, EventByIdQueryVariables>;
export const EventBySlugDocument = /*#__PURE__*/ new TypedDocumentString(`
    query EventBySlug($slug: String!) {
  eventBySlug(slug: $slug) {
    ...EventDetailFields
  }
}
    fragment EventCardFields on Event {
  id
  pdu
  slug
  type
  title
  views
  price
  status
  isFree
  rating
  speaker
  endDate
  timezone
  imageUrl
  category
  location
  currency
  capacity
  language
  startDate
  onlineUrl
  attendees
  organizer
  updatedAt
  deletedAt
  createdAt
  providerId
  description
  ratingCount
  pduCategory
  deliveryMode
  averageRating
  specificTopic
  earlyBirdDiscount
  promotionVideoUrl
  registrationEnabled
}
fragment EventScheduleItemFields on EventScheduleItem {
  id
  title
  speaker
  eventId
  endTime
  updatedAt
  createdAt
  dayNumber
  startTime
  description
}
fragment EventDetailFields on Event {
  ...EventCardFields
  scheduleItems {
    ...EventScheduleItemFields
  }
}`) as unknown as TypedDocumentString<EventBySlugQuery, EventBySlugQueryVariables>;
export const UpcomingEventsDocument = /*#__PURE__*/ new TypedDocumentString(`
    query UpcomingEvents($take: Int) {
  upcomingEvents(take: $take) {
    ...EventCardFields
  }
}
    fragment EventCardFields on Event {
  id
  pdu
  slug
  type
  title
  views
  price
  status
  isFree
  rating
  speaker
  endDate
  timezone
  imageUrl
  category
  location
  currency
  capacity
  language
  startDate
  onlineUrl
  attendees
  organizer
  updatedAt
  deletedAt
  createdAt
  providerId
  description
  ratingCount
  pduCategory
  deliveryMode
  averageRating
  specificTopic
  earlyBirdDiscount
  promotionVideoUrl
  registrationEnabled
}`) as unknown as TypedDocumentString<UpcomingEventsQuery, UpcomingEventsQueryVariables>;
export const FeaturedEventsDocument = /*#__PURE__*/ new TypedDocumentString(`
    query FeaturedEvents($take: Int) {
  featuredEvents(take: $take) {
    ...EventCardFields
  }
}
    fragment EventCardFields on Event {
  id
  pdu
  slug
  type
  title
  views
  price
  status
  isFree
  rating
  speaker
  endDate
  timezone
  imageUrl
  category
  location
  currency
  capacity
  language
  startDate
  onlineUrl
  attendees
  organizer
  updatedAt
  deletedAt
  createdAt
  providerId
  description
  ratingCount
  pduCategory
  deliveryMode
  averageRating
  specificTopic
  earlyBirdDiscount
  promotionVideoUrl
  registrationEnabled
}`) as unknown as TypedDocumentString<FeaturedEventsQuery, FeaturedEventsQueryVariables>;
export const MyProviderEventsDocument = /*#__PURE__*/ new TypedDocumentString(`
    query MyProviderEvents($filter: EventFilterInput, $pagination: EventPaginationInput, $sort: EventSortInput) {
  myProviderEvents(filter: $filter, pagination: $pagination, sort: $sort) {
    items {
      ...EventCardFields
    }
    totalCount
    pageInfo {
      ...EventPageInfoFields
    }
  }
}
    fragment EventCardFields on Event {
  id
  pdu
  slug
  type
  title
  views
  price
  status
  isFree
  rating
  speaker
  endDate
  timezone
  imageUrl
  category
  location
  currency
  capacity
  language
  startDate
  onlineUrl
  attendees
  organizer
  updatedAt
  deletedAt
  createdAt
  providerId
  description
  ratingCount
  pduCategory
  deliveryMode
  averageRating
  specificTopic
  earlyBirdDiscount
  promotionVideoUrl
  registrationEnabled
}
fragment EventPageInfoFields on EventPageInfo {
  nextCursor
  hasNextPage
}`) as unknown as TypedDocumentString<MyProviderEventsQuery, MyProviderEventsQueryVariables>;
export const MyRegisteredEventsDocument = /*#__PURE__*/ new TypedDocumentString(`
    query MyRegisteredEvents {
  myRegisteredEvents {
    ...EventRegistrationFields
  }
}
    fragment EventRegistrationFields on EventRegistration {
  id
  userId
  status
  eventId
  createdAt
  updatedAt
  attendedAt
  completedAt
}`) as unknown as TypedDocumentString<MyRegisteredEventsQuery, MyRegisteredEventsQueryVariables>;
export const CreateEventDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation CreateEvent($input: CreateEventInput!) {
  createEvent(input: $input) {
    ...EventDetailFields
  }
}
    fragment EventCardFields on Event {
  id
  pdu
  slug
  type
  title
  views
  price
  status
  isFree
  rating
  speaker
  endDate
  timezone
  imageUrl
  category
  location
  currency
  capacity
  language
  startDate
  onlineUrl
  attendees
  organizer
  updatedAt
  deletedAt
  createdAt
  providerId
  description
  ratingCount
  pduCategory
  deliveryMode
  averageRating
  specificTopic
  earlyBirdDiscount
  promotionVideoUrl
  registrationEnabled
}
fragment EventScheduleItemFields on EventScheduleItem {
  id
  title
  speaker
  eventId
  endTime
  updatedAt
  createdAt
  dayNumber
  startTime
  description
}
fragment EventDetailFields on Event {
  ...EventCardFields
  scheduleItems {
    ...EventScheduleItemFields
  }
}`) as unknown as TypedDocumentString<CreateEventMutation, CreateEventMutationVariables>;
export const UpdateEventDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation UpdateEvent($input: UpdateEventInput!) {
  updateEvent(input: $input) {
    ...EventDetailFields
  }
}
    fragment EventCardFields on Event {
  id
  pdu
  slug
  type
  title
  views
  price
  status
  isFree
  rating
  speaker
  endDate
  timezone
  imageUrl
  category
  location
  currency
  capacity
  language
  startDate
  onlineUrl
  attendees
  organizer
  updatedAt
  deletedAt
  createdAt
  providerId
  description
  ratingCount
  pduCategory
  deliveryMode
  averageRating
  specificTopic
  earlyBirdDiscount
  promotionVideoUrl
  registrationEnabled
}
fragment EventScheduleItemFields on EventScheduleItem {
  id
  title
  speaker
  eventId
  endTime
  updatedAt
  createdAt
  dayNumber
  startTime
  description
}
fragment EventDetailFields on Event {
  ...EventCardFields
  scheduleItems {
    ...EventScheduleItemFields
  }
}`) as unknown as TypedDocumentString<UpdateEventMutation, UpdateEventMutationVariables>;
export const RegisterEventDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation RegisterEvent($eventId: String!) {
  registerEvent(eventId: $eventId) {
    ...EventRegistrationFields
  }
}
    fragment EventRegistrationFields on EventRegistration {
  id
  userId
  status
  eventId
  createdAt
  updatedAt
  attendedAt
  completedAt
}`) as unknown as TypedDocumentString<RegisterEventMutation, RegisterEventMutationVariables>;
export const CancelEventRegistrationDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation CancelEventRegistration($eventId: String!) {
  cancelEventRegistration(eventId: $eventId) {
    ...EventRegistrationFields
  }
}
    fragment EventRegistrationFields on EventRegistration {
  id
  userId
  status
  eventId
  createdAt
  updatedAt
  attendedAt
  completedAt
}`) as unknown as TypedDocumentString<CancelEventRegistrationMutation, CancelEventRegistrationMutationVariables>;
export const PublishEventDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation PublishEvent($eventId: String!) {
  publishEvent(eventId: $eventId) {
    ...EventCardFields
  }
}
    fragment EventCardFields on Event {
  id
  pdu
  slug
  type
  title
  views
  price
  status
  isFree
  rating
  speaker
  endDate
  timezone
  imageUrl
  category
  location
  currency
  capacity
  language
  startDate
  onlineUrl
  attendees
  organizer
  updatedAt
  deletedAt
  createdAt
  providerId
  description
  ratingCount
  pduCategory
  deliveryMode
  averageRating
  specificTopic
  earlyBirdDiscount
  promotionVideoUrl
  registrationEnabled
}`) as unknown as TypedDocumentString<PublishEventMutation, PublishEventMutationVariables>;
export const ArchiveEventDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation ArchiveEvent($eventId: String!) {
  archiveEvent(eventId: $eventId) {
    ...EventCardFields
  }
}
    fragment EventCardFields on Event {
  id
  pdu
  slug
  type
  title
  views
  price
  status
  isFree
  rating
  speaker
  endDate
  timezone
  imageUrl
  category
  location
  currency
  capacity
  language
  startDate
  onlineUrl
  attendees
  organizer
  updatedAt
  deletedAt
  createdAt
  providerId
  description
  ratingCount
  pduCategory
  deliveryMode
  averageRating
  specificTopic
  earlyBirdDiscount
  promotionVideoUrl
  registrationEnabled
}`) as unknown as TypedDocumentString<ArchiveEventMutation, ArchiveEventMutationVariables>;
export const CancelEventDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation CancelEvent($eventId: String!) {
  cancelEvent(eventId: $eventId) {
    ...EventCardFields
  }
}
    fragment EventCardFields on Event {
  id
  pdu
  slug
  type
  title
  views
  price
  status
  isFree
  rating
  speaker
  endDate
  timezone
  imageUrl
  category
  location
  currency
  capacity
  language
  startDate
  onlineUrl
  attendees
  organizer
  updatedAt
  deletedAt
  createdAt
  providerId
  description
  ratingCount
  pduCategory
  deliveryMode
  averageRating
  specificTopic
  earlyBirdDiscount
  promotionVideoUrl
  registrationEnabled
}`) as unknown as TypedDocumentString<CancelEventMutation, CancelEventMutationVariables>;
export const DeleteEventDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation DeleteEvent($eventId: String!) {
  deleteEvent(eventId: $eventId) {
    ...EventCardFields
  }
}
    fragment EventCardFields on Event {
  id
  pdu
  slug
  type
  title
  views
  price
  status
  isFree
  rating
  speaker
  endDate
  timezone
  imageUrl
  category
  location
  currency
  capacity
  language
  startDate
  onlineUrl
  attendees
  organizer
  updatedAt
  deletedAt
  createdAt
  providerId
  description
  ratingCount
  pduCategory
  deliveryMode
  averageRating
  specificTopic
  earlyBirdDiscount
  promotionVideoUrl
  registrationEnabled
}`) as unknown as TypedDocumentString<DeleteEventMutation, DeleteEventMutationVariables>;
export const RestoreEventDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation RestoreEvent($eventId: String!) {
  restoreEvent(eventId: $eventId) {
    ...EventCardFields
  }
}
    fragment EventCardFields on Event {
  id
  pdu
  slug
  type
  title
  views
  price
  status
  isFree
  rating
  speaker
  endDate
  timezone
  imageUrl
  category
  location
  currency
  capacity
  language
  startDate
  onlineUrl
  attendees
  organizer
  updatedAt
  deletedAt
  createdAt
  providerId
  description
  ratingCount
  pduCategory
  deliveryMode
  averageRating
  specificTopic
  earlyBirdDiscount
  promotionVideoUrl
  registrationEnabled
}`) as unknown as TypedDocumentString<RestoreEventMutation, RestoreEventMutationVariables>;