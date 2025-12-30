import { PrismaClient } from "@prisma/client";
import {
  calculateTotalInventoryValue,
  calculateReplacementValue,
} from "../src/lib/calculations/fifo-engine";

const prisma = new PrismaClient();

async function main() {
  console.log("🧪 Verifying Metals Treasury Module...");

  // 1. Check Database Seeding
  const metals = await prisma.compraMetal.findMany();
  console.log(`\n📦 Found ${metals.length} metal lots in database.`);

  if (metals.length === 0) {
    console.error("❌ No metal lots found. Seeding failed?");
    process.exit(1);
  }

  const silverLot = metals.find((m) => m.metalType === "SILVER");
  if (
    silverLot &&
    silverLot.gramsRemaining === 500 &&
    silverLot.pricePerGramCOP === 3800
  ) {
    console.log("✅ Opening Balance verified: 500g Silver @ 3800");
  } else {
    console.error("❌ Opening Balance mismatch:", silverLot);
  }

  // 2. Verify FIFO Engine Logic
  console.log("\n🧮 Testing FIFO Engine Calculations...");

  // Mock Data
  const mockInventory = [
    { id: "1", metalType: "GOLD", gramsRemaining: 10, pricePerGramCOP: 200000 }, // Val: 2,000,000
    { id: "2", metalType: "GOLD", gramsRemaining: 5, pricePerGramCOP: 210000 }, // Val: 1,050,000
  ];
  // Total Expected Inventory Val: 3,050,000

  const totalValue = calculateTotalInventoryValue(mockInventory);
  console.log(
    `Expected Inventory Value: 3,050,000 | Calculated: ${totalValue}`
  );

  if (totalValue === 3050000) {
    console.log("✅ calculateTotalInventoryValue passed");
  } else {
    console.error("❌ calculateTotalInventoryValue failed");
  }

  // Replacement Value Test
  // Total Grams: 15. Market Price: 220,000. Expected: 15 * 220,000 = 3,300,000
  const replacementValue = calculateReplacementValue(mockInventory, 220000);
  console.log(
    `Expected Replacement Value: 3,300,000 | Calculated: ${replacementValue}`
  );

  if (replacementValue === 3300000) {
    console.log("✅ calculateReplacementValue passed");
  } else {
    console.error("❌ calculateReplacementValue failed");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
