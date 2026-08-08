import { SettingsForms } from "@/components/admin/SettingsForms";
import { updateCompanySettingsAction } from "@/lib/admin/actions/settings";
import { getCompanySettings } from "@/lib/admin/queries";

export default async function ConfiguracoesPage() {
  const settings = await getCompanySettings();

  return (
    <SettingsForms
      settings={settings}
      companyAction={updateCompanySettingsAction}
    />
  );
}
