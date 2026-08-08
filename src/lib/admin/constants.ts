export const ADMIN_NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/clientes", label: "Clientes" },
  { href: "/admin/projetos", label: "Projetos" },
  { href: "/admin/financeiro", label: "Financeiro" },
  { href: "/admin/documentos", label: "Documentos" },
  { href: "/admin/historico", label: "Historico" },
  { href: "/admin/configuracoes", label: "Configuracoes" },
];

export const CLIENT_STATUS_LABEL = {
  active: "Ativo",
  archived: "Arquivado",
} as const;

export const PROJECT_STATUS_LABEL = {
  planning: "Planejamento",
  active: "Em andamento",
  paused: "Pausado",
  completed: "Concluido",
  cancelled: "Cancelado",
} as const;

export const FINANCE_STATUS_LABEL = {
  pending: "Pendente",
  paid: "Pago",
  overdue: "Vencido",
  cancelled: "Cancelado",
} as const;

export const DOCUMENT_STATUS_LABEL = {
  draft: "Rascunho",
  approved: "Aprovado",
  cancelled: "Cancelado",
} as const;

export const DOCUMENT_TYPE_LABEL = {
  estimate: "Orcamento",
  invoice: "Fatura",
} as const;

export const STATUS_BADGE_CLASS: Record<string, string> = {
  active: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  archived: "border-zinc-500/30 bg-zinc-500/10 text-zinc-300",
  planning: "border-sky-400/30 bg-sky-400/10 text-sky-200",
  paused: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  completed: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  cancelled: "border-red-400/30 bg-red-400/10 text-red-200",
  pending: "border-orange-400/30 bg-orange-400/10 text-orange-200",
  paid: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  overdue: "border-red-400/30 bg-red-400/10 text-red-200",
  draft: "border-zinc-400/30 bg-zinc-400/10 text-zinc-200",
  approved: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
};

export const DEFAULT_DOCUMENT_ITEM = {
  description: "Desenvolvimento de projeto digital",
  quantity: 1,
  unitCents: 500000,
};
