"use client";

import { useMemo, useState } from "react";
import { TCpdCategoryItem } from "@/types/org-dashboard.types";
import { PduCategory } from "@/lib/graphql/generated";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";

import * as API from "@/lib/rtk/endpoints/org-dashboard.api";
import * as SC from "@/lib/validations/org-dashboard.schema";

const defaultCategoryValues: SC.TCpdCategoryFormValues = {
  title: "",
  isActive: true,
  description: "",
  requiredHours: 0,
  category: Object.values(PduCategory)[0],
};

export const useOrgCpdCategoriesTab = () => {
  const { t } = useI18n();

  const currentYear = String(new Date().getFullYear());
  const [year, setYear] = useState(currentYear);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [editingItem, setEditingItem] = useState<TCpdCategoryItem | null>(null);
  const [isCreateViewOpen, setIsCreateViewOpen] = useState(false);
  const cursor = cursorStack.at(-1);

  const form = useForm<
    SC.TCpdCategoryFormInput,
    unknown,
    SC.TCpdCategoryFormValues
  >({
    resolver: zodResolver(SC.cpdCategoryFormSchema),
    defaultValues: defaultCategoryValues,
  });

  const categoryVariables = useMemo(
    () => ({
      filter: {
        year,
        search: search.trim() || undefined,
        isActive:
          status === "ALL" ? undefined : status === "ACTIVE" ? true : false,
      },
      pagination: {
        take: 9,
        cursor,
      },
    }),
    [year, search, status, cursor],
  );

  const statsQuery = API.useOrganizationCpdCategoryStatsQuery({ year });
  const categoriesQuery =
    API.useOrganizationCpdCategoriesQuery(categoryVariables);

  const [createCategory, createState] =
    API.useCreateOrganizationCpdCategoryMutation();
  const [updateCategory, updateState] =
    API.useUpdateOrganizationCpdCategoryMutation();
  const [deleteCategory, deleteState] =
    API.useDeleteOrganizationCpdCategoryMutation();

  const categories = categoriesQuery.data?.items ?? [];

  const yearOptions = useMemo(() => {
    const base = new Date().getFullYear();
    return Array.from({ length: 6 }).map((_, index) => {
      const item = String(base - index);
      return { value: item, label: item };
    });
  }, []);

  const openCreateView = () => {
    setEditingItem(null);
    setIsCreateViewOpen(true);
    form.reset(defaultCategoryValues);
  };

  const closeCreateView = () => {
    setIsCreateViewOpen(false);
    form.reset(defaultCategoryValues);
  };

  const openEditView = (item: TCpdCategoryItem) => {
    setIsCreateViewOpen(false);
    setEditingItem(item);
    form.reset({
      title: item.title,
      category: item.category,
      isActive: item.isActive,
      requiredHours: item.requiredHours,
      description: item.description ?? "",
    });
  };

  const closeEditView = () => {
    setEditingItem(null);
    form.reset(defaultCategoryValues);
  };

  const closeCategoryFormView = () => {
    if (editingItem) {
      closeEditView();
      return;
    }
    closeCreateView();
  };

  const submitCategory = form.handleSubmit(async (values) => {
    try {
      if (editingItem) {
        await updateCategory({
          category: values.category,
          isActive: values.isActive,
          title: values.title.trim(),
          categoryId: editingItem.id,
          requiredHours: values.requiredHours,
          description: values.description?.trim() || undefined,
        }).unwrap();
        notify.success(t("organizationDashboard.cpd.messages.updated"));
        closeEditView();
        return;
      }

      await createCategory({
        title: values.title.trim(),
        category: values.category,
        isActive: values.isActive,
        requiredHours: values.requiredHours,
        description: values.description?.trim() || undefined,
      }).unwrap();
      notify.success(t("organizationDashboard.cpd.messages.created"));
      closeCreateView();
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  });

  const toggleCategoryStatus = async (item: TCpdCategoryItem) => {
    try {
      await updateCategory({
        categoryId: item.id,
        isActive: !item.isActive,
      }).unwrap();
      notify.success(t("organizationDashboard.cpd.messages.statusChanged"));
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };

  const removeCategory = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId).unwrap();
      if (editingItem?.id === categoryId) closeEditView();
      notify.success(t("organizationDashboard.cpd.messages.deleted"));
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };

  const nextPage = () => {
    const nextCursor = categoriesQuery.data?.pageInfo?.nextCursor;
    if (nextCursor) setCursorStack((prev) => [...prev, nextCursor]);
  };

  const previousPage = () => setCursorStack((prev) => prev.slice(0, -1));
  const resetPagination = () => setCursorStack([]);

  const updateSearch = (value: string) => {
    setSearch(value);
    resetPagination();
  };

  const updateStatus = (value: "ALL" | "ACTIVE" | "INACTIVE") => {
    setStatus(value);
    resetPagination();
  };

  const updateYear = (value: string) => {
    setYear(value);
    resetPagination();
  };

  return {
    t,
    form,
    year,
    search,
    status,
    nextPage,
    categories,
    editingItem,
    yearOptions,
    previousPage,
    openEditView,
    closeEditView,
    submitCategory,
    openCreateView,
    removeCategory,
    closeCreateView,
    isCreateViewOpen,
    setYear: updateYear,
    toggleCategoryStatus,
    closeCategoryFormView,
    stats: statsQuery.data,
    setStatus: updateStatus,
    setSearch: updateSearch,
    page: cursorStack.length + 1,
    canPrevious: cursorStack.length > 0,
    isEditViewOpen: Boolean(editingItem),
    totalCount: categoriesQuery.data?.totalCount ?? 0,
    hasNextPage: Boolean(categoriesQuery.data?.pageInfo?.hasNextPage),
    isLoading:
      statsQuery.isFetching ||
      createState.isLoading ||
      updateState.isLoading ||
      categoriesQuery.isFetching ||
      deleteState.isLoading,
  };
};
