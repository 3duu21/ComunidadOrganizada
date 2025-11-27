import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://TU_PROJECT_ID.supabase.co",
  "TU_PUBLIC_ANON_KEY"
);