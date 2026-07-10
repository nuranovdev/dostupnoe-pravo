"use client"

import { MoreHorizontal, Pencil, Trash2, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusBadge } from "@/components/status-badge"
import {
  CLIENT_STATUSES,
  STATUS_LABELS,
  nextStatus,
  type Client,
  type ClientStatus,
} from "@/types/client"

interface ClientsTableProps {
  clients: Client[]
  loading?: boolean
  hasAnyClients: boolean
  pendingId: string | null
  onEdit: (client: Client) => void
  onDelete: (client: Client) => void
  onChangeStatus: (client: Client, status: ClientStatus) => void
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
})

export function ClientsTable({
  clients,
  loading,
  hasAnyClients,
  pendingId,
  onEdit,
  onDelete,
  onChangeStatus,
}: ClientsTableProps) {
  if (loading) {
    return <TableSkeleton />
  }

  if (clients.length === 0) {
    return (
      <EmptyState
        title={hasAnyClients ? "No matching clients" : "No clients yet"}
        description={
          hasAnyClients
            ? "Try adjusting your search or status filter."
            : "Add your first client to start tracking cases."
        }
      />
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => {
            const isPending = pendingId === client.id
            return (
              <TableRow
                key={client.id}
                data-pending={isPending}
                className="data-[pending=true]:opacity-60"
              >
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell className="whitespace-nowrap tabular-nums text-muted-foreground">
                  {client.phone}
                </TableCell>
                <TableCell>
                  <button
                    type="button"
                    disabled={isPending}
                    title="Click to advance status"
                    onClick={() =>
                      onChangeStatus(client, nextStatus(client.status))
                    }
                    className="rounded-full outline-none transition hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed"
                  >
                    <StatusBadge status={client.status} />
                  </button>
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {dateFormatter.format(new Date(client.created_at))}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isPending}
                          aria-label={`Actions for ${client.name}`}
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onClick={() => onEdit(client)}>
                        <Pencil className="size-4" />
                        Edit client
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Change status</DropdownMenuLabel>
                        <DropdownMenuRadioGroup
                          value={client.status}
                          onValueChange={(value) =>
                            onChangeStatus(client, value as ClientStatus)
                          }
                        >
                          {CLIENT_STATUSES.map((status) => (
                            <DropdownMenuRadioItem key={status} value={status}>
                              {STATUS_LABELS[status]}
                            </DropdownMenuRadioItem>
                          ))}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => onDelete(client)}
                      >
                        <Trash2 className="size-4" />
                        Delete client
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-3 p-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-5 flex-1" />
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      ))}
    </div>
  )
}

function EmptyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Users className="size-6 text-muted-foreground" />
      </div>
      <h3 className="text-base font-medium">{title}</h3>
      <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
