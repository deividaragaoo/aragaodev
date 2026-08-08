import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { DOCUMENT_TYPES } from "@/lib/admin/constants";
import { getDocumentTypeProfile } from "@/lib/admin/document-profiles";

type PdfDoc = {
  number: string;
  type: string;
  issueDate: string;
  validUntil?: string | null;
  deliveryDeadline?: string | null;
  warranty?: string | null;
  notes?: string | null;
  conditions?: string | null;
  paymentMethod?: string | null;
  downPayment?: number | null;
  amountPaid?: number | null;
  trackPayments?: number | null;
  total: number;
  subtotal: number;
  discount: number;
  client: {
    name: string;
    company?: string | null;
    document?: string | null;
    whatsapp?: string | null;
    email?: string | null;
    address?: string | null;
  };
  items: Array<{
    name: string;
    description?: string | null;
    quantity: number;
    unitPrice: number;
    discount: number;
    total: number;
  }>;
  installments: Array<{
    number: number;
    dueDate: string;
    amount: number;
  }>;
};

type Company = {
  name: string;
  tagline?: string | null;
  document?: string | null;
  address?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  instagram?: string | null;
  website?: string | null;
  bankInfo?: string | null;
  logoSrc?: string | null;
  showLogo?: boolean;
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 32,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#111",
    lineHeight: 1.35,
  },
  header: {
    marginBottom: 12,
    borderBottom: "2px solid #ff6b35",
    paddingBottom: 8,
  },
  logoBar: {
    backgroundColor: "#0a0a0a",
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 6,
    alignItems: "flex-start",
  },
  logo: {
    width: 150,
    height: 35,
  },
  brand: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#111",
  },
  tagline: {
    marginTop: 2,
    fontSize: 10,
    color: "#ff6b35",
  },
  meta: {
    marginTop: 4,
    fontSize: 9,
    color: "#555",
  },
  sectionTitle: {
    marginTop: 10,
    marginBottom: 4,
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#ff3d00",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
    fontSize: 10,
  },
  clientLine: {
    fontSize: 10,
    marginBottom: 1,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f4f4f5",
    paddingVertical: 4,
    paddingHorizontal: 5,
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 5,
    borderBottom: "1px solid #e4e4e7",
    fontSize: 10,
  },
  colName: { width: "40%" },
  colQty: { width: "12%" },
  colPrice: { width: "16%" },
  colDisc: { width: "16%" },
  colTotal: { width: "16%", textAlign: "right" },
  highlight: {
    marginTop: 8,
    marginBottom: 4,
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
  },
  bodyText: {
    marginTop: 2,
    marginBottom: 2,
    fontSize: 11,
    lineHeight: 1.35,
    textAlign: "justify",
  },
  mutedText: {
    marginTop: 1,
    marginBottom: 2,
    fontSize: 9,
    lineHeight: 1.3,
    color: "#555",
  },
  totals: {
    marginTop: 6,
    fontSize: 10,
  },
  footer: {
    marginTop: 14,
    borderTop: "1px solid #ddd",
    paddingTop: 8,
    fontSize: 9,
    color: "#555",
  },
  signatures: {
    marginTop: 22,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  signBox: {
    width: "42%",
    borderTop: "1px solid #111",
    paddingTop: 6,
    textAlign: "center",
    fontSize: 10,
  },
});

function money(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function date(value?: string | null) {
  if (!value) return "—";
  if (value === "sem_prazo") return "Sem prazo";
  if (value === "definido_em_conversa") return "Definido em conversa";
  const [y, m, d] = value.split("-");
  if (!y || !m || !d) return value;
  return `${d}/${m}/${y}`;
}

function meaningfulText(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^(n\/?a|n\.?\s*a\.?|nenhum|nenhuma|-|—)$/i.test(trimmed)) return null;
  return trimmed;
}

