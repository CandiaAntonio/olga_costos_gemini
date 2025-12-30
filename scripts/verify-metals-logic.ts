import { PrismaClient } from "@prisma/client";
import { calculateTotalInventoryValue } from "../src/lib/calculations/fifo-engine";

const prisma = new PrismaClient();

async function verify() {
  console.log("🧪 Verifying FIFO Logic...");

  // 1. Fetch Metal
  const metals = await prisma.compraMetal.findMany({
    where: { metalType: "SILVER" },
  });
  console.log("Metals found:", JSON.stringify(metals, null, 2));

  if (metals.length === 0) {
    console.error("❌ No Silver found!");
    return;
  }

  // 2. Calculate Value
  const totalValue = calculateTotalInventoryValue(metals);

  // 3. Expected Value (500g * 3800)
  const expectedValue = 500 * 3800;

  console.log(`Found ${metals.length} lots.`);
  console.log(`Calculated Value: ${totalValue}`);
  console.log(`Expected Value: ${expectedValue}`);

  if (totalValue === expectedValue) {
    console.log("✅ FIFO Logic Verification PASSED");
  } else {
    console.error("❌ FIFO Logic Verification FAILED");
  }
}

verify()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
