import { db } from "@/lib/db";
import { activityLog } from "@/lib/db/schema";
import type { AdminSession } from "@/lib/auth/session";

type ActivityInput = {
  session?: AdminSession | null;
  entityType: string;
  entityId?: number | null;
  action: string;
  message: string;
  metadata?: Record<string, unknown>;
};

export async function logActivity(input: ActivityInput) {
  await db.insert(activityLog).values({
    userId: input.session?.userId,
    entityType: input.entityType,
    entityId: input.entityId,
    action: input.action,
    message: input.message,
    metadata: input.metadata ? JSON.stringify(input.metadata) : null,
    createdAt: new Date().toISOString(),
  });
}
