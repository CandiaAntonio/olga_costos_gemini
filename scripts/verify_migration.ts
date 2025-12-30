import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verify() {
  console.log("🔍 Verifying Inventory Migration...");

  const stones = await prisma.tipoPiedra.findMany();
  console.log(`✅ Total Stones found: ${stones.length}`);

  const diamond = stones.find((s) => s.nombre === "Diamante");
  if (diamond) {
    console.log("💎 Diamond Check:");
    console.log(`   - Price: ${diamond.precioCop} (Expected: 75000)`);
    console.log(`   - Tracking: ${diamond.trackingType} (Expected: LOT)`);
    console.log(`   - Stock: ${diamond.stockActual} (Expected: 100)`);
  } else {
    console.error("❌ Diamond not found!");
  }

  const ruby = stones.find((s) => s.nombre === "Rubí");
  if (ruby) {
    console.log("🔴 Ruby Check:");
    console.log(`   - Price: ${ruby.precioCop} (Expected: 50000)`);
  }

  const cz = stones.find((s) => s.nombre.includes("CZ 1mm"));
  if (cz) {
    console.log("⚪ CZ 1mm Check:");
    console.log(`   - Price: ${cz.precioCop} (Expected: 300)`);
    console.log(`   - Size: ${cz.sizeMm} (Expected: 1)`);
  }

  // Check unique stones structure if any (should be 0 individual stones yet, but the model exists)
  const individualStones = await prisma.piedraIndividual.count();
  console.log(`📦 Individual Stones count: ${individualStones}`);
}

verify()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
