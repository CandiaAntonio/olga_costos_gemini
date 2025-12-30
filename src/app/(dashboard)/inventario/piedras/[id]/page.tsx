import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { DetailView } from "./client";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function StonePage({ params }: PageProps) {
  // 1. Try to find as a Specific Stone (Unique Item)
  const individual = await prisma.piedraIndividual.findUnique({
    where: { id: params.id },
    include: { tipoPiedra: true },
  });

  if (individual) {
    return <DetailView viewType="UNIQUE_ITEM" data={individual} />;
  }

  // 2. Try to find as a TipoPiedra (Lot or Category)
  const type = await prisma.tipoPiedra.findUnique({
    where: { id: params.id },
    include: {
      stockMovements: { orderBy: { creadoEn: "desc" } },
      piezaPiedras: {
        include: { pieza: true },
        orderBy: { pieza: { fechaCreacion: "desc" } },
      },
      piedrasIndividuales: true, // For categories
    },
  });

  if (type) {
    const isLot = type.trackingType === "LOT";
    return <DetailView viewType={isLot ? "LOT" : "UNIQUE_TYPE"} data={type} />;
  }

  return notFound();
}
