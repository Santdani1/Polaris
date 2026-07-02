import { createBrowserClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "@/lib/env";

/** Cliente de Supabase para client components (auth, forms). */
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
