import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { STATUS_LABELS, type ClientStatus } from "@/types/client"

const STATUS_STYLES: Record<ClientStatus, string> = {
  NEW: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300",
  IN_PROGRESS:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
  CLOSED:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
}

export function StatusBadge({
  status,
  className,
}: {
  status: ClientStatus
  className?: string
}) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", STATUS_STYLES[status], className)}
    >
      <span
        className={cn("mr-1.5 size-1.5 rounded-full", {
          "bg-blue-500": status === "NEW",
          "bg-amber-500": status === "IN_PROGRESS",
          "bg-emerald-500": status === "CLOSED",
        })}
        aria-hidden
      />
      {STATUS_LABELS[status]}
    </Badge>
  )
}
