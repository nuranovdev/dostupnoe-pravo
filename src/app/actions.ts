"use server"

import { createServerClient } from "@/lib/supabase/server"
import { notifyNewClient } from "@/lib/telegram"
import { clientSchema } from "@/lib/validations"
import {
  CLIENT_STATUSES,
  type Client,
  type ClientStatus,
} from "@/types/client"

const TABLE = "clients"

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string }

/**
 * Create a new client, then fire a (best-effort) Telegram notification.
 */
export async function createClientAction(
  input: unknown
): Promise<ActionResult<Client>> {
  const parsed = clientSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" }
  }

  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from(TABLE)
      .insert(parsed.data)
      .select()
      .single()

    if (error) return { ok: false, error: error.message }

    const client = data as Client
    await notifyNewClient(client)

    return { ok: true, data: client }
  } catch (error) {
    return { ok: false, error: toMessage(error) }
  }
}

/**
 * Update an existing client's name, phone and status.
 */
export async function updateClientAction(
  id: string,
  input: unknown
): Promise<ActionResult<Client>> {
  if (!id) return { ok: false, error: "Missing client id" }

  const parsed = clientSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" }
  }

  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from(TABLE)
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) return { ok: false, error: error.message }
    return { ok: true, data: data as Client }
  } catch (error) {
    return { ok: false, error: toMessage(error) }
  }
}

/**
 * Quickly change a single client's status (used from the table row).
 */
export async function changeStatusAction(
  id: string,
  status: ClientStatus
): Promise<ActionResult<Client>> {
  if (!id) return { ok: false, error: "Missing client id" }
  if (!CLIENT_STATUSES.includes(status)) {
    return { ok: false, error: "Invalid status" }
  }

  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from(TABLE)
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) return { ok: false, error: error.message }
    return { ok: true, data: data as Client }
  } catch (error) {
    return { ok: false, error: toMessage(error) }
  }
}

/**
 * Delete a client by id.
 */
export async function deleteClientAction(
  id: string
): Promise<ActionResult<{ id: string }>> {
  if (!id) return { ok: false, error: "Missing client id" }

  try {
    const supabase = createServerClient()
    const { error } = await supabase.from(TABLE).delete().eq("id", id)

    if (error) return { ok: false, error: error.message }
    return { ok: true, data: { id } }
  } catch (error) {
    return { ok: false, error: toMessage(error) }
  }
}

function toMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return "Something went wrong"
}
