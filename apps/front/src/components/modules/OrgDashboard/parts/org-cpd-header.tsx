"use client";

import { TCPDHeader } from "@/types/org-dashboard.types";
import { Button } from "@ui/button";

import * as S from "@ui/select";
import * as L from "lucide-react";

export const OrgCpdCategoryHeader = ({ hook }: TCPDHeader) => {
  const { t, year, setYear, yearOptions, openCreateView } = hook;
  return (
    <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
      <div>
        <p className="text-sm font-medium text-primary">
          {t("organizationDashboard.cpd.eyebrow")}
        </p>
        <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
          {t("organizationDashboard.cpd.title")}
        </h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          {t("organizationDashboard.cpd.description")}
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <S.Select value={year} onValueChange={setYear}>
          <S.SelectTrigger className="h-11 min-w-36 rounded-2xl bg-background/70">
            <S.SelectValue />
          </S.SelectTrigger>
          <S.SelectContent>
            {yearOptions.map((item) => (
              <S.SelectItem key={item.value} value={item.value}>
                {item.label}
              </S.SelectItem>
            ))}
          </S.SelectContent>
        </S.Select>
        <Button radius="xl" variant="brand" onClick={openCreateView}>
          <L.Plus className="h-4 w-4" />
          {t("organizationDashboard.cpd.actions.addCategory")}
        </Button>
      </div>
    </section>
  );
};
