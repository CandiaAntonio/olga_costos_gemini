import "dotenv/config";
import { updateMarketDataIfNeeded } from "../src/lib/market-service";
import { prisma } from "../src/lib/db";

async function main() {
  console.log("🚀 Forcing Market Data Sync...");

  // Force update = true, which triggers syncHistoricalData
  await updateMarketDataIfNeeded(true);

  console.log("✅ Sync command finished.");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
