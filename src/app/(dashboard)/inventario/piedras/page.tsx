import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { StonesTable } from "./stones-table";

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
  const uniqueStones = await prisma.piedraIndividual.findMany({
    where: {
      estado: "disponible",
    },
    include: {
      tipoPiedra: true,
    },
    orderBy: { creadoEn: "desc" },
  });

  // Normalize data for the table
  const allStones = [
    ...lots.map((l) => ({
      id: l.id,
      type: "LOT" as const,
      name: l.nombre,
      category: l.categoria,
      stock: l.stockActual,
      price: l.precioCop,
      displayId: undefined, // Will be generated client-side if needed, since lots don't have code
    })),
    ...uniqueStones.map((u) => ({
      id: u.id,
      type: "UNIQUE" as const,
      name: u.tipoPiedra.nombre,
      category: u.tipoPiedra.categoria,
      stock: null, // Unique stones don't use 'stock' count in the same way (implied 1)
      price: u.costo, // Mapping cost to price for display
      codigo: u.codigo,
      // Details
      carats: u.carats,
      clarity: u.clarity,
      color: u.color,
      origin: u.origin,
      certificate: u.certificateNumber,
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

      {/* Stones Table */}
      <StonesTable initialData={allStones} />
    </div>
  );
}
