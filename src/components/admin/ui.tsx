import { cn } from "@/lib/utils";

export function AdminInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-foreground outline-none transition placeholder:text-white/25 focus:border-[#ff6b35]/50 focus:bg-white/[0.04]",
        className
      )}
      {...props}
    />
  );
}

export function AdminTextarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-foreground outline-none transition placeholder:text-white/25 focus:border-[#ff6b35]/50 focus:bg-white/[0.04] min-h-[96px] resize-y",
        className
      )}
      {...props}
    />
  );
}

export function AdminSelect({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-xl border border-white/10 bg-[#0a0a0a] px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-[#ff6b35]/50",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function AdminLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "mb-1.5 block text-[11px] font-mono uppercase tracking-[0.14em] text-muted",
        className
      )}
    >
      {children}
    </label>
  );
}

export function AdminField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <AdminLabel>{label}</AdminLabel>
      {children}
    </div>
  );
}

export function AdminButton({
  children,
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
}) {
  const variants = {
    primary:
      "bg-gradient-to-r from-[#ff7a18] to-[#ff3d00] text-white hover:brightness-110",
    secondary:
      "border border-white/10 bg-white/[0.03] text-foreground hover:border-white/20 hover:bg-white/[0.05]",
    danger:
      "border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/15",
    ghost: "text-muted hover:text-foreground",
  };

  return (
    <button
      className={cn(
        "inline-flex min-h-[42px] items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function AdminCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-5",
        className
      )}
    >
      {children}
    </div>
  );
}

export function AdminStat({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const tones = {
    default: "text-foreground",
    success: "text-emerald-400",
    warning: "text-amber-400",
    danger: "text-red-400",
  };

  return (
    <AdminCard>
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
        {label}
      </p>
      <p className={cn("mt-2 text-xl font-semibold tracking-tight sm:text-2xl", tones[tone])}>
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </AdminCard>
  );
}

export function StatusBadge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}) {
  const tones = {
    neutral: "border-white/10 bg-white/[0.04] text-white/70",
    success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
    warning: "border-amber-500/20 bg-amber-500/10 text-amber-300",
    danger: "border-red-500/20 bg-red-500/10 text-red-300",
    info: "border-sky-500/20 bg-sky-500/10 text-sky-300",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        tones[tone]
      )}
    >
      {label}
    </span>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 px-6 py-12 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description ? (
        <p className="mt-2 text-sm text-muted">{description}</p>
      ) : null}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm text-muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
