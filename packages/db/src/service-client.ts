import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "node:path";

/** Carga .env desde la raíz del monorepo (además del cwd). */
export function loadDbEnv(): void {
  config();
  config({ path: resolve(import.meta.dirname, "../../../.env") });
}

/**
 * Cliente con service role — SOLO para scripts de servidor (seed, tests).
 * Salta RLS; jamás usarlo en código que corra en el browser.
 */
export function createServiceClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "Faltan SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en el entorno. Copia .env.example → .env y llena tus credenciales."
    );
  }
  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
