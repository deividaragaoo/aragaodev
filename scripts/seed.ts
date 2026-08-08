import { ensureAdminReady } from "../src/lib/db/ensure";

await ensureAdminReady();

console.log("Admin database migrated and seeded.");
