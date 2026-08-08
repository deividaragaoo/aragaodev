import { NextResponse } from "next/server";
import { listClients } from "@/lib/admin/queries";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clients = await listClients();
  return NextResponse.json({
    clients: clients.map((client) => ({
      id: client.id,
      name: client.name,
      company: client.company,
      whatsapp: client.whatsapp,
      address: client.address,
    })),
  });
}
