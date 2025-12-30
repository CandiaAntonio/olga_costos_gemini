import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ClientGemGrid } from "./client-grid";

// Server Component
export default async function PiedrasPage() {
  // Fetch both sets of data
  // 1. Lots (TipoPiedra where inventoryType = LOT)
  const lots = await prisma.tipoPiedra.findMany({
    where: {
      activo: true,
      trackingType: "LOT",
    },
    orderBy: { nombre: "asc" },
  });

  // 2. Unique Stones (PiedraIndividual)
  // We need to fetch related TipoPiedra info for name/base price reference if needed
  // Note: Schema says PiedraIndividual has 'costo', but TipoPiedra has 'precioCop'.
  // Depending on business logic, Unique stones might override price or use cost + margin.
  // For now, we display 'costo' as the value for unique items.
  const uniqueStones = await prisma.piedraIndividual.findMany({
    where: {
      estado: "disponible", // Only show available ones? Or all? Let's show available for inventory.
    },
    include: {
      tipoPiedra: true,
    },
    orderBy: { creadoEn: "desc" },
  });

  // Normalize data for the grid
  const allGems = [
    ...lots.map((l) => ({ ...l, type: "LOT", id: l.id })),
    ...uniqueStones.map((u) => ({
      ...u,
      type: "UNIQUE",
      id: u.id,
      nombre: u.tipoPiedra.nombre + (u.codigo ? ` ${u.codigo}` : ""), // Composite name
      categoria: u.tipoPiedra.categoria,
      esNatural: u.tipoPiedra.esNatural,
      precioCop: u.costo, // Mapping cost to price for display uniformity (context matters)
    })),
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-4xl font-serif text-lebedeva-black mb-2">
            Gemas
          </h1>
          <p className="text-gray-400 font-technical font-light">
            Gestión de inventario de piedras
          </p>
        </div>
        <Link href="/inventario/piedras/nueva">
          <Button className="bg-lebedeva-black hover:bg-lebedeva-gold text-white rounded-none uppercase tracking-widest text-xs px-6 py-6 transition-all duration-300">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Piedra
          </Button>
        </Link>
      </div>

      {/* Grid Client Component handles filtering state */}
      <ClientGemGrid initialData={allGems} />
    </div>
  );
}
