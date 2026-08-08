"use client";

import { updateProjectPaidAction } from "@/lib/admin/actions/projects";
import { formatCurrency } from "@/lib/admin/format";
import { cn } from "@/lib/utils";

function clampMoney(value: number) {
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.round(value * 100) / 100;
}

export function ProjectProgress({
  projectId,
  value = 0,
  amountPaid = 0,
  editable = false,
}: {
  projectId?: number;
  value?: number;
  amountPaid?: number;
  editable?: boolean;
  /** @deprecated kept for older call sites; ignored when amountPaid/value exist */
  progress?: number;
}) {
  const total = clampMoney(value);
  const paid = clampMoney(Math.min(amountPaid, total || amountPaid));
  const remaining = clampMoney(Math.max(0, total - paid));
  const percent =
    total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : paid > 0 ? 100 : 0;

  const presets =
    total > 0
      ? [0, 0.25, 0.5, 0.75, 1].map((ratio) => clampMoney(total * ratio))
      : [0];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-muted">Pagamento</span>
        <span className="font-semibold text-[#ff6b35]">{percent}%</span>
      </div>
      <div className="grid gap-1 text-xs sm:grid-cols-2">
        <p>
          <span className="text-muted">Já pago: </span>
          <span className="font-medium text-emerald-400">
            {formatCurrency(paid)}
          </span>
        </p>
        <p>
          <span className="text-muted">Falta: </span>
          <span className="font-medium text-amber-400">
            {formatCurrency(remaining)}
          </span>
        </p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            percent >= 100
              ? "bg-emerald-400"
              : percent >= 50
                ? "bg-gradient-to-r from-[#ff7a18] to-[#ff3d00]"
                : "bg-[#ff6b35]"
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      {editable && projectId && total > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {presets.map((preset) => (
            <form
              key={preset}
              action={updateProjectPaidAction.bind(null, projectId, preset)}
            >
              <button
                type="submit"
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11px] transition",
                  paid === preset
                    ? "border-[#ff6b35]/50 bg-[#ff6b35]/15 text-foreground"
                    : "border-white/10 text-muted hover:border-white/20 hover:text-foreground"
                )}
              >
                {formatCurrency(preset)}
              </button>
            </form>
          ))}
        </div>
      ) : null}
    </div>
  );
}
