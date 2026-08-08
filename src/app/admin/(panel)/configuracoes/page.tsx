import { SettingsForms } from "@/components/admin/SettingsForms";
import { PageHeader } from "@/components/admin/ui";
import { getCompanySettings } from "@/lib/admin/queries";

export default async function SettingsPage() {
  const settings = await getCompanySettings();

  if (!settings) {
    throw new Error("Configuracoes iniciais nao encontradas.");
  }

  return (
    <>
      <PageHeader
        title="Configuracoes"
        description="Dados da empresa nos documentos e credenciais privadas do painel."
      />
      <SettingsForms settings={settings} />
    </>
  );
}
