export const CLIENT_STATUSES = ["NEW", "IN_PROGRESS", "CLOSED"] as const

export type ClientStatus = (typeof CLIENT_STATUSES)[number]

export interface Client {
  id: string
  created_at: string
  updated_at: string
  name: string
  phone: string
  status: ClientStatus
}

export const STATUS_LABELS: Record<ClientStatus, string> = {
  NEW: "New",
  IN_PROGRESS: "In Progress",
  CLOSED: "Closed",
}

/**
 * Ordered pipeline used by the "quick change status" action in the table.
 * Advancing a client moves it to the next stage, wrapping back to NEW.
 */
export const STATUS_PIPELINE: ClientStatus[] = ["NEW", "IN_PROGRESS", "CLOSED"]

export function nextStatus(current: ClientStatus): ClientStatus {
  const index = STATUS_PIPELINE.indexOf(current)
  return STATUS_PIPELINE[(index + 1) % STATUS_PIPELINE.length]
}
