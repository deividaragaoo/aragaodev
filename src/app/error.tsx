"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h2 className="text-xl font-semibold">Algo deu errado</h2>
      <p className="max-w-md text-sm text-white/60">
        {error.message || "Ocorreu um erro inesperado."}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-full border border-white/10 bg-white/[0.03] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:border-[#ff5b1f]/40"
      >
        Tentar novamente
      </button>
    </div>
  );
}
