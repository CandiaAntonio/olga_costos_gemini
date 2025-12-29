import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCOP } from '@/lib/utils'
import { Gem, Plus } from 'lucide-react'

async function getPiedras() {
  return prisma.tipoPiedra.findMany({
    where: { activo: true },
    orderBy: { nombre: 'asc' }
  })
}

export default async function PiedrasPage() {
  const piedras = await getPiedras()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventario de Piedras</h1>
          <p className="text-gray-500">Gestiona los tipos de piedras y sus precios</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Piedra
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {piedras.map((piedra) => (
          <Card key={piedra.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gem className={`h-5 w-5 ${piedra.categoria === 'preciosa'
                      ? 'text-purple-500'
                      : piedra.categoria === 'semipreciosa'
                        ? 'text-blue-500'
                        : 'text-gray-400'
                    }`} />
                  <CardTitle className="text-lg">{piedra.nombre}</CardTitle>
                </div>
                <span className={`text-sm px-3 py-1 rounded-full ${piedra.esNatural
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                  }`}>
                  {piedra.esNatural ? 'Natural' : 'Sintética'}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Precio por unidad</span>
                <span className="text-xl font-bold text-gray-900">
                  {formatCOP(piedra.precioCop)}
                </span>
              </div>
              {piedra.categoria && (
                <p className="text-sm text-gray-500 mt-2 capitalize">
                  Categoría: {piedra.categoria}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {piedras.length === 0 && (
        <div className="text-center py-12">
          <Gem className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No hay piedras</h3>
          <p className="mt-1 text-sm text-gray-500">
            Comienza agregando tipos de piedras al inventario.
          </p>
        </div>
      )}
    </div>
  )
}
