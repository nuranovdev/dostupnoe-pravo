import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let browserClient: SupabaseClient | undefined

/**
 * Browser-side Supabase client (singleton). Uses the public anon key, which is
 * safe to expose. Reads are performed directly from the client; writes go
 * through server actions so the Telegram bot token stays server-only.
 */
export function getBrowserClient(): SupabaseClient {
  if (browserClient) return browserClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    )
  }

  browserClient = createClient(url, key)
  return browserClient
}
