"use client";

import { AdminButton } from "@/components/admin/ui";

export function PrintDocumentButton() {
  return (
    <AdminButton type="button" variant="secondary" onClick={() => window.print()}>
      Imprimir
    </AdminButton>
  );
}
