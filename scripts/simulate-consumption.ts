import { PrismaClient } from "@prisma/client";
import {
  consumeMetalFIFO,
  MetalLot,
} from "../src/lib/calculations/fifo-engine";

const prisma = new PrismaClient();

async function simulateConsumption() {
  console.log("🥣 Simulating FIFO Consumption...");

  // 1. Get Inventory
  const rawInventory = await prisma.compraMetal.findMany({
    where: { metalType: "SILVER" },
    orderBy: { purchaseDate: "asc" }, // FIFO order
  });

  if (rawInventory.length === 0) throw new Error("No inventory to consume");

  const inventory: MetalLot[] = rawInventory.map((m) => ({
    id: m.id,
    metalType: m.metalType,
    gramsRemaining: m.gramsRemaining,
    pricePerGramCOP: m.pricePerGramCOP,
  }));

  console.log("Initial Inventory:");
  console.log(JSON.stringify(inventory, null, 2));

  // 2. Consume 100g
  const REQUIRED = 100;
  console.log(`\nConsuming ${REQUIRED}g...`);

  const result = consumeMetalFIFO(REQUIRED, inventory);

  console.log("\nConsumption Result:");
  console.log(JSON.stringify(result, null, 2));

  if (result.remainingForNextLot !== 0) {
    console.error("❌ Not enough metal!");
  } else {
    console.log("✅ Consumption simulated successfully.");
    console.log(`   Consumed Value: $${result.consumedValue}`);
    console.log(`   Lots Affected: ${result.lotsAffected.length}`);
  }
}

simulateConsumption()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
