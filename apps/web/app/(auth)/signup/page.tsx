"use client";

import { signUpSchema } from "@polaris/shared";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const parsed = signUpSchema.safeParse({
      organizationName: form.get("organizationName"),
      fullName: form.get("fullName"),
      email: form.get("email"),
      password: form.get("password"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Revisa los datos");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    // El trigger handle_new_user crea la organization y el usuario (role admin).
    const { data, error: authError } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: {
          organization_name: parsed.data.organizationName,
          full_name: parsed.data.fullName,
        },
      },
    });
    if (authError) {
      setLoading(false);
      setError(authError.message);
      return;
    }
    if (!data.session) {
      // Confirmación de correo habilitada en el proyecto de Supabase
      setLoading(false);
      setPendingConfirmation(true);
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
            <code className="font-mono text-xs">apps/web/.env.local</code> y llena las
            variables <code className="font-mono text-xs">NEXT_PUBLIC_*</code>.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (pendingConfirmation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revisa tu correo</CardTitle>
          <CardDescription>
            Te mandamos un enlace para confirmar tu cuenta. En cuanto lo abras podrás
            iniciar sesión.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crea tu cuenta</CardTitle>
        <CardDescription>
          Registra tu promotoría o despacho — quedas como admin de la organización.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="organizationName">Nombre de tu organización</Label>
            <Input id="organizationName" name="organizationName" placeholder="Promotoría Águila" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fullName">Tu nombre completo</Label>
            <Input id="fullName" name="fullName" placeholder="María Fernández" autoComplete="name" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Correo</Label>
            <Input id="email" name="email" type="email" placeholder="tu@promotoria.mx" autoComplete="email" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" name="password" type="password" autoComplete="new-password" placeholder="Mínimo 8 caracteres" required />
          </div>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <Button type="submit" disabled={loading} className="mt-1 w-full">
            {loading ? "Creando cuenta…" : "Crear cuenta"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-accent-hover hover:underline">
            Inicia sesión
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
