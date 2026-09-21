import { TDetailSummaryProps } from "@/types/content-module.types";

const DetailSummary = ({ items }: TDetailSummaryProps) => (
  <div className="space-y-3">
    {items.map((item) => (
      <div key={item.key}>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {item.label}
        </p>
        <p className="mt-0.5 text-xl font-medium text-foreground">
          {item.value}
        </p>
        {item.hint && (
          <p className="text-sm text-muted-foreground">{item.hint}</p>
        )}
      </div>
    ))}
  </div>
);

export default DetailSummary;
