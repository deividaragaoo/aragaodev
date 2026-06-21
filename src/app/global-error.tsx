"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#050505] px-6 text-center text-white">
        <h2 className="text-xl font-semibold">Algo deu errado</h2>
        <p className="max-w-md text-sm text-white/60">
          {error.message || "Ocorreu um erro inesperado. Tente recarregar a página."}
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-full bg-[#ff5b1f] px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Tentar novamente
        </button>
      </body>
    </html>
  );
}
