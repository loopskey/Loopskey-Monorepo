export type AdminAccessRequestListState =
  | "content"
  | "empty"
  | "error"
  | "loading"
  | "no-results"
  | "unauthorized";

type GetAdminAccessRequestListStateArgs = {
  errorStatus: number | null;
  hasActiveFilters: boolean;
  isError: boolean;
  isLoading: boolean;
  itemCount: number;
};

export const getAdminAccessRequestListState = ({
  errorStatus,
  hasActiveFilters,
  isError,
  isLoading,
  itemCount,
}: GetAdminAccessRequestListStateArgs): AdminAccessRequestListState => {
  if (isLoading) return "loading";
  if (isError && (errorStatus === 401 || errorStatus === 403))
    return "unauthorized";
  if (isError) return "error";
  if (itemCount > 0) return "content";
  return hasActiveFilters ? "no-results" : "empty";
};
