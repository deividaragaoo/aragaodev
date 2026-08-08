import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { DOCUMENT_TYPES } from "@/lib/admin/constants";

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
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#111",
  },
  header: {
    marginBottom: 24,
    borderBottom: "2px solid #ff6b35",
    paddingBottom: 12,
  },
  logoBar: {
    backgroundColor: "#0a0a0a",
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    alignItems: "flex-start",
  },
  logo: {
    width: 180,
    height: 42,
  },
  brand: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#111",
  },
  tagline: {
    marginTop: 4,
    fontSize: 11,
    color: "#ff6b35",
  },
  meta: {
    marginTop: 8,
    color: "#555",
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#ff3d00",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f4f4f5",
    padding: 6,
    fontFamily: "Helvetica-Bold",
  },
  tableRow: {
    flexDirection: "row",
    padding: 6,
    borderBottom: "1px solid #e4e4e7",
  },
  colName: { width: "40%" },
  colQty: { width: "12%" },
  colPrice: { width: "16%" },
  colDisc: { width: "16%" },
  colTotal: { width: "16%", textAlign: "right" },
  footer: {
    marginTop: 28,
    borderTop: "1px solid #ddd",
    paddingTop: 12,
    color: "#555",
  },
  signatures: {
    marginTop: 36,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signBox: {
    width: "45%",
    borderTop: "1px solid #111",
    paddingTop: 8,
    textAlign: "center",
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

export function AragaoDocumentPdf({
  doc,
  company,
}: {
  doc: PdfDoc;
  company: Company;
}) {
  const typeLabel =
    DOCUMENT_TYPES.find((item) => item.value === doc.type)?.label || doc.type;
  const showLogo = Boolean(company.showLogo && company.logoSrc);

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
        <Text>{doc.client.name}</Text>
        {doc.client.company ? <Text>{doc.client.company}</Text> : null}
        {doc.client.whatsapp ? <Text>WhatsApp: {doc.client.whatsapp}</Text> : null}
        {doc.client.address ? <Text>Endereço: {doc.client.address}</Text> : null}

        <Text style={styles.sectionTitle}>Serviços</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.colName}>Item</Text>
          <Text style={styles.colQty}>Qtd</Text>
          <Text style={styles.colPrice}>Valor</Text>
          <Text style={styles.colDisc}>Desc.</Text>
          <Text style={styles.colTotal}>Total</Text>
        </View>
        {doc.items.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.colName}>{item.name}</Text>
            <Text style={styles.colQty}>{item.quantity}</Text>
            <Text style={styles.colPrice}>{money(item.unitPrice)}</Text>
            <Text style={styles.colDisc}>{money(item.discount)}</Text>
            <Text style={styles.colTotal}>{money(item.total)}</Text>
          </View>
        ))}

        <View style={{ marginTop: 12 }}>
          <Text>Subtotal: {money(doc.subtotal)}</Text>
          <Text>Desconto: {money(doc.discount)}</Text>
          <Text style={{ fontFamily: "Helvetica-Bold", marginTop: 4 }}>
            Total: {money(doc.total)}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Pagamento</Text>
        <Text>Forma: {doc.paymentMethod || "—"}</Text>
        <Text>Entrada: {money(doc.downPayment || 0)}</Text>
        {doc.installments.map((installment) => (
          <Text key={installment.number}>
            Parcela {installment.number}: {money(installment.amount)} — venc.{" "}
            {date(installment.dueDate)}
          </Text>
        ))}

        <Text style={styles.sectionTitle}>Condições</Text>
        <Text>Validade: {date(doc.validUntil)}</Text>
        <Text>Prazo de entrega: {date(doc.deliveryDeadline)}</Text>
        <Text>Garantia: {doc.warranty || "—"}</Text>
        {doc.notes ? <Text>Observações: {doc.notes}</Text> : null}
        {doc.conditions ? <Text>Condições: {doc.conditions}</Text> : null}

        <View style={styles.footer}>
          <Text>{company.name}</Text>
          <Text>
            {[company.address, company.email, company.whatsapp, company.instagram]
              .filter(Boolean)
              .join(" · ")}
          </Text>
          {company.bankInfo ? <Text>Dados bancários: {company.bankInfo}</Text> : null}
        </View>

        {(doc.type === "contrato" || doc.type === "recibo") && (
          <View style={styles.signatures}>
            <View style={styles.signBox}>
              <Text>{company.name}</Text>
            </View>
            <View style={styles.signBox}>
              <Text>{doc.client.name}</Text>
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
}
