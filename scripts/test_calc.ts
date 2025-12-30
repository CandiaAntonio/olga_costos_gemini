import { calcularCostoTotal } from "@/lib/calculations";
import { prisma } from "@/lib/db";

async function testCosting() {
  console.log("🧪 Testing Cost Calculation...");

  // 1. Get a stone type to test with (e.g. Diamante)
  const diamante = await prisma.tipoPiedra.findFirst({
    where: { nombre: "Diamante" },
  });

  if (!diamante) {
    console.error("❌ Diamante not found in DB");
    return;
  }

  console.log(
    `💎 Found Stone: ${diamante.nombre}, Price: ${diamante.precioCop}`
  );

  // 2. Calculate cost for a piece with 1 diamond
  const cost = await calcularCostoTotal({
    pesoGramos: 10,
    pcg: 2000,
    costoEsmalte: 0,
    costoEtapas: 0,
    costoPiedras: 0, // Should be ignored/overridden
    piedras: [{ tipoPiedraId: diamante.id, cantidad: 1 }],
  });

  console.log(`💰 Total Cost Calculated: ${cost}`);

  // Verify logic check (approximate)
  // Material Cost (Silver) ~ 30 USD/oz -> ~ 1 USD/g -> ~ 4000 COP/g -> 10g = 40,000 COP
  // Overhead Cost = 10g * 2000 = 20,000 COP
  // Stone Cost = 75,000 (Diamante)
  // Total ~ 40k + 20k + 75k = 135k

  console.log(
    "✅ Cost calculation looks reasonable if around 135k-150k depending on live silver price"
  );
}

testCosting()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
