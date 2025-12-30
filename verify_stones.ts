import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verify() {
  console.log("🔍 Verifying Stone Types Inventory...");

  const lots = await prisma.tipoPiedra.findMany({
    where: { inventoryType: "LOT" },
    select: { nombre: true },
  });

  const uniques = await prisma.tipoPiedra.findMany({
    where: { inventoryType: "UNIQUE" },
    select: { nombre: true },
  });

  console.log(
    `📦 LOTS (${lots.length}):`,
    lots.map((l) => l.nombre).join(", ")
  );
  console.log(
    `💎 UNIQUES (${uniques.length}):`,
    uniques.map((u) => u.nombre).join(", ")
  );

  if (uniques.length > 0 && lots.length > 0) {
    console.log("✅ Verification Successful: Both LOT and UNIQUE types exist.");
  } else {
    console.error(
      "❌ Verification Failed: Missing either LOT or UNIQUE types."
    );
  }
}

verify()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
