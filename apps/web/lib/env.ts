export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * Fase 0: si Supabase no está configurado, la app levanta igual y muestra
 * instrucciones de setup en lugar de tronar.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