export function AragaoDocumentPdf({
  doc,
  company,
}: {
  doc: PdfDoc;
  company: Company;
}) {
  const typeLabel =
    DOCUMENT_TYPES.find((item) => item.value === doc.type)?.label || doc.type;
  const profile = getDocumentTypeProfile(doc.type);
  const showLogo = Boolean(company.showLogo && company.logoSrc);
  const paidValue =
    doc.amountPaid && doc.amountPaid > 0 ? doc.amountPaid : doc.total;
  const namedItems = doc.items.filter((item) => item.name);
  const notes = meaningfulText(doc.notes);
  const conditions = meaningfulText(doc.conditions);
  const termoBody = conditions || notes;
  const showPaymentBlock =
    profile.showPaymentTerms ||
    profile.showPaidAmount ||
    (Boolean(doc.trackPayments) && Boolean(doc.paymentMethod));

  const clientBits = [
    doc.client.company,
    doc.client.document ? `CPF/CNPJ: ${doc.client.document}` : null,
    doc.client.whatsapp ? `WhatsApp: ${doc.client.whatsapp}` : null,
    doc.client.email ? `E-mail: ${doc.client.email}` : null,
    doc.client.address ? `Endereço: ${doc.client.address}` : null,
  ].filter(Boolean);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {showLogo ? (
            <View style={styles.logoBar}>
              <Image src={company.logoSrc!} style={styles.logo} />
            </View>
          ) : (
            <Text style={styles.brand}>{company.name || "ARAGÃO DEV"}</Text>
          )}
          <Text style={styles.tagline}>
            {company.tagline || "Sistemas Sob Medida"}
          </Text>
          <Text style={styles.meta}>
            {[company.document, company.email, company.whatsapp, company.website]
              .filter(Boolean)
              .join(" · ")}
          </Text>
        </View>

        <View style={styles.row}>
          <Text>
            {typeLabel}: {doc.number}
          </Text>
          <Text>Data: {date(doc.issueDate)}</Text>
        </View>

        <Text style={styles.sectionTitle}>Cliente</Text>
        <Text style={styles.clientLine}>{doc.client.name}</Text>
        {clientBits.length > 0 ? (
          <Text style={styles.mutedText}>{clientBits.join(" · ")}</Text>
        ) : null}

        {doc.type === "recibo" ? (
          <>
            <Text style={styles.highlight}>
              Recebemos de {doc.client.name} a importância de {money(paidValue)}
            </Text>
            <Text style={styles.bodyText}>
              Forma de pagamento: {doc.paymentMethod || "—"}
            </Text>
            {profile.showRemainingBalance ? (
              <View style={{ marginTop: 4 }}>
                <Text style={styles.bodyText}>
                  {profile.labels.contractTotal}: {money(doc.total)}
                </Text>
                <Text style={styles.bodyText}>
                  {profile.labels.paidAmount}: {money(paidValue)}
                </Text>
                <Text
                  style={{
                    ...styles.bodyText,
                    fontFamily: "Helvetica-Bold",
                  }}
                >
                  {profile.labels.remaining}:{" "}
                  {money(Math.max(0, (doc.total || 0) - paidValue))}
                  {Math.max(0, (doc.total || 0) - paidValue) <= 0
                    ? " (quitado)"
                    : " a ser pago do contrato"}
                </Text>
              </View>
            ) : null}
            {namedItems.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>{profile.labels.services}</Text>
                {namedItems.map((item, index) => (
                  <Text key={index} style={styles.bodyText}>
                    • {item.name}
                    {item.total > 0 ? ` — ${money(item.total)}` : ""}
                  </Text>
                ))}
              </>
            ) : null}
          </>
        ) : null}

        {doc.type === "comprovante" ? (
          <>
            <Text style={styles.highlight}>
              Comprovamos o pagamento de {money(paidValue)}
            </Text>
            <Text style={styles.bodyText}>
              Forma de pagamento: {doc.paymentMethod || "—"} · Data:{" "}
              {date(doc.issueDate)}
            </Text>
            {namedItems.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>{profile.labels.services}</Text>
                {namedItems.map((item, index) => (
                  <Text key={index} style={styles.bodyText}>
                    • {item.name}
                    {item.total > 0 ? ` — ${money(item.total)}` : ""}
                  </Text>
                ))}
              </>
            ) : null}
          </>
        ) : null}

        {doc.type === "termo" ? (
          <>
            {namedItems.length > 0 &&
            !(namedItems.length === 1 && namedItems[0].name === "Termo de serviço") ? (
              <>
                <Text style={styles.sectionTitle}>{profile.labels.services}</Text>
                {namedItems.map((item, index) => (
                  <View key={index} style={{ marginBottom: 2 }}>
                    <Text style={styles.bodyText}>• {item.name}</Text>
                    {profile.printItemDescriptions &&
                    meaningfulText(item.description) ? (
                      <Text style={styles.mutedText}>
                        {meaningfulText(item.description)}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </>
            ) : null}
            {termoBody ? (
              <>
                <Text style={styles.sectionTitle}>
                  {profile.labels.conditions}
                </Text>
                <Text style={styles.bodyText}>{termoBody}</Text>
              </>
            ) : null}
            {conditions && notes && notes !== conditions ? (
              <>
                <Text style={styles.sectionTitle}>{profile.labels.notes}</Text>
                <Text style={styles.bodyText}>{notes}</Text>
              </>
            ) : null}
          </>
        ) : null}

        {profile.showServices &&
        profile.showServicePricing &&
        doc.type !== "recibo" &&
        doc.type !== "comprovante" ? (
          <>
            <Text style={styles.sectionTitle}>{profile.labels.services}</Text>
            <View style={styles.tableHeader}>
              <Text style={styles.colName}>Item</Text>
              <Text style={styles.colQty}>Qtd</Text>
              <Text style={styles.colPrice}>Valor</Text>
              <Text style={styles.colDisc}>Desc.</Text>
              <Text style={styles.colTotal}>Total</Text>
            </View>
            {doc.items.map((item, index) => (
              <View key={index}>
                <View style={styles.tableRow}>
                  <Text style={styles.colName}>{item.name}</Text>
                  <Text style={styles.colQty}>{item.quantity}</Text>
                  <Text style={styles.colPrice}>{money(item.unitPrice)}</Text>
                  <Text style={styles.colDisc}>{money(item.discount)}</Text>
                  <Text style={styles.colTotal}>{money(item.total)}</Text>
                </View>
                {profile.printItemDescriptions &&
                meaningfulText(item.description) ? (
                  <Text style={styles.mutedText}>
                    {meaningfulText(item.description)}
                  </Text>
                ) : null}
              </View>
            ))}

            <View style={styles.totals}>
              <Text>Subtotal: {money(doc.subtotal)}</Text>
              {doc.discount > 0 ? (
                <Text>Desconto: {money(doc.discount)}</Text>
              ) : null}
              <Text style={{ fontFamily: "Helvetica-Bold", marginTop: 2 }}>
                Total: {money(doc.total)}
              </Text>
            </View>
          </>
        ) : null}

        {showPaymentBlock &&
        doc.type !== "recibo" &&
        doc.type !== "comprovante" ? (
          <>
            <Text style={styles.sectionTitle}>Pagamento</Text>
            <Text style={styles.bodyText}>
              Forma: {doc.paymentMethod || "—"}
              {profile.showInstallmentPlan
                ? ` · Entrada: ${money(doc.downPayment || 0)}`
                : ""}
            </Text>
            {profile.showInstallmentPlan
              ? doc.installments.map((installment) => (
                  <Text key={installment.number} style={styles.bodyText}>
                    Parcela {installment.number}: {money(installment.amount)} —
                    venc. {date(installment.dueDate)}
                  </Text>
                ))
              : null}
          </>
        ) : null}

        {doc.type !== "termo" &&
        doc.type !== "recibo" &&
        doc.type !== "comprovante" &&
        (profile.showValidUntil ||
          profile.showDeliveryDeadline ||
          profile.showWarranty ||
          (profile.showConditions && conditions) ||
          (profile.showNotes && notes)) ? (
          <>
            <Text style={styles.sectionTitle}>
              {doc.type === "contrato" ? "Condições contratuais" : "Condições"}
            </Text>
            {profile.showValidUntil ? (
              <Text style={styles.bodyText}>
                {profile.labels.validUntil}: {date(doc.validUntil)}
              </Text>
            ) : null}
            {profile.showDeliveryDeadline ? (
              <Text style={styles.bodyText}>
                Prazo de entrega: {date(doc.deliveryDeadline)}
              </Text>
            ) : null}
            {profile.showWarranty ? (
              <Text style={styles.bodyText}>
                Garantia: {doc.warranty || "—"}
              </Text>
            ) : null}
            {profile.showNotes && notes ? (
              <Text style={styles.bodyText}>
                {profile.labels.notes}: {notes}
              </Text>
            ) : null}
            {profile.showConditions && conditions ? (
              <Text style={styles.bodyText}>
                {profile.labels.conditions}: {conditions}
              </Text>
            ) : null}
          </>
        ) : null}

        {(doc.type === "recibo" || doc.type === "comprovante") && notes ? (
          <>
            <Text style={styles.sectionTitle}>{profile.labels.notes}</Text>
            <Text style={styles.bodyText}>{notes}</Text>
          </>
        ) : null}

        <View style={styles.footer}>
          <Text>{company.name}</Text>
          <Text>
            {[company.address, company.email, company.whatsapp, company.instagram]
              .filter(Boolean)
              .join(" · ")}
          </Text>
          {profile.showBankInfo && company.bankInfo ? (
            <Text>Dados bancários: {company.bankInfo}</Text>
          ) : null}
        </View>

        {profile.showSignatures ? (
          <View style={styles.signatures}>
            <View style={styles.signBox}>
              <Text>{company.name}</Text>
            </View>
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
