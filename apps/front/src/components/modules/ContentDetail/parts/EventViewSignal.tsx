"use client";

import { useRecordEventViewMutation } from "@/lib/rtk/endpoints/event.api";
import { useEffect } from "react";

const STORAGE_PREFIX = "loopskey:event-view:";

const claimViewSlot = (eventId: string) => {
  const key = `${STORAGE_PREFIX}${eventId}`;
  try {
    if (window.sessionStorage.getItem(key) !== null) return false;
    window.sessionStorage.setItem(key, "1");
  } catch {
    return true;
  }
  return true;
};

const EventViewSignal = ({ eventId }: { eventId: string }) => {
  const [recordEventView] = useRecordEventViewMutation();

  useEffect(() => {
    if (!claimViewSlot(eventId)) return;
    void recordEventView(eventId);
  }, [eventId, recordEventView]);

  return null;
};

export default EventViewSignal;
