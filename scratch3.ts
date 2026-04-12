import { createClient } from "@supabase/supabase-js"
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321", process.env.SUPABASE_SERVICE_ROLE_KEY || "dummy")
async function run() {
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'signup',
    email: 'test@example.com',
  } as any)
  console.log(data, error)
}
run()
