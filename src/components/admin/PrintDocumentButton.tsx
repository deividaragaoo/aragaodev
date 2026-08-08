"use client";

import { FileText } from "lucide-react";
import { AdminButton } from "./ui";

export function PrintDocumentButton({ documentId }: { documentId: number }) {
  return (
    <AdminButton
      href={`/api/admin/documents/${documentId}/pdf`}
      variant="secondary"
      className="gap-2"
    >
      <FileText size={16} /> Abrir PDF
    </AdminButton>
  );
}
