import "server-only"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

/**
 * Server-side Supabase client.
 *
 * Prefers the service-role key when available (used inside trusted server
 * actions so mutations work regardless of RLS configuration). Falls back to the
 * public anon key when a service-role key is not provided.
 */
export function createServerClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    )
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
