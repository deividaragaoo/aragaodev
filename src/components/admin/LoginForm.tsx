"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/ui/BrandLogo";
import {
  AdminButton,
  AdminField,
  AdminInput,
} from "@/components/admin/ui";

type Step = "credentials" | "keyword";

const REMEMBER_KEY = "aragao_admin_remember_login";

type RememberedLogin = {
  username: string;
  password: string;
};

function loadRemembered(): RememberedLogin | null {
  try {
    const raw = localStorage.getItem(REMEMBER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RememberedLogin;
    if (!parsed?.username || !parsed?.password) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveRemembered(username: string, password: string) {
  localStorage.setItem(
    REMEMBER_KEY,
    JSON.stringify({ username, password } satisfies RememberedLogin)
  );
}

function clearRemembered() {
  localStorage.removeItem(REMEMBER_KEY);
}

export function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("credentials");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = loadRemembered();
    if (saved) {
      setUsername(saved.username);
      setPassword(saved.password);
      setRemember(true);
    }
    setReady(true);
  }, []);

  async function submitCredentials(
    nextUsername: string,
    nextPassword: string,
    nextRemember: boolean
  ) {
    setError(null);
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        step: "credentials",
        username: nextUsername,
        password: nextPassword,
        remember: nextRemember,
      }),
    });
    const payload = (await response.json()) as {
      ok: boolean;
      step?: Step;
      error?: string;
    };

    if (!payload.ok) {
      setError(payload.error || "Falha ao autenticar.");
      setStep("credentials");
      return;
    }

    if (nextRemember) {
      saveRemembered(nextUsername, nextPassword);
    } else {
      clearRemembered();
    }

    setStep("keyword");
  }

  async function submitKeyword(keyword: string, nextRemember: boolean) {
    setError(null);
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        step: "keyword",
        keyword,
        remember: nextRemember,
      }),
    });
    const payload = (await response.json()) as {
      ok: boolean;
      step?: string;
      error?: string;
    };

    if (!payload.ok) {
      setError(payload.error || "Falha ao validar palavra-chave.");
      if (payload.step === "credentials") setStep("credentials");
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

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
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              const nextUsername = username.trim();
              const nextPassword = password;
              const nextRemember = remember;
              startTransition(async () => {
                try {
                  await submitCredentials(
                    nextUsername,
                    nextPassword,
                    nextRemember
                  );
                } catch {
                  setError("Falha de rede ao autenticar.");
                }
              });
            }}
          >
            <AdminField label="Usuário">
              <AdminInput
                name="username"
                autoComplete="username"
                placeholder="deividaragaoo"
                required
                value={ready ? username : ""}
                onChange={(e) => setUsername(e.target.value)}
              />
            </AdminField>
            <AdminField label="Senha">
              <AdminInput
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                required
                value={ready ? password : ""}
                onChange={(e) => setPassword(e.target.value)}
              />
            </AdminField>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 accent-[#ff6b35]"
              />
              Lembrar usuário e senha neste dispositivo
            </label>
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
            <AdminButton type="submit" className="w-full" disabled={pending}>
              {pending ? "Validando..." : "Continuar"}
            </AdminButton>
          </form>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              const keyword = String(data.get("keyword") || "");
              const nextRemember = remember;
              startTransition(async () => {
                try {
                  await submitKeyword(keyword, nextRemember);
                } catch {
                  setError("Falha de rede ao validar palavra-chave.");
                }
              });
            }}
          >
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
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
            <AdminButton type="submit" className="w-full" disabled={pending}>
              {pending ? "Entrando..." : "Acessar painel"}
            </AdminButton>
            <button
              type="button"
              className="w-full text-sm text-muted hover:text-foreground"
              onClick={() => {
                setStep("credentials");
                setError(null);
              }}
            >
              Voltar
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
