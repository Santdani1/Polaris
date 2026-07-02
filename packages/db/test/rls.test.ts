/**
 * Test de RLS multi-tenant (criterio de done de Fase 0):
 * un usuario de otra organización NO puede leer datos de la org demo.
 *
 * Corre contra una instancia real de Supabase (local o remota) con las
 * migrations aplicadas. Si faltan las env vars, se salta con aviso.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { loadDbEnv } from "../src/service-client";

loadDbEnv();

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const hasEnv = Boolean(url && anonKey && serviceKey);

if (!hasEnv) {
  console.warn(
    "[rls.test] Saltando: define SUPABASE_URL, SUPABASE_ANON_KEY y SUPABASE_SERVICE_ROLE_KEY para correr el test de RLS."
  );
}

describe.skipIf(!hasEnv)("RLS multi-tenant por organization_id", () => {
  let admin: SupabaseClient;
  let orgAId: string;
  let orgBId: string;
  let userAId: string;
  let userBId: string;
  let leadAId: string;
  /** Cliente autenticado como el usuario de la org B (intruso). */
  let asUserB: SupabaseClient;

  const suffix = randomUUID().slice(0, 8);
  const userAEmail = `rls-test-a-${suffix}@example.com`;
  const userBEmail = `rls-test-b-${suffix}@example.com`;
  const password = `Rls-test-${suffix}!`;

  beforeAll(async () => {
    admin = createClient(url!, serviceKey!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Dos organizaciones aisladas
    const { data: orgs, error: orgError } = await admin
      .from("organizations")
      .insert([
        { name: `RLS Test Org A ${suffix}` },
        { name: `RLS Test Org B ${suffix}` },
      ])
      .select("id, name");
    if (orgError) throw orgError;
    orgAId = orgs!.find((o) => o.name.includes("Org A"))!.id;
    orgBId = orgs!.find((o) => o.name.includes("Org B"))!.id;

    // Un usuario en cada org (el trigger handle_new_user crea public.users)
    const { data: userA, error: userAError } = await admin.auth.admin.createUser({
      email: userAEmail,
      password,
      email_confirm: true,
      user_metadata: { organization_id: orgAId, role: "admin", full_name: "Usuario A" },
    });
    if (userAError) throw userAError;
    userAId = userA.user!.id;

    const { data: userB, error: userBError } = await admin.auth.admin.createUser({
      email: userBEmail,
      password,
      email_confirm: true,
      user_metadata: { organization_id: orgBId, role: "admin", full_name: "Usuario B" },
    });
    if (userBError) throw userBError;
    userBId = userB.user!.id;

    // Datos sensibles en la org A
    const { data: lead, error: leadError } = await admin
      .from("leads")
      .insert({
        organization_id: orgAId,
        name: `Lead Secreto Org A ${suffix}`,
        status: "QUALIFIED",
        source: "manual",
      })
      .select("id")
      .single();
    if (leadError) throw leadError;
    leadAId = lead!.id;

    await admin.from("agent_actions").insert({
      organization_id: orgAId,
      subagent: "hunter",
      action: "lead_scraped",
      lead_id: leadAId,
      payload: { summary: "dato confidencial de la org A" },
    });

    // Sesión real del usuario B (org B) con el anon key → RLS aplica
    asUserB = createClient(url!, anonKey!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { error: signInError } = await asUserB.auth.signInWithPassword({
      email: userBEmail,
      password,
    });
    if (signInError) throw signInError;
  }, 30_000);

  afterAll(async () => {
    if (!admin) return;
    if (userAId) await admin.auth.admin.deleteUser(userAId);
    if (userBId) await admin.auth.admin.deleteUser(userBId);
    // Cascada: borra users/leads/agent_actions de las orgs de prueba
    if (orgAId) await admin.from("organizations").delete().eq("id", orgAId);
    if (orgBId) await admin.from("organizations").delete().eq("id", orgBId);
  }, 30_000);

  it("no puede leer los leads de otra organización", async () => {
    const { data, error } = await asUserB.from("leads").select("id, name");
    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data!.map((l) => l.id)).not.toContain(leadAId);
    expect(data!.length).toBe(0); // la org B no tiene leads propios
  });

  it("no puede leer un lead ajeno ni por id directo", async () => {
    const { data } = await asUserB.from("leads").select("*").eq("id", leadAId);
    expect(data ?? []).toHaveLength(0);
  });

  it("no puede leer el audit log (agent_actions) de otra organización", async () => {
    const { data } = await asUserB.from("agent_actions").select("id, payload");
    expect(data ?? []).toHaveLength(0);
  });

  it("solo ve su propia organización", async () => {
    const { data } = await asUserB.from("organizations").select("id");
    expect((data ?? []).map((o) => o.id)).toEqual([orgBId]);
  });

  it("no ve usuarios de otra organización", async () => {
    const { data } = await asUserB.from("users").select("id");
    const ids = (data ?? []).map((u) => u.id);
    expect(ids).not.toContain(userAId);
    expect(ids).toContain(userBId);
  });

  it("no puede insertar datos en otra organización", async () => {
    const { error } = await asUserB.from("leads").insert({
      organization_id: orgAId,
      name: "Intruso",
      source: "manual",
    });
    expect(error).not.toBeNull(); // viola el WITH CHECK de la policy
  });

  it("sí puede leer y escribir en su propia organización", async () => {
    const { data: inserted, error: insertError } = await asUserB
      .from("leads")
      .insert({ organization_id: orgBId, name: `Lead propio ${suffix}`, source: "manual" })
      .select("id")
      .single();
    expect(insertError).toBeNull();
    expect(inserted).not.toBeNull();

    const { data } = await asUserB.from("leads").select("id");
    expect((data ?? []).map((l) => l.id)).toContain(inserted!.id);
  });
});
