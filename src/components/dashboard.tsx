"use client"

import { useMemo, useState, useTransition } from "react"
import { AlertCircle, Bell, Plus, Scale, Search } from "lucide-react"
import { toast } from "sonner"

import {
  changeStatusAction,
  createClientAction,
  deleteClientAction,
  updateClientAction,
} from "@/app/actions"
import { ClientFormDialog } from "@/components/client-form-dialog"
import { ClientsTable } from "@/components/clients-table"
import { DeleteClientDialog } from "@/components/delete-client-dialog"
import { StatsCards } from "@/components/stats-cards"
import { TelegramSettingsDialog } from "@/components/telegram-settings-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTelegramChatId } from "@/hooks/use-telegram-chat-id"
import type { ClientFormValues } from "@/lib/validations"
import {
  STATUS_LABELS,
  type Client,
  type ClientStatus,
} from "@/types/client"

type StatusFilter = "ALL" | ClientStatus

const FILTER_LABELS: Record<StatusFilter, string> = {
  ALL: "All statuses",
  ...STATUS_LABELS,
}

interface DashboardProps {
  initialClients: Client[]
  loadError: string | null
}

export function Dashboard({ initialClients, loadError }: DashboardProps) {
  const [clients, setClients] = useState<Client[]>(initialClients)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL")

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [submitting, startSubmit] = useTransition()

  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null)
  const [deleting, startDelete] = useTransition()

  const [pendingId, setPendingId] = useState<string | null>(null)

  const { chatId, setChatId } = useTelegramChatId()
  const [settingsOpen, setSettingsOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return clients.filter((client) => {
      const matchesQuery =
        q === "" ||
        client.name.toLowerCase().includes(q) ||
        client.phone.toLowerCase().includes(q)
      const matchesStatus =
        statusFilter === "ALL" || client.status === statusFilter
      return matchesQuery && matchesStatus
    })
  }, [clients, search, statusFilter])

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(client: Client) {
    setEditing(client)
    setFormOpen(true)
  }

  function handleSubmit(values: ClientFormValues) {
    return new Promise<void>((resolve) => {
      startSubmit(async () => {
        const result = editing
          ? await updateClientAction(editing.id, values)
          : await createClientAction(values, chatId)

        if (!result.ok) {
          toast.error(
            editing ? "Failed to update client" : "Failed to create client",
            { description: result.error }
          )
          resolve()
          return
        }

        if (editing) {
          setClients((prev) =>
            prev.map((c) => (c.id === result.data.id ? result.data : c))
          )
          toast.success("Client updated")
        } else {
          setClients((prev) => [result.data, ...prev])
          toast.success("Client created")
        }

        setFormOpen(false)
        setEditing(null)
        resolve()
      })
    })
  }

  function handleDelete() {
    if (!deleteTarget) return Promise.resolve()
    const target = deleteTarget
    return new Promise<void>((resolve) => {
      startDelete(async () => {
        const result = await deleteClientAction(target.id)
        if (!result.ok) {
          toast.error("Failed to delete client", { description: result.error })
          resolve()
          return
        }
        setClients((prev) => prev.filter((c) => c.id !== target.id))
        setDeleteTarget(null)
        toast.success("Client deleted")
        resolve()
      })
    })
  }

  async function handleChangeStatus(client: Client, status: ClientStatus) {
    if (client.status === status) return
    setPendingId(client.id)

    // Optimistic update.
    const previous = client.status
    setClients((prev) =>
      prev.map((c) => (c.id === client.id ? { ...c, status } : c))
    )

    const result = await changeStatusAction(client.id, status)
    setPendingId(null)

    if (!result.ok) {
      // Roll back on failure.
      setClients((prev) =>
        prev.map((c) =>
          c.id === client.id ? { ...c, status: previous } : c
        )
      )
      toast.error("Failed to change status", { description: result.error })
      return
    }

    setClients((prev) =>
      prev.map((c) => (c.id === result.data.id ? result.data : c))
    )
    toast.success(`Status set to ${STATUS_LABELS[status]}`)
  }

  const filterOptions: StatusFilter[] = ["ALL", "NEW", "IN_PROGRESS", "CLOSED"]

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
      {/* Header */}
      <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Scale className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Lexcase</h1>
            <p className="text-sm text-muted-foreground">
              Client &amp; case management
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setSettingsOpen(true)}
            title="Telegram notifications"
          >
            <Bell className="size-4" />
            <span className="hidden sm:inline">Notifications</span>
            {chatId && (
              <span
                className="ml-0.5 size-2 rounded-full bg-emerald-500"
                aria-label="Telegram configured"
              />
            )}
          </Button>
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Add client
          </Button>
        </div>
      </header>

      {loadError && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">Could not load clients</p>
            <p className="text-destructive/80">{loadError}</p>
          </div>
        </div>
      )}

      <div className="mb-6 sm:mb-8">
        <StatsCards clients={clients} />
      </div>

      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Clients</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name or phone…"
                  className="pl-8 sm:w-64"
                  aria-label="Search clients"
                />
              </div>
              <Select
                items={FILTER_LABELS}
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as StatusFilter)
                }
              >
                <SelectTrigger
                  className="w-full sm:w-40"
                  aria-label="Filter by status"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {FILTER_LABELS[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 sm:px-0">
          <ClientsTable
            clients={filtered}
            hasAnyClients={clients.length > 0}
            pendingId={pendingId}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
            onChangeStatus={handleChangeStatus}
          />
        </CardContent>
      </Card>

      <ClientFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditing(null)
        }}
        client={editing}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      <DeleteClientDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        client={deleteTarget}
        onConfirm={handleDelete}
        deleting={deleting}
      />

      <TelegramSettingsDialog
        key={settingsOpen ? "settings-open" : "settings-closed"}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        chatId={chatId}
        onSave={setChatId}
      />
    </div>
  )
}
