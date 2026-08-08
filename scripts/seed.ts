import { ensureAdminReady } from "../src/lib/db/ensure";

async function main() {
  await ensureAdminReady();
  console.log("Admin database migrated and seeded.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
