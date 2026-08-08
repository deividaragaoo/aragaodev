"use client";

import { useActionState } from "react";
import {
  AdminButton,
  AdminField,
  AdminInput,
  AdminTextarea,
  PageHeader,
} from "@/components/admin/ui";
import {
  updateSecurityAction,
  type SecurityState,
} from "@/lib/admin/actions/settings";

type Settings = {
  name?: string | null;
  tagline?: string | null;
  document?: string | null;
  address?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  instagram?: string | null;
  website?: string | null;
  bankInfo?: string | null;
  logoPath?: string | null;
  showLogoOnDocuments?: number | null;
};

export function SettingsForms({
  settings,
  companyAction,
}: {
  settings: Settings | null | undefined;
  companyAction: (formData: FormData) => Promise<void>;
}) {
  const [securityState, securityAction, pending] = useActionState(
    updateSecurityAction,
    { ok: false } as SecurityState
  );

  return (
    <div className="space-y-10">
      <PageHeader
        title="Configurações"
        description="Dados da Aragão Dev e segurança do painel."
      />

      <section>
        <h2 className="mb-4 text-lg font-medium">Dados da Aragão Dev</h2>
        <form
          action={companyAction}
          className="grid gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-6 md:grid-cols-2"
        >
          <AdminField label="Nome">
            <AdminInput name="name" defaultValue={settings?.name || "Aragão Dev"} />
          </AdminField>
          <AdminField label="Tagline">
            <AdminInput
              name="tagline"
              defaultValue={settings?.tagline || "Sistemas Sob Medida"}
            />
          </AdminField>
          <AdminField label="CPF/CNPJ">
            <AdminInput name="document" defaultValue={settings?.document || ""} />
          </AdminField>
          <AdminField label="WhatsApp">
            <AdminInput name="whatsapp" defaultValue={settings?.whatsapp || ""} />
          </AdminField>
          <AdminField label="E-mail">
            <AdminInput name="email" defaultValue={settings?.email || ""} />
          </AdminField>
          <AdminField label="Instagram">
            <AdminInput name="instagram" defaultValue={settings?.instagram || ""} />
          </AdminField>
          <AdminField label="Site">
            <AdminInput name="website" defaultValue={settings?.website || ""} />
          </AdminField>
          <AdminField
            label="Logo nos contratos (caminho)"
            className="md:col-span-2"
          >
            <AdminInput
              name="logoPath"
              defaultValue={settings?.logoPath || "/brand/aragaodev-logo.png"}
              placeholder="/brand/aragaodev-logo.png"
            />
            <p className="mt-1.5 text-xs text-muted">
              Arquivo em <code className="text-[11px]">public/</code>. Padrão:{" "}
              <code className="text-[11px]">/brand/aragaodev-logo.png</code>
            </p>
          </AdminField>
          <label className="flex cursor-pointer items-start gap-2 text-sm text-muted md:col-span-2">
            <input
              type="checkbox"
              name="showLogoOnDocuments"
              value="1"
              defaultChecked={(settings?.showLogoOnDocuments ?? 1) === 1}
              className="mt-0.5 h-4 w-4 accent-[#ff6b35]"
            />
            <span>
              Exibir logotipo no PDF dos contratos e documentos
              <span className="mt-0.5 block text-xs">
                Aparece no topo do PDF, acima dos dados de contato.
              </span>
            </span>
          </label>
          <AdminField label="Endereço" className="md:col-span-2">
            <AdminInput name="address" defaultValue={settings?.address || ""} />
          </AdminField>
          <AdminField label="Dados bancários" className="md:col-span-2">
            <AdminTextarea
              name="bankInfo"
              defaultValue={settings?.bankInfo || ""}
            />
          </AdminField>
          <div className="md:col-span-2">
            <AdminButton type="submit">Salvar dados</AdminButton>
          </div>
        </form>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-medium">Segurança</h2>
        <form
          action={securityAction}
          className="grid max-w-xl gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-6"
        >
          <AdminField label="Senha atual">
            <AdminInput
              name="currentPassword"
              type="password"
              required
              autoComplete="current-password"
            />
          </AdminField>
          <AdminField label="Nova senha">
            <AdminInput
              name="newPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Deixe em branco para manter"
            />
          </AdminField>
          <AdminField label="Nova palavra-chave">
            <AdminInput
              name="newKeyword"
              type="password"
              autoComplete="off"
              placeholder="Deixe em branco para manter"
            />
          </AdminField>
          {securityState.error ? (
            <p className="text-sm text-red-400">{securityState.error}</p>
          ) : null}
          {securityState.message ? (
            <p className="text-sm text-emerald-400">{securityState.message}</p>
          ) : null}
          <AdminButton type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Atualizar segurança"}
          </AdminButton>
        </form>
      </section>
    </div>
  );
}
