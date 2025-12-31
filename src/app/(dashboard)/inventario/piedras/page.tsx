import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { StonesTable } from "./stones-table";

// Server Component
export default async function PiedrasPage() {
  // Fetch both sets of data
  // 1. Lots (TipoPiedra where inventoryType = LOT)
  // Note: Schema doesn't have explicit color/clarity/shape on TipoPiedra yet unless added in previous steps.
  // Assuming standard fields: sizeMm exists.
  // The user requested updating StonesTable to show Cut, Color, Clarity.
  // If these fields are missing on TipoPiedra (Lots), they might be N/A or we need to check schema.
  // From schema.prisma:
  // TipoPiedra has: sizeMm (Float). No shape/color/clarity explicitly for the TYPE itself unless description or new fields.
  // PiedraIndividual has: shape, color, clarity, carats.

  // Wait, the user prompt said "Update StonesTable... Add columns... for Size (for lots) / Carats (for unique)".
  // And "Cut (Shape), Color, Clarity".
  // Let's check schema again.
  // TipoPiedra: nombre, precioCop, esNatural, categoria, trackingType, stockActual, sizeMm, descripcion.
  // PiedraIndividual: carats, clarity, color, shape, treatment, origin...

  // So for LOTS (TipoPiedra), "Cut", "Color", "Clarity" might not be stored directly?
  // Usually Lots are defined by their properties. "Round Diamond Lot".
  // If they aren't in schema, I might have to pass null or assume they are part of the name/description.
  // BUT, the user asked to "Add columns for 'Cut' (Shape)".
  // I'll map what I can.

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
      price: l.precioCop, // Unit Price
      displayId: undefined,
      // Mapping details for Lot
      size: l.sizeMm ? `${l.sizeMm} mm` : null,
      shape: null, // Not in TipoPiedra schema
      color: null, // Not in TipoPiedra schema
      clarity: null, // Not in TipoPiedra schema
      // We could parse them from name if strictly needed, but better to leave null if not in DB.
    })),
    ...uniqueStones.map((u) => ({
      id: u.id,
      type: "UNIQUE" as const,
      name: u.tipoPiedra.nombre,
      category: u.tipoPiedra.categoria,
      stock: null,
      price: u.costo, // Total Cost
      codigo: u.codigo,
      // Details
      carats: u.carats,
      clarity: u.clarity,
      color: u.color,
      origin: u.origin,
      certificate: u.certificateNumber,
      shape: u.shape,
    })),
  ];

  return (
    <div className="space-y-8 pb-12 bg-[#FAFAFA] min-h-screen">
      {/* Header */}
      <div className="relative border-b border-gray-100 pb-6 overflow-hidden">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-serif text-lebedeva-black mb-2">
              Gemas
            </h1>
            <p className="text-gray-400 font-technical font-light">
              Gestión de inventario de piedras
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/inventario/piedras/nueva">
              <Button
                size="sm"
                className="bg-lebedeva-black hover:bg-lebedeva-gold text-white rounded-none uppercase tracking-widest text-[10px] font-serif shadow-md hover:shadow-lg h-9 px-3"
              >
                <Plus className="h-3 w-3 mr-2" />
                Nueva Piedra / Lote
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stones Table */}
      <StonesTable initialData={allStones} />
    </div>
  );
}
