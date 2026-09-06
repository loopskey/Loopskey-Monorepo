"use client";

export type TReportSummaryItem = {
  id: string;
  label: string;
  value: string;
};

export const AssociationReportSummaryStrip = ({
  items,
}: {
  items: TReportSummaryItem[];
}) => (
  <dl className="grid gap-4 rounded-3xl border border-glass-border bg-background/50 p-5 sm:grid-cols-2 xl:grid-cols-4">
    {items.map((item) => (
      <div key={item.id}>
        <dt className="text-xs uppercase text-muted-foreground">
          {item.label}
        </dt>

        <dd className="mt-1 text-xl font-medium tabular-nums">{item.value}</dd>
      </div>
    ))}
  </dl>
);
