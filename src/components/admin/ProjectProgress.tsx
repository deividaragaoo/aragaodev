"use client";

import { updateProjectProgressAction } from "@/lib/admin/actions/projects";
import { PROJECT_PROGRESS_PRESETS } from "@/lib/admin/constants";
import { cn } from "@/lib/utils";

export function ProjectProgress({
  projectId,
  progress,
  editable = false,
}: {
  projectId?: number;
  progress: number;
  editable?: boolean;
}) {
  const value = Math.min(100, Math.max(0, progress || 0));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-muted">Andamento</span>
        <span className="font-semibold text-[#ff6b35]">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            value >= 100
              ? "bg-emerald-400"
              : value >= 50
                ? "bg-gradient-to-r from-[#ff7a18] to-[#ff3d00]"
                : "bg-[#ff6b35]"
          )}
          style={{ width: `${value}%` }}
        />
      </div>
      {editable && projectId ? (
        <div className="flex flex-wrap gap-1.5">
          {PROJECT_PROGRESS_PRESETS.map((preset) => (
            <form
              key={preset}
              action={updateProjectProgressAction.bind(null, projectId, preset)}
            >
              <button
                type="submit"
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11px] transition",
                  value === preset
                    ? "border-[#ff6b35]/50 bg-[#ff6b35]/15 text-foreground"
                    : "border-white/10 text-muted hover:border-white/20 hover:text-foreground"
                )}
              >
                {preset}%
              </button>
            </form>
          ))}
        </div>
      ) : null}
    </div>
  );
}
