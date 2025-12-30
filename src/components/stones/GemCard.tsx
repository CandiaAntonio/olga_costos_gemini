import { formatCOP } from "@/lib/utils";
import { Gem, Diamond, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface GemCardProps {
  data: any;
  type: "LOT" | "UNIQUE";
}

export function GemCard({ data, type }: GemCardProps) {
  const isUnique = type === "UNIQUE";

  return (
    <Card className="group border border-transparent hover:border-lebedeva-gold/30 transition-all duration-500 bg-white hover:shadow-lg hover:shadow-lebedeva-gold/5">
      <CardHeader className="p-0">
        <div className="relative aspect-square bg-lebedeva-soft-silk flex items-center justify-center p-8 group-hover:bg-white transition-colors">
          {/* Icon / Image Placeholder */}
          {isUnique ? (
            <Diamond className="w-16 h-16 text-lebedeva-gold opacity-80 stroke-1" />
          ) : (
            <Gem className="w-16 h-16 text-gray-300 group-hover:text-lebedeva-black transition-colors stroke-1" />
          )}

          {/* Badges */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            {isUnique && data.certificado && (
              <Badge
                variant="outline"
                className="bg-lebedeva-gold/10 text-lebedeva-gold border-lebedeva-gold/50 rounded-none uppercase tracking-wider text-[10px]"
              >
                <ShieldCheck className="w-3 h-3 mr-1" /> Certified
              </Badge>
            )}
            {data.esNatural && (
              <Badge
                variant="secondary"
                className="bg-white/90 backdrop-blur text-gray-500 rounded-none uppercase tracking-wider text-[10px]"
              >
                Natural
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="mb-4">
          <p className="text-xs font-technical text-gray-400 uppercase tracking-widest mb-1">
            {data.categoria || "Gema"}
          </p>
          <h3 className="font-serif text-xl text-lebedeva-black group-hover:text-lebedeva-gold transition-colors">
            {data.nombre}
          </h3>
        </div>

        {/* Technical Specs Grid */}
        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm font-technical font-light text-gray-600 mb-6">
          {isUnique ? (
            <>
              <div className="flex justify-between border-b border-gray-100 pb-1">
                <span className="text-gray-400">Peso</span>
                <span>{data.pesoCarats}ct</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1">
                <span className="text-gray-400">Color</span>
                <span>{data.color || "-"}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1">
                <span className="text-gray-400">Claridad</span>
                <span>{data.claridad || "-"}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1">
                <span className="text-gray-400">Ref</span>
                <span className="text-xs">{data.codigo || "-"}</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between border-b border-gray-100 pb-1">
                <span className="text-gray-400">Stock</span>
                <span
                  className={
                    (data.stockActual || 0) < 10
                      ? "text-lebedeva-gold font-bold"
                      : ""
                  }
                >
                  {data.stockActual || 0} uds
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1">
                <span className="text-gray-400">Tamaño</span>
                <span>-</span>
              </div>
            </>
          )}
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">
              Precio
            </p>
            <p className="font-serif text-lg text-lebedeva-black">
              {formatCOP(data.precioCop || data.costo || 0)}
              <span className="text-xs text-gray-400 ml-1 font-sans font-normal">
                {isUnique ? "" : "/ ud"}
              </span>
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="hover:bg-transparent hover:text-lebedeva-gold p-0 h-auto font-serif italic text-xs"
          >
            Ver detalles &rarr;
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
