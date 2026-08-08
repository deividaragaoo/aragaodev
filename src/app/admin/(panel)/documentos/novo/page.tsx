import { PageHeader } from "@/components/admin/ui";
import { DocumentForm } from "@/components/admin/DocumentForm";
import { createDocumentAction } from "@/lib/admin/actions/documents";
import { listClients } from "@/lib/admin/queries";

export default async function NovoDocumentoPage() {
  const clients = await listClients();

  return (
    <div>
      <PageHeader
        title="Novo documento"
        description="Selecione o tipo, o cliente, os serviços e as condições."
      />
      <DocumentForm clients={clients} action={createDocumentAction} />
    </div>
  );
}
