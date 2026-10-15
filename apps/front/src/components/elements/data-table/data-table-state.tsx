import { cn } from "@/lib/utils";

import type { DataTableState as State } from "@/types/data-table.types";

type DataTableStateProps = {
  state: State;
  isError?: boolean;
};

export const DataTableStatePanel = ({
  state,
  isError,
}: DataTableStateProps) => {
  const Icon = state.icon;

  return (
    <div
      role={isError ? "alert" : undefined}
      className="flex flex-col items-center px-6 py-12 text-center max-md:rounded-lg max-md:border"
    >
      {Icon ? (
        <span
          aria-hidden
          className={cn(
            "mb-4 grid size-12 place-items-center rounded-full",
            isError
              ? "bg-destructive/10 text-destructive"
              : "bg-accent text-primary",
          )}
        >
          <Icon className="size-5" />
        </span>
      ) : null}

      <p className="font-medium text-foreground">{state.title}</p>

      {state.description ? (
        <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
          {state.description}
        </p>
      ) : null}

      {state.action ? (
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {state.action}
        </div>
      ) : null}
    </div>
  );
};
