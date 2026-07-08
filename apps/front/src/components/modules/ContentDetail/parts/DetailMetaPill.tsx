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
    <div className={cn("flex items-center gap-3", className)}>
      {icon && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="truncate font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
};

export default DetailMetaPill;
