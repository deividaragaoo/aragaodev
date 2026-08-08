"use client";

import { useActionState } from "react";
import {
  loginWithCredentials,
  loginWithKeyword,
  type AuthActionState,
} from "@/lib/auth/actions";
import { BrandLogo } from "@/components/ui/BrandLogo";

const initialState: AuthActionState = {
  ok: false,
  step: "password",
};

export function LoginForm() {
  const [credentialState, credentialAction, credentialPending] = useActionState(
    loginWithCredentials,
    initialState,
  );
  const [keywordState, keywordAction, keywordPending] = useActionState(
    loginWithKeyword,
    {
      ok: false,
      step: "keyword",
    } satisfies AuthActionState,
  );
  const showKeyword = credentialState.step === "keyword";
  const message = showKeyword ? keywordState.message ?? credentialState.message : credentialState.message;

  return (
    <div className="min-h-screen bg-[#050505] px-4 py-10 text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(255,59,59,0.22),transparent_30%),radial-gradient(circle_at_80%_90%,rgba(255,107,53,0.18),transparent_30%)]" />
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md flex-col justify-center">
        <div className="mb-8 text-center">
          <BrandLogo className="justify-center" size="lg" />
          <p className="mt-4 text-sm text-zinc-400">
            Painel ERP privado Aragao Dev
          </p>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
          {!showKeyword ? (
            <form action={credentialAction} className="grid gap-4">
              <label className="grid gap-2 text-sm text-zinc-300">
                Usuario
                <input
                  className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none ring-orange-500/30 transition placeholder:text-zinc-600 focus:border-orange-400 focus:ring-4"
                  name="username"
                  placeholder="deividaragaoo"
                  defaultValue={credentialState.username}
                  autoComplete="username"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm text-zinc-300">
                Senha
                <input
                  className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none ring-orange-500/30 transition placeholder:text-zinc-600 focus:border-orange-400 focus:ring-4"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </label>
              {message ? (
                <p className="rounded-2xl border border-orange-400/20 bg-orange-400/10 px-4 py-3 text-sm text-orange-100">
                  {message}
                </p>
              ) : null}
              <button
                className="rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20"
                disabled={credentialPending}
                type="submit"
              >
                {credentialPending ? "Verificando..." : "Continuar"}
              </button>
            </form>
          ) : (
            <form action={keywordAction} className="grid gap-4">
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                Senha validada para {credentialState.username}. Informe a
                palavra-chave.
              </div>
              <label className="grid gap-2 text-sm text-zinc-300">
                Palavra-chave
                <input
                  className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none ring-orange-500/30 transition placeholder:text-zinc-600 focus:border-orange-400 focus:ring-4"
                  name="keyword"
                  type="password"
                  autoComplete="one-time-code"
                  required
                />
              </label>
              {message ? (
                <p className="rounded-2xl border border-orange-400/20 bg-orange-400/10 px-4 py-3 text-sm text-orange-100">
                  {message}
                </p>
              ) : null}
              <button
                className="rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20"
                disabled={keywordPending}
                type="submit"
              >
                {keywordPending ? "Entrando..." : "Acessar painel"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
