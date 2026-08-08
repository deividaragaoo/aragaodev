import Link from "next/link";
import { cn } from "@/lib/utils";
import { STATUS_BADGE_CLASS } from "@/lib/admin/constants";

export function AdminCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/20",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-orange-300">
          ERP privado
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function AdminButton({
  children,
  href,
  className,
  variant = "primary",
  type,
}: {
  children: React.ReactNode;
  href?: string;
  className?: string;
  variant?: "primary" | "secondary" | "danger";
  type?: "button" | "submit";
}) {
  const classes = cn(
    "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition",
    variant === "primary" &&
      "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-orange-500/20 hover:scale-[1.01]",
    variant === "secondary" &&
      "border border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10",
    variant === "danger" &&
      "border border-red-400/30 bg-red-500/10 text-red-100 hover:bg-red-500/20",
    className,
  );

  if (href) {
    return (
      <Link className={classes} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} type={type ?? "submit"}>
      {children}
    </button>
  );
}

export function StatusBadge({
  status,
  label,
}: {
  status: string;
  label: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-xs font-medium",
        STATUS_BADGE_CLASS[status] ??
          "border-white/10 bg-white/5 text-zinc-300",
      )}
    >
      {label}
    </span>
  );
}

export function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2 text-sm text-zinc-300">
      <span>{label}</span>
      <input
        className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none ring-orange-500/40 transition placeholder:text-zinc-600 focus:border-orange-400 focus:ring-4"
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        required={required}
        placeholder={placeholder}
      />
    </label>
  );
}

export function TextArea({
  label,
  name,
  defaultValue,
  rows = 4,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  rows?: number;
}) {
  return (
    <label className="grid gap-2 text-sm text-zinc-300">
      <span>{label}</span>
      <textarea
        className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none ring-orange-500/40 transition placeholder:text-zinc-600 focus:border-orange-400 focus:ring-4"
        name={name}
        defaultValue={defaultValue ?? ""}
        rows={rows}
      />
    </label>
  );
}

export function SelectField({
  label,
  name,
  defaultValue,
  children,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm text-zinc-300">
      <span>{label}</span>
      <select
        className="rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-white outline-none ring-orange-500/40 transition focus:border-orange-400 focus:ring-4"
        name={name}
        defaultValue={defaultValue ?? ""}
      >
        {children}
      </select>
    </label>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-zinc-400">
      {children}
    </div>
  );
}
