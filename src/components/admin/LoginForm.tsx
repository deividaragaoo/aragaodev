"use client";

import { useActionState } from "react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import {
  AdminButton,
  AdminField,
  AdminInput,
} from "@/components/admin/ui";
import {
  loginWithCredentials,
  loginWithKeyword,
  type AuthState,
} from "@/lib/auth/actions";

const initial: AuthState = { ok: false, step: "credentials" };

export function LoginForm() {
  const [credState, credAction, credPending] = useActionState(
    loginWithCredentials,
    initial
  );
  const [keyState, keyAction, keyPending] = useActionState(
    loginWithKeyword,
    initial
  );

  const step =
    keyState.step === "credentials"
      ? "credentials"
      : credState.step === "keyword" || keyState.step === "keyword"
        ? "keyword"
        : "credentials";

  const error =
    step === "keyword" ? keyState.error || credState.error : credState.error;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(255,107,53,0.16),transparent_55%),radial-gradient(ellipse_40%_30%_at_80%_80%,rgba(255,59,59,0.08),transparent_50%)]" />

      <div className="relative w-full max-w-md rounded-3xl border border-white/[0.08] bg-[#0a0a0a]/90 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-8">
        <div className="mb-8 text-center">
          <BrandLogo className="mx-auto h-10 w-auto" />
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[#ff6b35]">
            Área restrita
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Painel Aragão Dev
          </h1>
          <p className="mt-2 text-sm text-muted">
            {step === "credentials"
              ? "Entre com usuário e senha."
              : "Confirme a palavra-chave de segurança."}
          </p>
        </div>

        {step === "credentials" ? (
          <form action={credAction} className="space-y-4">
            <AdminField label="Usuário">
              <AdminInput
                name="username"
                autoComplete="username"
                placeholder="admin"
                required
              />
            </AdminField>
            <AdminField label="Senha">
              <AdminInput
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                required
              />
            </AdminField>
            {error ? (
              <p className="text-sm text-red-400">{error}</p>
            ) : null}
            <AdminButton type="submit" className="w-full" disabled={credPending}>
              {credPending ? "Validando..." : "Continuar"}
            </AdminButton>
          </form>
        ) : (
          <form action={keyAction} className="space-y-4">
            <AdminField label="Palavra-chave">
              <AdminInput
                name="keyword"
                type="password"
                autoComplete="off"
                placeholder="••••••••"
                required
                autoFocus
              />
            </AdminField>
            {error ? (
              <p className="text-sm text-red-400">{error}</p>
            ) : null}
            <AdminButton type="submit" className="w-full" disabled={keyPending}>
              {keyPending ? "Entrando..." : "Acessar painel"}
            </AdminButton>
          </form>
        )}
      </div>
    </div>
  );
}
