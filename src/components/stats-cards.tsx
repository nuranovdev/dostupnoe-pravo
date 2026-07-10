import { CheckCircle2, Clock, UserPlus, Users } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Client } from "@/types/client"

interface StatsCardsProps {
  clients: Client[]
}

export function StatsCards({ clients }: StatsCardsProps) {
  const total = clients.length
  const newCount = clients.filter((c) => c.status === "NEW").length
  const inProgress = clients.filter((c) => c.status === "IN_PROGRESS").length
  const closed = clients.filter((c) => c.status === "CLOSED").length

  const cards = [
    {
      label: "Total clients",
      value: total,
      icon: Users,
      accent: "text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300",
    },
    {
      label: "New clients",
      value: newCount,
      icon: UserPlus,
      accent: "text-blue-600 bg-blue-100 dark:bg-blue-950 dark:text-blue-300",
    },
    {
      label: "In progress",
      value: inProgress,
      icon: Clock,
      accent: "text-amber-600 bg-amber-100 dark:bg-amber-950 dark:text-amber-300",
    },
    {
      label: "Closed",
      value: closed,
      icon: CheckCircle2,
      accent:
        "text-emerald-600 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="flex items-center gap-4">
            <div
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-lg",
                card.accent
              )}
            >
              <card.icon className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="text-2xl font-semibold tabular-nums">
                {card.value}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
