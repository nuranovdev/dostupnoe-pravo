import "server-only"

import { STATUS_LABELS, type Client } from "@/types/client"

/**
 * Sends a Telegram notification about a newly created client.
 *
 * If TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID are not configured, the function
 * silently skips the notification so the application keeps working. Any network
 * error is caught and logged rather than propagated to the caller.
 */
export async function notifyNewClient(client: Client): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    return
  }

  const text = [
    "🆕 *New client created*",
    "",
    `*Name:* ${escapeMarkdown(client.name)}`,
    `*Phone:* ${escapeMarkdown(client.phone)}`,
    `*Status:* ${STATUS_LABELS[client.status]}`,
  ].join("\n")

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "Markdown",
        }),
      }
    )

    if (!res.ok) {
      console.error(
        "[telegram] failed to send notification:",
        res.status,
        await res.text().catch(() => "")
      )
    }
  } catch (error) {
    console.error("[telegram] notification error:", error)
  }
}

function escapeMarkdown(value: string): string {
  return value.replace(/([_*`\[])/g, "\\$1")
}
