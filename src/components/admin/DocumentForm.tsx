import {
  approveDocumentAction,
  cancelDocumentAction,
  createDocumentAction,
  updateDocumentAction,
} from "@/lib/admin/actions/documents";
import { centsToInput, toDateInputValue } from "@/lib/admin/format";
import type {
  Client,
  CompanySettings,
  Document as DbDocument,
  DocumentInstallment,
  DocumentItem,
} from "@/lib/db/schema";
import { AdminButton, AdminCard, Field, SelectField, TextArea } from "./ui";

export function DocumentForm({
  clients,
  document,
  items = [],
  installments = [],
  settings,
}: {
  clients: Client[];
  document?: DbDocument;
  items?: DocumentItem[];
  installments?: DocumentInstallment[];
  settings?: CompanySettings;
}) {
  const action = document ? updateDocumentAction : createDocumentAction;
  const itemRows = Array.from({ length: Math.max(items.length, 3) }, (_, index) =>
    items[index]
      ? items[index]
      : {
          description: index === 0 ? "Desenvolvimento de projeto digital" : "",
          quantity: index === 0 ? 1 : 0,
          unitCents: index === 0 ? 500000 : 0,
        },
  );
  const installmentRows = Array.from(
    { length: Math.max(installments.length, 2) },
    (_, index) =>
      installments[index]
        ? installments[index]
        : {
            dueDate: "",
            amountCents: index === 0 ? document?.totalCents ?? 500000 : 0,
          },
  );

  return (
    <div className="grid gap-5">
      <AdminCard>
        <form action={action} className="grid gap-6">
          {document ? (
            <input name="id" type="hidden" value={document.id} />
          ) : null}
          <div className="grid gap-5 md:grid-cols-2">
            <SelectField
              label="Cliente"
              name="clientId"
              defaultValue={document?.clientId}
            >
              <option value="">Selecione</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </SelectField>
            <SelectField
              label="Tipo"
              name="type"
              defaultValue={document?.type ?? "estimate"}
            >
              <option value="estimate">Orcamento</option>
              <option value="invoice">Fatura</option>
            </SelectField>
            <Field
              label="Titulo"
              name="title"
              defaultValue={document?.title}
              required
            />
            <Field
              label="Valido ate"
              name="validUntil"
              type="date"
              defaultValue={toDateInputValue(document?.validUntil)}
            />
            <Field
              label="Desconto"
              name="discount"
              defaultValue={centsToInput(document?.discountCents)}
            />
          </div>
          <div>
            <h2 className="mb-3 text-lg font-semibold text-white">Itens</h2>
            <div className="grid gap-3">
              {itemRows.map((item, index) => (
                <div
                  className="grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-3 md:grid-cols-[1fr_110px_150px]"
                  key={index}
                >
                  <Field
                    label={`Descricao ${index + 1}`}
                    name="itemDescription"
                    defaultValue={item.description}
                  />
                  <Field
                    label="Qtd."
                    name="itemQuantity"
                    type="number"
                    defaultValue={item.quantity}
                  />
                  <Field
                    label="Unitario"
                    name="itemUnit"
                    defaultValue={centsToInput(item.unitCents)}
                  />
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="mb-3 text-lg font-semibold text-white">Parcelas</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {installmentRows.map((installment, index) => (
                <div
                  className="grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-3 sm:grid-cols-2"
                  key={index}
                >
                  <Field
                    label={`Vencimento ${index + 1}`}
                    name="installmentDueDate"
                    type="date"
                    defaultValue={toDateInputValue(installment.dueDate)}
                  />
                  <Field
                    label="Valor"
                    name="installmentAmount"
                    defaultValue={centsToInput(installment.amountCents)}
                  />
                </div>
              ))}
            </div>
          </div>
          <TextArea
            label="Observacoes"
            name="notes"
            defaultValue={document?.notes ?? settings?.defaultDocumentNotes}
          />
          <div className="flex flex-wrap gap-3">
            <AdminButton>
              {document ? "Salvar documento" : "Criar documento"}
            </AdminButton>
            <AdminButton href="/admin/documentos" variant="secondary">
              Voltar
            </AdminButton>
          </div>
        </form>
      </AdminCard>
      {document && document.status === "draft" ? (
        <AdminCard className="flex flex-wrap gap-3">
          <form action={approveDocumentAction}>
            <input name="id" type="hidden" value={document.id} />
            <AdminButton>Aprovar e gerar projeto</AdminButton>
          </form>
          <form action={cancelDocumentAction}>
            <input name="id" type="hidden" value={document.id} />
            <AdminButton variant="danger">Cancelar documento</AdminButton>
          </form>
        </AdminCard>
      ) : null}
    </div>
  );
}
