import { Dashboard } from "@/components/dashboard"
import { createServerClient } from "@/lib/supabase/server"
import type { Client } from "@/types/client"

// Always render fresh data from the database.
export const dynamic = "force-dynamic"

async function getClients(): Promise<{ clients: Client[]; error: string | null }> {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) return { clients: [], error: error.message }
    return { clients: (data as Client[]) ?? [], error: null }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load clients"
    return { clients: [], error: message }
  }
}

export default async function Home() {
  const { clients, error } = await getClients()

  return <Dashboard initialClients={clients} loadError={error} />
}
