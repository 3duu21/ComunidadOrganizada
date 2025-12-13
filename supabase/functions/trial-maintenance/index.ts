import { serve } from "https://deno.land/std@0.224.0/http/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (_req) => {
  const projectUrl = Deno.env.get("PROJECT_URL");
  const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY");

  if (!projectUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: "Missing env vars" }), { status: 500 });
  }

  const supabase = createClient(projectUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { error: err1 } = await supabase.rpc("disable_expired_trials");
  if (err1) return new Response(JSON.stringify({ error: err1.message }), { status: 500 });

  const { error: err2 } = await supabase.rpc("delete_old_trials");
  if (err2) return new Response(JSON.stringify({ error: err2.message }), { status: 500 });

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
});
