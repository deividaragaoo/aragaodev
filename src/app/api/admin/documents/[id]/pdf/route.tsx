import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { AragaoDocumentPdf } from "@/components/admin/AragaoDocumentPdf";
import { logPdfGeneratedAction } from "@/lib/admin/actions/documents";
import { getCompanySettings, getDocumentById } from "@/lib/admin/queries";
import { getSession } from "@/lib/auth/session";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const doc = await getDocumentById(Number(id));
  const company = await getCompanySettings();

  if (!doc || !doc.client) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const element = (
    <AragaoDocumentPdf
      doc={{
        number: doc.number,
        type: doc.type,
        issueDate: doc.issueDate,
        validUntil: doc.validUntil,
        deliveryDeadline: doc.deliveryDeadline,
        warranty: doc.warranty,
        notes: doc.notes,
        conditions: doc.conditions,
        paymentMethod: doc.paymentMethod,
        downPayment: doc.downPayment,
        total: doc.total,
        subtotal: doc.subtotal,
        discount: doc.discount,
        client: doc.client,
        items: doc.items,
        installments: doc.installments,
      }}
      company={
        company || {
          name: "Aragão Dev",
          tagline: "Sistemas Sob Medida",
        }
      }
    />
  );

  const buffer = await renderToBuffer(element);

  await logPdfGeneratedAction(doc.id, doc.number);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${doc.number}.pdf"`,
    },
  });
}
