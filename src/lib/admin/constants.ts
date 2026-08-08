export const PROJECT_STATUSES = [
  { value: "orcamento", label: "Orçamento" },
  { value: "aguardando_aprovacao", label: "Aguardando aprovação" },
  { value: "aprovado", label: "Aprovado" },
  { value: "em_desenvolvimento", label: "Em desenvolvimento" },
  { value: "em_revisao", label: "Em revisão" },
  { value: "concluido", label: "Concluído" },
  { value: "cancelado", label: "Cancelado" },
] as const;

export const RECEIVABLE_STATUSES = [
  { value: "pendente", label: "Pendente" },
  { value: "pago", label: "Pago" },
  { value: "atrasado", label: "Atrasado" },
  { value: "cancelado", label: "Cancelado" },
] as const;

export const PAYABLE_STATUSES = [
  { value: "pendente", label: "Pendente" },
  { value: "pago", label: "Pago" },
  { value: "atrasado", label: "Atrasado" },
  { value: "cancelado", label: "Cancelado" },
] as const;

export const PAYABLE_CATEGORIES = [
  { value: "hospedagem", label: "Hospedagem" },
  { value: "dominio", label: "Domínio" },
  { value: "software", label: "Software" },
  { value: "vps", label: "VPS" },
  { value: "banco_de_dados", label: "Banco de dados" },
  { value: "api", label: "API" },
  { value: "marketing", label: "Marketing" },
  { value: "impostos", label: "Impostos" },
  { value: "equipamentos", label: "Equipamentos" },
  { value: "outros", label: "Outros" },
] as const;

export const DOCUMENT_TYPES = [
  { value: "orcamento", label: "Orçamento", prefix: "ORC" },
  { value: "proposta", label: "Proposta Comercial", prefix: "PROP" },
  { value: "contrato", label: "Contrato", prefix: "CTR" },
  { value: "recibo", label: "Recibo", prefix: "REC" },
  { value: "termo", label: "Termo de Serviço", prefix: "TRM" },
  { value: "comprovante", label: "Comprovante de Pagamento", prefix: "CMP" },
] as const;

export const PAYMENT_METHODS = [
  "PIX",
  "Transferência",
  "Boleto",
  "Cartão de crédito",
  "Cartão de débito",
  "Dinheiro",
] as const;

export const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/admin/clientes", label: "Clientes", icon: "Users" },
  { href: "/admin/projetos", label: "Projetos", icon: "FolderKanban" },
  { href: "/admin/financeiro", label: "Financeiro", icon: "Wallet" },
  { href: "/admin/documentos", label: "Documentos", icon: "FileText" },
  { href: "/admin/historico", label: "Histórico", icon: "History" },
  { href: "/admin/configuracoes", label: "Configurações", icon: "Settings" },
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number]["value"];
export type DocumentType = (typeof DOCUMENT_TYPES)[number]["value"];
