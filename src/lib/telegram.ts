import "server-only"

import { STATUS_LABELS, type Client } from "@/types/client"

export interface TelegramResult {
  ok: boolean
  error?: string
}

/**
 * Low-level Telegram sender. Returns a structured result instead of throwing so
 * callers can decide whether to surface or swallow failures.
 *
 * The bot token is always read from the server environment (secret). The chat id
 * is passed in by the caller — it may come from a per-user setting or from the
 * TELEGRAM_CHAT_ID fallback.
 */
export async function sendTelegramMessage(
  chatId: string,
  text: string
): Promise<TelegramResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN

  if (!token) {
    return { ok: false, error: "Bot token is not configured on the server." }
  }
  if (!chatId?.trim()) {
    return { ok: false, error: "No chat id provided." }
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId.trim(),
        text,
        parse_mode: "Markdown",
      }),
    })

    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as
        | { description?: string }
        | null
      return {
        ok: false,
        error: body?.description ?? `Telegram API error (${res.status})`,
      }
    }

    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Network error",
    }
  }
}

/**
 * Best-effort notification about a newly created client.
 *
 * Uses the caller-provided chat id when present, otherwise falls back to the
 * TELEGRAM_CHAT_ID environment variable. Missing configuration or send failures
 * never break client creation — they are only logged.
 */
export async function notifyNewClient(
  client: Client,
  overrideChatId?: string
): Promise<void> {
  const chatId = overrideChatId?.trim() || process.env.TELEGRAM_CHAT_ID || ""
  if (!chatId) return

  const result = await sendTelegramMessage(chatId, buildNewClientMessage(client))
  if (!result.ok) {
    console.error("[telegram] notification skipped/failed:", result.error)
  }
}

export function buildNewClientMessage(client: Client): string {
  return [
    "🆕 *New client created*",
    "",
    `*Name:* ${escapeMarkdown(client.name)}`,
    `*Phone:* ${escapeMarkdown(client.phone)}`,
    `*Status:* ${STATUS_LABELS[client.status]}`,
  ].join("\n")
}

function escapeMarkdown(value: string): string {
  return value.replace(/([_*`[])/g, "\\$1")
}
