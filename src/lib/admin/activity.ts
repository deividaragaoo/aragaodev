import { db } from "@/lib/db";
import { activityLog } from "@/lib/db/schema";

export async function logActivity(input: {
  action: string;
  entityType?: string;
  entityId?: number;
  details?: string;
}) {
  await db.insert(activityLog).values({
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    details: input.details,
  });
}
