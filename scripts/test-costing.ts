import { calcularCostoTotal, calcularPCG } from "../src/lib/calculations";
import { prisma } from "../src/lib/db";

async function runTest() {
  console.log("--- Starting Costing Engine Verification ---");

  try {
    // 1. Calculate PCG (Overhead)
    console.log("Calculating PCG...");
    const pcg = await calcularPCG();
    console.log(
      `PCG: ${pcg.toLocaleString("es-CO", {
        style: "currency",
        currency: "COP",
      })}`
    );

    // 2. Define Benchmark Mock Data (Mapple Olive con Rubí)
    // Weight: Let's assume a standard weight for this benchmark, e.g., 10g silver
    const weight = 10;
    const stones = 100000;
    const enamel = 50000;
    const stages = 0; // Assuming benchmark doesn't specify stages cost or it's part of fixed

    // 3. Test Silver Calculation
    console.log("\nTesting Silver Costing with Live Data...");
    const silverCost = await calcularCostoTotal({
      pesoGramos: weight,
      pcg: pcg,
      costoPiedras: stones,
      costoEsmalte: enamel,
      costoEtapas: stages,
      metalType: "silver",
    });

    console.log(`Weight: ${weight}g`);
    console.log(`Metal: Silver`);
    console.log(
      `Total Cost (Silver): ${silverCost.toLocaleString("es-CO", {
        style: "currency",
        currency: "COP",
      })}`
    );

    // 4. Test Gold Calculation (Hypothetical)
    console.log("\nTesting Gold Costing with Live Data...");
    const goldCost = await calcularCostoTotal({
      pesoGramos: weight,
      pcg: pcg,
      costoPiedras: stones,
      costoEsmalte: enamel,
      costoEtapas: stages,
      metalType: "gold",
    });
    console.log(
      `Total Cost (Gold): ${goldCost.toLocaleString("es-CO", {
        style: "currency",
        currency: "COP",
      })}`
    );
  } catch (error) {
    console.error("Test Failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

runTest();
