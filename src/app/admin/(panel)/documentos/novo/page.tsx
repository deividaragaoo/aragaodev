import { DocumentForm } from "@/components/admin/DocumentForm";
import { PageHeader } from "@/components/admin/ui";
import { getCompanySettings, listClients } from "@/lib/admin/queries";

export default async function NewDocumentPage() {
  const [clients, settings] = await Promise.all([
    listClients(),
    getCompanySettings(),
  ]);

  return (
    <>
      <PageHeader
        title="Novo documento"
        description="Crie orcamentos ou faturas com numeracao automatica e parcelas."
      />
      <DocumentForm clients={clients} settings={settings} />
    </>
  );
}
