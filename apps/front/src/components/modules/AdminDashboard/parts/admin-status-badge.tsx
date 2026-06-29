import { Badge } from "@ui/badge";

export const StatusBadge = ({ status }: { status: string }) => {
  const variant =
    status === "APPROVED"
      ? "default"
      : status === "REJECTED"
        ? "destructive"
        : "secondary";

  return (
    <Badge variant={variant} className="rounded-full">
      {status}
    </Badge>
  );
};
