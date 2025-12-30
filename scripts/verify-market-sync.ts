import { PrismaClient } from "@prisma/client";
import { calculateReplacementValue } from "../src/lib/calculations/fifo-engine";

const prisma = new PrismaClient();

async function verifyMarketSync() {
  console.log("📈 Verifying Market Sync...");

  // 1. Get Inventory
  const metals = await prisma.compraMetal.findMany({
    where: { metalType: "SILVER" },
  });

  if (metals.length === 0) {
    throw new Error("No metals found for verification");
  }

  const totalGrams = metals.reduce((acc, curr) => acc + curr.gramsRemaining, 0);
  console.log(`Total Silver Grams: ${totalGrams}g`);

  // 2. Set Market Price A
  const priceA = 4000;
  // We don't necessarily need to write to DB for 'calculateReplacementValue' unit test,
  // but to verify "System", we should check if the function works with dynamic inputs.
  // The 'page.tsx' fetches market data. We are testing the CALCULATION logic here.

  const valueA = calculateReplacementValue(metals, priceA);
  console.log(`At Market Price ${priceA}: Value = ${valueA}`);

  if (valueA !== totalGrams * priceA) {
    throw new Error(
      `Value mismatch! Expected ${totalGrams * priceA}, got ${valueA}`
    );
  }

  // 3. Set Market Price B (Fluctuation)
  const priceB = 4500;
  const valueB = calculateReplacementValue(metals, priceB);
  console.log(`At Market Price ${priceB}: Value = ${valueB}`);

  if (valueB !== totalGrams * priceB) {
    throw new Error(
      `Value mismatch! Expected ${totalGrams * priceB}, got ${valueB}`
    );
  }

  if (valueA === valueB) {
    throw new Error("Value did not fluctuate!");
  }

  console.log("✅ Market Sync Calculation Verification PASSED");
}

verifyMarketSync()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
