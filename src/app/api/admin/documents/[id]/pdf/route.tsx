import { renderToStream } from "@react-pdf/renderer";
import { AragaoDocumentPdf } from "@/components/admin/AragaoDocumentPdf";
import { getSession } from "@/lib/auth/session";
import { getDocumentDetail } from "@/lib/admin/queries";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const detail = await getDocumentDetail(Number(id));

  if (!detail || !detail.settings) {
    return new Response("Not found", { status: 404 });
  }

  const stream = await renderToStream(
    <AragaoDocumentPdf
      document={detail.document}
      client={detail.client}
      items={detail.items}
      installments={detail.installments}
      settings={detail.settings}
    />,
  );

  return new Response(stream as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${detail.document.number}.pdf"`,
    },
  });
}
