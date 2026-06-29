import { useMemo } from "react";

export const MonthlyPduChart = ({
  activities,
}: {
  activities: Array<{ date: string | Date; pdus: number }>;
}) => {
  const monthly = useMemo(() => {
    const values = Array.from({ length: 12 }, (_, index) => ({
      month: new Date(2026, index, 1).toLocaleString(undefined, {
        month: "short",
      }),
      value: 0,
    }));
    activities.forEach((activity) => {
      const month = new Date(activity.date).getMonth();
      values[month].value += Number(activity.pdus ?? 0);
    });
    const max = Math.max(...values.map((item) => item.value), 1);
    return values.map((item) => ({
      ...item,
      height: Math.max((item.value / max) * 100, item.value > 0 ? 8 : 2),
    }));
  }, [activities]);

  return (
    <div className="flex h-72 items-end gap-2 rounded-[2rem] border border-glass-border bg-background/40 p-5">
      {monthly.map((item) => (
        <div
          key={item.month}
          className="flex h-full flex-1 flex-col justify-end"
        >
          <div className="flex flex-1 items-end">
            <div
              style={{ height: `${item.height}%` }}
              className="w-full rounded-t-2xl bg-primary/70 transition-all"
              title={`${item.month}: ${item.value.toFixed(1)}`}
            />
          </div>
          <p className="mt-3 text-center text-[10px] font-medium text-muted-foreground">
            {item.month}
          </p>
        </div>
      ))}
    </div>
  );
};
