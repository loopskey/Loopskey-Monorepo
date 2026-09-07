"use client";

import { getAdminAssociationErrorKey } from "@utils/admin-association-error";
import { AssociationMessageCode } from "@loopskey/api-contracts/error-codes";
import { TAdminAssociationItem } from "@/types/admin-dashboard.types";
import { SEARCH_DEBOUNCE_MS } from "@utils/constant";
import { useDebouncedValue } from "@hooks/useDebounced";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { UserStatus } from "@/lib/graphql/base";
import { useI18n } from "@hooks/useI18n";
import { notify } from "@hooks/notify";

import * as API from "@lib/rtk/endpoints/association-dashboard.api";
import * as SC from "@lib/validations/association-dashboard.schema";

const PAGE_SIZE = 10;
const ALL = "ALL";
const SEARCH_MIN_LENGTH = 2;

export const ownerStatusOptions = [
  ALL,
  UserStatus.Pending,
  UserStatus.Active,
  UserStatus.Disabled,
] as const;

type TOwnerStatusFilter = (typeof ownerStatusOptions)[number];

const emptyForm: SC.TCreateAssociationAccountForm = {
  name: "",
  representativeFullName: "",
  workEmail: "",
  country: "",
  website: "",
  description: "",
  logoUrl: "",
};

export const useAdminAssociationsTab = () => {
  const { t } = useI18n();

  const [search, setSearchState] = useState("");
  const [ownerStatus, setOwnerStatusState] = useState<TOwnerStatusFilter>(ALL);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [createdName, setCreatedName] = useState<string | null>(null);
  const [emailQueued, setEmailQueued] = useState(true);

  const debouncedSearch = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);
  const cursor = cursorStack.at(-1);

  const createForm = useForm<SC.TCreateAssociationAccountForm>({
    resolver: zodResolver(SC.createAssociationAccountSchema),
    defaultValues: emptyForm,
  });

  const variables = useMemo(
    () => ({
      filter: {
        search:
          debouncedSearch.length >= SEARCH_MIN_LENGTH
            ? debouncedSearch
            : undefined,
        ownerStatus: ownerStatus === ALL ? undefined : ownerStatus,
      },
      pagination: { take: PAGE_SIZE, cursor },
    }),
    [debouncedSearch, ownerStatus, cursor],
  );

  const query = API.useAssociationAccountsQuery(variables);
  const [createAccount, createState] =
    API.useCreateAssociationAccountMutation();
  const [resendActivation, resendState] =
    API.useResendAssociationActivationMutation();

  const items = query.data?.items ?? [];

  const resetPagination = () => setCursorStack([]);

  const setSearch = (value: string) => {
    setSearchState(value);
    resetPagination();
  };

  const setOwnerStatus = (value: TOwnerStatusFilter) => {
    setOwnerStatusState(value);
    resetPagination();
  };

  const resetFilters = () => {
    setSearchState("");
    setOwnerStatusState(ALL);
    resetPagination();
  };

  const nextPage = () => {
    const nextCursor = query.data?.pageInfo?.nextCursor;
    if (!nextCursor || !query.data?.pageInfo?.hasNextPage) return;
    setCursorStack((previous) =>
      previous.at(-1) === nextCursor ? previous : [...previous, nextCursor],
    );
  };

  const previousPage = () =>
    setCursorStack((previous) => previous.slice(0, -1));

  const openCreate = () => {
    setCreatedName(null);
    setEmailQueued(true);
    createForm.reset(emptyForm);
    setCreateOpen(true);
  };

  const closeCreate = () => {
    if (createState.isLoading) return;
    setCreateOpen(false);
    setCreatedName(null);
  };

  const submitCreate = createForm.handleSubmit(async (values) => {
    try {
      const result = await createAccount({
        name: values.name.trim(),
        representativeFullName: values.representativeFullName.trim(),
        workEmail: values.workEmail.trim().toLowerCase(),
        country: values.country?.trim() || undefined,
        website: values.website?.trim() || undefined,
        description: values.description?.trim() || undefined,
        logoUrl: values.logoUrl?.trim() || undefined,
      }).unwrap();
      setCreatedName(result.association?.name ?? values.name.trim());
      setEmailQueued(
        result.code !== AssociationMessageCode.ACTIVATION_EMAIL_NOT_SENT,
      );
    } catch (error) {
      notify.error(t(getAdminAssociationErrorKey(error)));
    }
  });

  const resend = async (item: TAdminAssociationItem) => {
    try {
      const result = await resendActivation({
        associationId: item.id,
      }).unwrap();
      if (result.success) {
        notify.success(
          t("adminDashboard.associations.messages.activationResent", {
            name: item.name,
          }),
        );
        return;
      }
      notify.error(t(getAdminAssociationErrorKey(result.code)));
    } catch (error) {
      notify.error(t(getAdminAssociationErrorKey(error)));
    }
  };

  const refresh = async () => {
    await query.refetch();
  };

  return {
    t,
    query,
    items,
    search,
    resend,
    refresh,
    nextPage,
    setSearch,
    createForm,
    openCreate,
    closeCreate,
    ownerStatus,
    createdName,
    emailQueued,
    isCreateOpen,
    submitCreate,
    previousPage,
    resetFilters,
    setOwnerStatus,
    ownerStatusOptions,
    isCreating: createState.isLoading,
    isResending: resendState.isLoading,
    isLoading: query.isFetching,
    page: cursorStack.length + 1,
    canPrevious: cursorStack.length > 0,
    totalCount: query.data?.totalCount ?? 0,
    hasNextPage: Boolean(query.data?.pageInfo?.hasNextPage),
    hasActiveFilters: search.trim().length > 0 || ownerStatus !== ALL,
    isFiltered:
      debouncedSearch.length >= SEARCH_MIN_LENGTH || ownerStatus !== ALL,
  };
};

export type TUseAdminAssociationsTab = ReturnType<
  typeof useAdminAssociationsTab
>;
