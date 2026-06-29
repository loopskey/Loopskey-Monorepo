import { ReactNode } from "react";

import * as API from "@/lib/graphql/generated";

export type TProviderDashboardTab =
  | "overview"
  | "analytics"
  | "attendees"
  | "my-goals"
  | "settings"
  | "my-events"
  | "create-event"
  | "promotion-requests";

export type TTimePoint = {
  date: string;
  revenue: number;
  registrations: number;
};

export type TBreakdownPoint = {
  label: string;
  count: number;
  value?: number | null;
};

export type TTopEventPoint = {
  title: string;
  views: number;
  revenue: number;
  registrations: number;
  conversionRate: number;
};

export type TProviderEventStep = {
  key: string;
  value: number;
  title: string;
  description: string;
};

export type TProviderEventStepper = {
  activeStep: number;
  steps: TProviderEventStep[];
  onChange: (step: number) => void;
};

export type TStepperField = {
  label: string;
  className?: string;
  children: ReactNode;
};

export type TSelectField = {
  label: string;
  value: string;
  items: readonly string[];
  onChange: (value: string) => void;
};

export type TCreateEventStatus =
  | API.EventStatus.Draft
  | API.EventStatus.Published;

export type TProviderCreateEventForm = {
  pdu: string;
  title: string;
  price: string;
  endDate: string;
  speaker: string;
  isFree: boolean;
  location: string;
  endTime: string;
  capacity: string;
  imageUrl: string;
  currency: string;
  onlineUrl: string;
  startTime: string;
  startDate: string;
  organizer: string;
  description: string;
  type: API.EventType;
  specificTopic: string;
  promotionVideoUrl: string;
  language: API.AppLanguage;
  earlyBirdDiscount: string;
  category: API.EventCategory;
  pduCategory: API.PduCategory;
  deliveryMode: API.EventDeliveryMode;
};

export type ProviderPromotionRequestFormValues = {
  note: string;
  budget: string;
  eventId: string;
  promotionType: API.PromotionType;
};

export type ProviderPromotionRequestFilterValues = {
  search: string;
  promotionType: API.PromotionType | "ALL";
  status: API.PromotionRequestStatus | "ALL";
};

export type SelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};
