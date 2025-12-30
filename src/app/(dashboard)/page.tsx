import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCOP } from "@/lib/utils";
import { Package, DollarSign, TrendingUp, Gem, Plus } from "lucide-react";

async function getStats() {
  const [piezasEnProduccion, totalPiedras, totalCostosFijos] =
    await Promise.all([
      prisma.pieza.count({ where: { estado: "produccion" } }),
      prisma.tipoPiedra.count({ where: { activo: true } }),
      prisma.costoFijo.aggregate({
        _sum: { valor: true },
        where: { activo: true },
      }),
    ]);

  return {
    piezasEnProduccion,
    totalPiedras,
    totalCostosFijos: totalCostosFijos._sum.valor || 0,
  };
}

async function getPiezasRecientes() {
  return prisma.pieza.findMany({
    take: 5,
    orderBy: { fechaCreacion: "desc" },
    include: {
      piedras: {
        include: { tipoPiedra: true },
      },
    },
  });
}

export default async function DashboardPage() {
  const stats = await getStats();
  const piezasRecientes = await getPiezasRecientes();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl tracking-[0.15em] text-black">Dashboard</h1>
          <div className="lebedeva-divider w-24 mt-2" />
        </div>
        <Link href="/piezas/nueva">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Pieza
          </Button>
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-normal text-gray-500 uppercase tracking-widest">
              En Producción
            </CardTitle>
            <Package className="h-5 w-5 text-gray-300" />
          </CardHeader>
          <CardContent>
            <div
              className="text-4xl font-light tracking-[0.15em]"
              style={{ fontFamily: "Cormorant, serif" }}
            >
              {stats.piezasEnProduccion}
            </div>
            <p className="text-xs text-gray-400 mt-1">piezas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-normal text-gray-500 uppercase tracking-widest">
              Tipos de Gemas
            </CardTitle>
            <Gem className="h-5 w-5 text-gray-300" />
          </CardHeader>
          <CardContent>
            <div
              className="text-4xl font-light tracking-[0.15em]"
              style={{ fontFamily: "Cormorant, serif" }}
            >
              {stats.totalPiedras}
            </div>
            <p className="text-xs text-gray-400 mt-1">en catálogo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-normal text-gray-500 uppercase tracking-widest">
              Costos Mensuales
            </CardTitle>
            <DollarSign className="h-5 w-5 text-gray-300" />
          </CardHeader>
          <CardContent>
            <div
              className="text-3xl font-light tracking-[0.15em]"
              style={{ fontFamily: "Cormorant, serif" }}
            >
              {formatCOP(stats.totalCostosFijos)}
            </div>
            <p className="text-xs text-gray-400 mt-1">costos fijos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-normal text-gray-500 uppercase tracking-widest">
              Ganancia del Mes
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-gray-300" />
          </CardHeader>
          <CardContent>
            <div
              className="text-4xl font-light tracking-[0.15em]"
              style={{ fontFamily: "Cormorant, serif" }}
            >
              $0
            </div>
            <p className="text-xs text-gray-400 mt-1">sin ventas registradas</p>
          </CardContent>
        </Card>
      </div>

      {/* Piezas Recientes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Piezas Recientes</CardTitle>
              <div className="lebedeva-divider w-16 mt-2" />
            </div>
            <Link
              href="/piezas"
              className="text-xs uppercase tracking-widest text-gray-500 hover:text-black transition-colors"
            >
              Ver todas →
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {piezasRecientes.length === 0 ? (
            <div className="text-center py-16">
              <Gem className="mx-auto h-16 w-16 text-gray-200" />
              <h3
                className="mt-4 text-xl text-gray-900 tracking-[0.15em]"
                style={{ fontFamily: "Cormorant, serif" }}
              >
                No hay piezas registradas
              </h3>
              <p
                className="mt-2 text-sm text-gray-500"
                style={{ fontFamily: "Comfortaa, sans-serif" }}
              >
                Comienza creando tu primera pieza de joyería artesanal
              </p>
              <div className="mt-8">
                <Link href="/piezas/nueva">
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primera Pieza
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-4 py-3 text-left text-[10px] font-normal text-gray-400 uppercase tracking-widest">
                      Código
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-normal text-gray-400 uppercase tracking-widest">
                      Tipo
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-normal text-gray-400 uppercase tracking-widest">
                      Peso
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-normal text-gray-400 uppercase tracking-widest">
                      Costo Total
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-normal text-gray-400 uppercase tracking-widest">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {piezasRecientes.map((pieza) => (
                    <tr
                      key={pieza.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-4 text-sm">
                        <Link
                          href={`/piezas/${pieza.id}`}
                          className="text-black hover:underline"
                        >
                          {pieza.codigo}
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 capitalize">
                        {pieza.tipoJoya}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {pieza.pesoGramos}g
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {pieza.costoTotal ? formatCOP(pieza.costoTotal) : "—"}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <span
                          className={`inline-flex items-center px-3 py-1 text-[10px] uppercase tracking-widest ${
                            pieza.estado === "produccion"
                              ? "bg-gray-100 text-gray-600"
                              : pieza.estado === "terminada"
                              ? "bg-black text-white"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {pieza.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
