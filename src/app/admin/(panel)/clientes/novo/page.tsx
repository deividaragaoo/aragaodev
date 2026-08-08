import { ClientForm } from "@/components/admin/ClientForm";
import { PageHeader } from "@/components/admin/ui";

export default function NewClientPage() {
  return (
    <>
      <PageHeader
        title="Novo cliente"
        description="Cadastre os dados principais para propostas, projetos e financeiro."
      />
      <ClientForm />
    </>
  );
}
