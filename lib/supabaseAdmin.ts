import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL env var.")
}

if (!serviceRoleKey) {
  throw new Error(
    "Missing SUPABASE_SERVICE_ROLE_KEY env var. Add it to .env.local. " +
    "Find it in Supabase Dashboard → Project Settings → API → service_role key."
  )
}

/**
 * Service-role Supabase client.
 * NEVER import or use this on the client side — it bypasses all RLS policies.
 * Only use in server actions (app/admin/actions.ts) and API routes (app/api/**).
 */
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
