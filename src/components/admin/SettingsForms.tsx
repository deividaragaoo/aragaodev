import {
  updateAdminSecurityAction,
  updateCompanySettingsAction,
} from "@/lib/admin/actions/settings";
import type { CompanySettings } from "@/lib/db/schema";
import { AdminButton, AdminCard, Field, TextArea } from "./ui";

export function SettingsForms({ settings }: { settings: CompanySettings }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
      <AdminCard>
        <h2 className="mb-5 text-xl font-semibold text-white">
          Dados da empresa
        </h2>
        <form action={updateCompanySettingsAction} className="grid gap-5">
          <input name="id" type="hidden" value={settings.id} />
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Nome fantasia"
              name="companyName"
              defaultValue={settings.companyName}
              required
            />
            <Field
              label="Razao social"
              name="legalName"
              defaultValue={settings.legalName}
              required
            />
            <Field
              label="CNPJ/CPF"
              name="documentNumber"
              defaultValue={settings.documentNumber}
              required
            />
            <Field
              label="Email"
              name="email"
              type="email"
              defaultValue={settings.email}
              required
            />
            <Field
              label="Telefone"
              name="phone"
              defaultValue={settings.phone}
              required
            />
            <Field
              label="WhatsApp"
              name="whatsapp"
              defaultValue={settings.whatsapp}
              required
            />
            <Field
              label="Website"
              name="website"
              defaultValue={settings.website}
              required
            />
            <Field
              label="CEP"
              name="zipCode"
              defaultValue={settings.zipCode}
              required
            />
            <Field
              label="Cidade"
              name="city"
              defaultValue={settings.city}
              required
            />
            <Field
              label="Estado"
              name="state"
              defaultValue={settings.state}
              required
            />
          </div>
          <Field
            label="Endereco"
            name="address"
            defaultValue={settings.address}
            required
          />
          <TextArea
            label="Termos padrao de pagamento"
            name="defaultPaymentTerms"
            defaultValue={settings.defaultPaymentTerms}
          />
          <TextArea
            label="Observacoes padrao dos documentos"
            name="defaultDocumentNotes"
            defaultValue={settings.defaultDocumentNotes}
          />
          <AdminButton>Salvar configuracoes</AdminButton>
        </form>
      </AdminCard>
      <AdminCard>
        <h2 className="mb-2 text-xl font-semibold text-white">
          Credenciais administrativas
        </h2>
        <p className="mb-5 text-sm text-zinc-400">
          Preencha apenas o que deseja alterar.
        </p>
        <form action={updateAdminSecurityAction} className="grid gap-5">
          <Field
            label="Nova senha"
            name="password"
            type="password"
            placeholder="Minimo 8 caracteres"
          />
          <Field
            label="Nova palavra-chave"
            name="keyword"
            type="password"
            placeholder="Minimo 6 caracteres"
          />
          <AdminButton>Atualizar seguranca</AdminButton>
        </form>
      </AdminCard>
    </div>
  );
}
