import { createClient as createSupabaseClient } from '@supabase/supabase-js'

let client: ReturnType<typeof createSupabaseClient> | null = null

export function createClient() {
  if (typeof window === 'undefined') {
    throw new Error('createClient can only be called on the client side')
  }

  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
      throw new Error('Supabase credentials not configured. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.')
    }

    client = createSupabaseClient(url, key)
  }

  return client
}
