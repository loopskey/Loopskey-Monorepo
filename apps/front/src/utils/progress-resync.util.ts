import { baseApi } from "@/lib/rtk/baseApi";

const RESYNC_DELAYS_MS = [1500, 4500];

type TResyncDispatch = (
  action: ReturnType<typeof baseApi.util.invalidateTags>,
) => unknown;

export const scheduleProgressResync = (dispatch: TResyncDispatch) => {
  for (const delay of RESYNC_DELAYS_MS)
    setTimeout(
      () => dispatch(baseApi.util.invalidateTags(["ProfessionalCpdPlan"])),
      delay,
    );
};
