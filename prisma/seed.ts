import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de la base de datos...");

  // Leer el archivo Excel
  const excelPath = path.join(process.cwd(), "costos_olga.xlsx");
  const workbook = XLSX.readFile(excelPath);

  // 1. Crear configuración global
  console.log("📊 Creando configuración global...");
  await prisma.configuracionGlobal.upsert({
    where: { id: "config-principal" },
    update: {},
    create: {
      id: "config-principal",
      tipoCambio: 4000,
      impuesto: 0.19,
      margenGanancia: 0.15,
      gramosProducidosMes: 509,
    },
  });

  // 2. Migrar tipos de piedras desde el Excel (U2:V17)
  console.log("💎 Migrando tipos de piedras...");
  const costosDirectos = workbook.Sheets["Costo Directos"];

  // Leer manualmente las celdas U2:V17
  const piedrasData = [
    { nombre: "Diamante", precio: 75000 },
    { nombre: "Esmeralda", precio: 38000 },
    { nombre: "Rubí", precio: 50000 },
    { nombre: "Zafiro", precio: 50000 },
    { nombre: "Granate Verde", precio: 30000 },
    { nombre: "Acuamarina", precio: 45000 },
    { nombre: "Zafiro Paparadga", precio: 100000 },
    { nombre: "Granate Rojo", precio: 25000 },
    { nombre: "Amatista", precio: 25000 },
    { nombre: "Citrino", precio: 25000 },
    { nombre: "Peridoto", precio: 25000 },
    { nombre: "Tanzanita", precio: 35000 },
    { nombre: "CZ 1mm", precio: 300 },
    { nombre: "CZ", precio: 2000 },
    { nombre: "Corindón Laboratorio", precio: 2500 },
  ];

  for (const piedra of piedrasData) {
    const isSynthetic =
      piedra.nombre.includes("CZ") ||
      piedra.nombre.includes("Laboratorio") ||
      piedra.nombre.includes("Sintética");

    // Extract size from name if possible (e.g. "CZ 1mm")
    let sizeMm: number | null = null;
    if (piedra.nombre.includes("1mm")) sizeMm = 1.0;

    await prisma.tipoPiedra.upsert({
      where: { nombre: piedra.nombre },
      update: {
        precioCop: piedra.precio,
        trackingType: isSynthetic ? "LOT" : "UNIQUE",
        stockActual: isSynthetic ? 1000 : undefined, // Initialize stock for lots
        sizeMm: sizeMm ?? undefined,
      },
      create: {
        nombre: piedra.nombre,
        precioCop: piedra.precio,
        esNatural: !isSynthetic,
        categoria: isSynthetic
          ? "sintética"
          : piedra.precio >= 50000
          ? "preciosa"
          : "semipreciosa",
        trackingType: isSynthetic ? "LOT" : "UNIQUE",
        stockActual: isSynthetic ? 1000 : null,
        sizeMm: sizeMm,
      },
    });
  }
  console.log(`  ✅ ${piedrasData.length} tipos de piedras migrados`);

  // 3. Migrar costos fijos desde "Costos Indirectos y Fijos"
  console.log("📋 Migrando costos fijos...");
  const costosFijosData = [
    { nombre: "Luz", categoria: "servicio", valor: 470000 },
    { nombre: "Agua", categoria: "servicio", valor: 70000 },
    { nombre: "Fotografías y videos", categoria: "servicio", valor: 3000000 },
    { nombre: "Arriendo", categoria: "servicio", valor: 600000 },
    { nombre: "Transporte", categoria: "servicio", valor: 600000 },
    { nombre: "Empaque", categoria: "material", valor: 380000 },
    { nombre: "Tarjetas", categoria: "material", valor: 380000 },
    { nombre: "Ayudante", categoria: "servicio", valor: 800000 },
    { nombre: "Alquiler de vitrinas", categoria: "servicio", valor: 253000 },
    { nombre: "Ácidos, Alcohol, Etc", categoria: "consumible", valor: 600000 },
    { nombre: "Resinas para moldes", categoria: "material", valor: 2100000 },
    { nombre: "Precio de Plata Total", categoria: "material", valor: 3990000 },
    { nombre: "Fundición", categoria: "servicio", valor: 3345000 },
    { nombre: "Etiquetas e imprimador", categoria: "material", valor: 560000 },
  ];

  for (const costo of costosFijosData) {
    await prisma.costoFijo.upsert({
      where: { id: `costo-${costo.nombre.toLowerCase().replace(/\s+/g, "-")}` },
      update: { valor: costo.valor },
      create: {
        id: `costo-${costo.nombre.toLowerCase().replace(/\s+/g, "-")}`,
        nombre: costo.nombre,
        categoria: costo.categoria,
        valor: costo.valor,
        periodo: "mensual",
      },
    });
  }
  console.log(`  ✅ ${costosFijosData.length} costos fijos migrados`);

  // 4. Crear depreciaciones
  console.log("📉 Creando depreciaciones...");
  await prisma.depreciacion.upsert({
    where: { id: "dep-herramientas" },
    update: {},
    create: {
      id: "dep-herramientas",
      nombre: "Herramientas",
      valorInicial: 60000000,
      vidaUtilAnios: 5,
      valorMensual: 60000000 / (5 * 12), // 1,000,000/mes
    },
  });

  await prisma.depreciacion.upsert({
    where: { id: "dep-oficina" },
    update: {},
    create: {
      id: "dep-oficina",
      nombre: "Oficina",
      valorInicial: 60000000,
      vidaUtilAnios: 10,
      valorMensual: 60000000 / (10 * 12), // 500,000/mes
    },
  });
  console.log("  ✅ 2 depreciaciones creadas");

  // 5. Crear configuración de etapas
  console.log("🔧 Creando configuración de etapas...");
  const etapas = [
    {
      numero: 1,
      nombre: "Diseño",
      descripcion: "Electricidad, computación, tiempo dedicado",
    },
    {
      numero: 2,
      nombre: "Impresión 3D",
      descripcion: "Costo de resina utilizada",
    },
    {
      numero: 3,
      nombre: "Fundición",
      descripcion: "Servicio externo",
      costoDefault: 66700,
    },
    {
      numero: 4,
      nombre: "Preparación Esmaltado",
      descripcion: "Tiempo y materiales de preparación",
    },
    {
      numero: 5,
      nombre: "Esmaltado",
      descripcion: "Aplicación de esmaltes (3-4g por pieza)",
      costoDefault: 50000,
    },
    { numero: 6, nombre: "Acabado", descripcion: "Brocas, seguetas, ácido" },
    {
      numero: 7,
      nombre: "Engaste de Piedras",
      descripcion: "Colocación de piedras preciosas",
    },
    { numero: 8, nombre: "Pulido", descripcion: "Materiales de pulido final" },
  ];

  for (const etapa of etapas) {
    await prisma.configEtapa.upsert({
      where: { numeroEtapa: etapa.numero },
      update: {},
      create: {
        numeroEtapa: etapa.numero,
        nombre: etapa.nombre,
        descripcion: etapa.descripcion,
        costoFijoDefault: etapa.costoDefault ?? null,
      },
    });
  }
  console.log(`  ✅ ${etapas.length} etapas configuradas`);

  console.log("\n✨ Seed completado exitosamente!");

  // Mostrar resumen
  const totalPiedras = await prisma.tipoPiedra.count();
  const totalCostos = await prisma.costoFijo.count();
  const totalDep = await prisma.depreciacion.count();

  console.log("\n📊 Resumen:");
  console.log(`   - Tipos de piedras: ${totalPiedras}`);
  console.log(`   - Costos fijos: ${totalCostos}`);
  console.log(`   - Depreciaciones: ${totalDep}`);
}

main()
  .catch((e) => {
    console.error("❌ Error durante el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
