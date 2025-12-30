import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCOP } from "@/lib/utils";
import { Plus } from "lucide-react";

async function getPiezas() {
  return prisma.pieza.findMany({
    orderBy: { fechaCreacion: "desc" },
    include: {
      piedras: {
        include: { tipoPiedra: true },
      },
    },
  });
}

export default async function PiezasPage() {
  const piezas = await getPiezas();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-3xl font-medium text-black tracking-wider"
            style={{ fontFamily: "Cormorant, serif" }}
          >
            Piezas
          </h1>
          <p
            className="text-gray-500 font-light mt-1"
            style={{ fontFamily: "Comfortaa, sans-serif" }}
          >
            Gestiona tus piezas de joyería
          </p>
        </div>
        <Link href="/piezas/nueva">
          <Button className="rounded-none uppercase tracking-widest bg-black text-white hover:bg-gray-800">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Pieza
          </Button>
        </Link>
      </div>

      {piezas.length === 0 ? (
        <Card className="rounded-none border-[0.5px] border-gray-100 shadow-none bg-white">
          <CardContent className="py-24 flex flex-col items-center justify-center text-center">
            <div className="relative w-32 h-32 opacity-50 grayscale mb-6">
              <Image
                src="https://optim.tildacdn.com/tild3961-6237-4232-b431-396131393433/-/resize/604x/-/format/webp/lebedeva-logo-final-.png.webp"
                alt="Lebedeva Logo"
                fill
                className="object-contain"
              />
            </div>
            <h3
              className="text-xl font-medium text-black tracking-wide mb-2"
              style={{ fontFamily: "Cormorant, serif" }}
            >
              No hay piezas registradas
            </h3>
            <p
              className="text-sm text-gray-400 font-light max-w-sm mx-auto mb-8"
              style={{ fontFamily: "Comfortaa, sans-serif" }}
            >
              Comienza tu colección creando tu primera pieza de alta joyería.
            </p>
            <Link href="/piezas/nueva">
              <Button
                variant="outline"
                className="rounded-none border-gray-200 uppercase tracking-widest hover:border-lebedeva-gold hover:text-lebedeva-gold transition-colors"
              >
                Crear Primera Pieza
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {piezas.map((pieza) => (
            <Link
              key={pieza.id}
              href={`/piezas/${pieza.id}`}
              className="group block h-full"
            >
              <Card className="h-full rounded-none border-[0.5px] border-gray-100 shadow-none bg-white transition-colors duration-300 group-hover:border-lebedeva-gold/30">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p
                        className="text-xs text-gray-400 uppercase tracking-widest mb-1"
                        style={{ fontFamily: "Comfortaa, sans-serif" }}
                      >
                        {pieza.tipoJoya}
                      </p>
                      <CardTitle className="text-2xl text-black group-hover:text-lebedeva-gold transition-colors">
                        {pieza.codigo}
                      </CardTitle>
                    </div>
                    <span
                      className={`inline-flex px-2 py-1 text-[10px] uppercase tracking-wider border ${
                        pieza.estado === "produccion"
                          ? "border-yellow-200 text-yellow-700 bg-yellow-50/50"
                          : pieza.estado === "terminada"
                          ? "border-green-200 text-green-700 bg-green-50/50"
                          : "border-blue-200 text-blue-700 bg-blue-50/50"
                      }`}
                    >
                      {pieza.estado}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pieza.nombre && (
                      <div className="min-h-[1.5em]">
                        <p
                          className="text-sm text-gray-600 font-light line-clamp-2"
                          style={{ fontFamily: "Comfortaa, sans-serif" }}
                        >
                          {pieza.nombre}
                        </p>
                      </div>
                    )}

                    <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                      <div
                        className="text-xs text-gray-400 font-light"
                        style={{ fontFamily: "Comfortaa, sans-serif" }}
                      >
                        {pieza.pesoGramos}g
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">
                          Costo Total
                        </p>
                        <p
                          className="text-lg font-medium text-lebedeva-gold"
                          style={{ fontFamily: "Cormorant, serif" }}
                        >
                          {pieza.costoTotal ? formatCOP(pieza.costoTotal) : "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
