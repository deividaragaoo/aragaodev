import type { DocumentType } from "@/lib/admin/constants";

export type DocumentTypeProfile = {
  description: string;
  showServices: boolean;
  showServicePricing: boolean;
  showServiceDescription: boolean;
  requireServices: boolean;
  /** Forma de pagamento + entrada/parcelas */
  showPaymentTerms: boolean;
  /** Entrada e parcelas (além da forma) */
  showInstallmentPlan: boolean;
  /** Checkbox de acompanhar pago/pendente */
  showTrackPayments: boolean;
  /** Valor já recebido (recibo/comprovante) */
  showPaidAmount: boolean;
  /** Mostra total do contrato, valor pago e restante a pagar (recibo) */
  showRemainingBalance: boolean;
  showValidUntil: boolean;
  showDeliveryDeadline: boolean;
  showWarranty: boolean;
  showNotes: boolean;
  showConditions: boolean;
  showSignatures: boolean;
  showBankInfo: boolean;
  showPaymentPanel: boolean;
  canConvertToProject: boolean;
  /** No PDF, destacar descrição dos itens */
  printItemDescriptions: boolean;
  labels: {
    services: string;
    validUntil: string;
    conditions: string;
        notes: string;
        paidAmount: string;
        contractTotal: string;
        remaining: string;
      };
};

const COMMERCIAL_BASE = {
  showServices: true,
  showServicePricing: true,
  showServiceDescription: true,
  requireServices: true,
  showPaymentTerms: true,
  showInstallmentPlan: true,
  showTrackPayments: true,
  showPaidAmount: false,
  showRemainingBalance: false,
  showValidUntil: true,
  showDeliveryDeadline: true,
  showWarranty: true,
  showNotes: true,
  showConditions: true,
  showSignatures: false,
  showBankInfo: false,
  showPaymentPanel: true,
  canConvertToProject: true,
  printItemDescriptions: true,
} satisfies Omit<DocumentTypeProfile, "description" | "labels">;

export const DOCUMENT_TYPE_PROFILES: Record<DocumentType, DocumentTypeProfile> =
  {
    orcamento: {
      ...COMMERCIAL_BASE,
      description:
        "Cotação de valores: itens, preços, validade e prazo. Sem assinatura.",
      showInstallmentPlan: false,
      printItemDescriptions: false,
      labels: {
        services: "Itens do orçamento",
        validUntil: "Validade do orçamento",
        conditions: "Condições do orçamento",
        notes: "Observações",
        paidAmount: "Valor já pago",
        contractTotal: "Valor total",
        remaining: "Restante a pagar",
      },
    },
    proposta: {
      ...COMMERCIAL_BASE,
      description:
        "Proposta comercial com escopo, valores, condições e forma de pagamento.",
      labels: {
        services: "Escopo e serviços",
        validUntil: "Validade da proposta",
        conditions: "Condições comerciais",
        notes: "Apresentação / observações",
        paidAmount: "Valor já pago",
        contractTotal: "Valor total",
        remaining: "Restante a pagar",
      },
    },
    contrato: {
      ...COMMERCIAL_BASE,
      description:
        "Acordo formal: objeto, pagamento, prazos, garantia, cláusulas e sua assinatura.",
      showValidUntil: false,
      showTrackPayments: true,
      showSignatures: true,
      showBankInfo: true,
      canConvertToProject: false,
      labels: {
        services: "Objeto do contrato",
        validUntil: "Vigência",
        conditions: "Cláusulas e condições",
        notes: "Observações",
        paidAmount: "Valor já pago",
        contractTotal: "Valor total",
        remaining: "Restante a pagar",
      },
    },
    recibo: {
      description:
        "Comprova quanto foi pago agora e quanto ainda resta do contrato.",
      showServices: true,
      showServicePricing: true,
      showServiceDescription: false,
      requireServices: true,
      showPaymentTerms: true,
      showInstallmentPlan: false,
      showTrackPayments: false,
      showPaidAmount: true,
      showRemainingBalance: true,
      showValidUntil: false,
      showDeliveryDeadline: false,
      showWarranty: false,
      showNotes: true,
      showConditions: false,
      showSignatures: true,
      showBankInfo: false,
      showPaymentPanel: false,
      canConvertToProject: false,
      printItemDescriptions: false,
      labels: {
        services: "Referente ao contrato / serviço",
        validUntil: "Validade",
        conditions: "Condições",
        notes: "Observações / detalhe do recebimento",
        paidAmount: "Valor pago neste recibo",
        contractTotal: "Valor total do contrato",
        remaining: "Restante a pagar",
      },
    },
    termo: {
      description:
        "Termo de serviço/aceite: foco no texto das condições e sua assinatura.",
      showServices: true,
      showServicePricing: false,
      showServiceDescription: true,
      requireServices: false,
      showPaymentTerms: false,
      showInstallmentPlan: false,
      showTrackPayments: false,
      showPaidAmount: false,
      showRemainingBalance: false,
      showValidUntil: false,
      showDeliveryDeadline: false,
      showWarranty: false,
      showNotes: true,
      showConditions: true,
      showSignatures: true,
      showBankInfo: false,
      showPaymentPanel: false,
      canConvertToProject: false,
      printItemDescriptions: true,
      labels: {
        services: "Objeto do termo (opcional)",
        validUntil: "Validade",
        conditions: "Texto do termo",
        notes: "Observações",
        paidAmount: "Valor",
        contractTotal: "Valor total",
        remaining: "Restante a pagar",
      },
    },
    comprovante: {
      description:
        "Comprovante de pagamento: valor, forma, data e referência do que foi pago.",
      showServices: true,
      showServicePricing: true,
      showServiceDescription: false,
      requireServices: true,
      showPaymentTerms: true,
      showInstallmentPlan: false,
      showTrackPayments: false,
      showPaidAmount: true,
      showRemainingBalance: false,
      showValidUntil: false,
      showDeliveryDeadline: false,
      showWarranty: false,
      showNotes: true,
      showConditions: false,
      showSignatures: false,
      showBankInfo: true,
      showPaymentPanel: false,
      canConvertToProject: false,
      printItemDescriptions: false,
      labels: {
        services: "Pagamento referente a",
        validUntil: "Validade",
        conditions: "Condições",
        notes: "Identificação / observações (PIX, ID, etc.)",
        paidAmount: "Valor pago",
        contractTotal: "Valor total",
        remaining: "Restante a pagar",
      },
    },
  };

export function getDocumentTypeProfile(
  type: string | null | undefined
): DocumentTypeProfile {
  if (type && type in DOCUMENT_TYPE_PROFILES) {
    return DOCUMENT_TYPE_PROFILES[type as DocumentType];
  }
  return DOCUMENT_TYPE_PROFILES.orcamento;
}
