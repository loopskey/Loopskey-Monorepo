"use client";

import { useCurrentUserQuery } from "@/lib/rtk/endpoints/auth.api";
import { trackConversion } from "@/lib/telemetry/conversions";
import { useCallback } from "react";
import { Role } from "@/lib/graphql/base";

type ConversionRequest = Parameters<typeof trackConversion>[0];

const MANAGEMENT_ROLES: readonly Role[] = [Role.Admin, Role.Provider];

export const useAcquisitionTracking = () => {
  const { data, isLoading } = useCurrentUserQuery(undefined);
  const role = data?.user?.role;
  const isManagement = role !== undefined && MANAGEMENT_ROLES.includes(role);

  const track = useCallback(
    (request: ConversionRequest) => {
      if (!isManagement) trackConversion(request);
    },
    [isManagement],
  );

  return { isSettled: !isLoading, track };
};
