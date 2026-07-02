"use client";

import { signInSchema } from "@polaris/shared";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const parsed = signInSchema.safeParse({
      email: form.get("email"),
      password: form.get("password"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Revisa los datos");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword(parsed.data);
    if (authError) {
      setLoading(false);
      setError(
        authError.message === "Invalid login credentials"
          ? "Correo o contraseña incorrectos"
          : authError.message
      );
      return;
    }
    router.push("/command");
    router.refresh();
  }

  if (!isSupabaseConfigured) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Falta configurar Supabase</CardTitle>
          <CardDescription>
            Copia <code className="font-mono text-xs">.env.example</code> a{" "}
            <code className="font-mono text-xs">apps/web/.env.local</code>, llena{" "}
            <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
            <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, y
            reinicia el servidor.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inicia sesión</CardTitle>
        <CardDescription>Entra al centro de control de tu agente.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Correo</Label>
            <Input id="email" name="email" type="email" placeholder="tu@promotoria.mx" autoComplete="email" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <Button type="submit" disabled={loading} className="mt-1 w-full">
            {loading ? "Entrando…" : "Entrar"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted">
          ¿Aún no tienes cuenta?{" "}
          <Link href="/signup" className="text-accent-hover hover:underline">
            Regístrate
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
