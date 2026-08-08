import {
  Document as PdfDocument,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { DOCUMENT_TYPE_LABEL } from "@/lib/admin/constants";
import { formatCurrency, formatDate } from "@/lib/admin/format";
import type {
  Client,
  CompanySettings,
  Document as DbDocument,
  DocumentInstallment,
  DocumentItem,
} from "@/lib/db/schema";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    color: "#18181b",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 2,
    borderBottomColor: "#ff6b35",
    paddingBottom: 18,
    marginBottom: 24,
  },
  brand: {
    fontSize: 22,
    fontWeight: 700,
    color: "#ff3b3b",
  },
  muted: {
    color: "#71717a",
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 6,
    color: "#09090b",
  },
  section: {
    marginBottom: 18,
  },
  grid: {
    flexDirection: "row",
    gap: 14,
  },
  box: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    borderRadius: 10,
    padding: 12,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#111111",
    color: "#ffffff",
    padding: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e4e4e7",
    padding: 8,
  },
  colDescription: { width: "48%" },
  colSmall: { width: "17%" },
  totalBox: {
    marginLeft: "auto",
    width: "44%",
    borderWidth: 1,
    borderColor: "#ff6b35",
    borderRadius: 10,
    padding: 12,
  },
  totalLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  grandTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 14,
    fontWeight: 700,
    color: "#ff3b3b",
  },
  footer: {
    marginTop: "auto",
    borderTopWidth: 1,
    borderTopColor: "#e4e4e7",
    paddingTop: 12,
    color: "#71717a",
  },
});

export function AragaoDocumentPdf({
  document,
  client,
  items,
  installments,
  settings,
}: {
  document: DbDocument;
  client: Client | null;
  items: DocumentItem[];
  installments: DocumentInstallment[];
  settings: CompanySettings;
}) {
  return (
    <PdfDocument
      title={`${DOCUMENT_TYPE_LABEL[document.type]} ${document.number}`}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>{settings.companyName}</Text>
            <Text style={styles.muted}>{settings.website}</Text>
            <Text style={styles.muted}>{settings.email}</Text>
          </View>
          <View>
            <Text style={styles.title}>{document.number}</Text>
            <Text>{DOCUMENT_TYPE_LABEL[document.type]}</Text>
            <Text style={styles.muted}>Emitido em {formatDate(document.createdAt)}</Text>
            <Text style={styles.muted}>Validade {formatDate(document.validUntil)}</Text>
          </View>
        </View>

        <View style={[styles.section, styles.grid]}>
          <View style={styles.box}>
            <Text style={styles.title}>Cliente</Text>
            <Text>{client?.name ?? "Cliente removido"}</Text>
            <Text style={styles.muted}>{client?.company}</Text>
            <Text style={styles.muted}>{client?.email}</Text>
            <Text style={styles.muted}>{client?.phone}</Text>
            <Text style={styles.muted}>{client?.documentNumber}</Text>
          </View>
          <View style={styles.box}>
            <Text style={styles.title}>Empresa</Text>
            <Text>{settings.legalName}</Text>
            <Text style={styles.muted}>{settings.documentNumber}</Text>
            <Text style={styles.muted}>{settings.address}</Text>
            <Text style={styles.muted}>
              {settings.city} / {settings.state} - {settings.zipCode}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>{document.title}</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.colDescription}>Descricao</Text>
            <Text style={styles.colSmall}>Qtd.</Text>
            <Text style={styles.colSmall}>Unitario</Text>
            <Text style={styles.colSmall}>Total</Text>
          </View>
          {items.map((item) => (
            <View style={styles.tableRow} key={item.id}>
              <Text style={styles.colDescription}>{item.description}</Text>
              <Text style={styles.colSmall}>{item.quantity}</Text>
              <Text style={styles.colSmall}>{formatCurrency(item.unitCents)}</Text>
              <Text style={styles.colSmall}>{formatCurrency(item.totalCents)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.totalBox}>
            <View style={styles.totalLine}>
              <Text>Subtotal</Text>
              <Text>{formatCurrency(document.subtotalCents)}</Text>
            </View>
            <View style={styles.totalLine}>
              <Text>Desconto</Text>
              <Text>{formatCurrency(document.discountCents)}</Text>
            </View>
            <View style={styles.grandTotal}>
              <Text>Total</Text>
              <Text>{formatCurrency(document.totalCents)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>Parcelas</Text>
          {installments.map((installment) => (
            <Text key={installment.id}>
              Parcela {installment.installmentNumber}:{" "}
              {formatCurrency(installment.amountCents)} - vencimento{" "}
              {formatDate(installment.dueDate)}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>Observacoes</Text>
          <Text>{document.notes || settings.defaultDocumentNotes}</Text>
          <Text style={[styles.muted, { marginTop: 8 }]}>
            {settings.defaultPaymentTerms}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>
            Documento gerado pelo ERP privado Aragao Dev. Status:{" "}
            {document.status}.
          </Text>
        </View>
      </Page>
    </PdfDocument>
  );
}
