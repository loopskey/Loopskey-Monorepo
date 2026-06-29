import { TDetailMetaPillProps } from "@/types/content-module.types";
import { cn } from "@/lib/utils";

const DetailMetaPill = ({
  icon,
  label,
  value,
  className,
}: TDetailMetaPillProps) => {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-glass-border bg-background/55 px-4 py-3 text-sm backdrop-blur-xl",
        className,
      )}
    >
      {icon && <div className="text-primary">{icon}</div>}
      <div>
        <p className="text-xs font-semibold text-muted-foreground">{label}</p>
        <p className="font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
};

export default DetailMetaPill;
