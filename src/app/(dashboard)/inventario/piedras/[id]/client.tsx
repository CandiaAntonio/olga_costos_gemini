"use client";

import { useRouter } from "next/navigation";
import { formatCOP } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // verify if badge exists, assuming yes
import { deleteStone } from "../actions";

interface DetailViewProps {
  viewType: "LOT" | "UNIQUE_ITEM" | "UNIQUE_TYPE";
  data: any;
}

export function DetailView({ viewType, data }: DetailViewProps) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("¿Está seguro de archivar este ítem?")) return;

    // Determine the type argument for the server action
    // If viewing a Unique Stone Item, we delete specific item.
    // If viewing a Lot Type, we delete (archive) the Type.
    const actionType = viewType === "UNIQUE_ITEM" ? "UNIQUE" : "LOT";

    // data.id is the ID of the entity in view
    const result = await deleteStone(data.id, actionType);

    if (result.success) {
      router.push("/inventario/piedras");
      router.refresh();
    } else {
      alert("Error al eliminar: " + result.error);
    }
  };

  if (viewType === "LOT") {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <Header
          title={data.nombre}
          subtitle="Lote Calibrado"
          badge="LOT"
          onDelete={handleDelete}
        />

        <div className="grid gap-8 md:grid-cols-2">
          <Card className="rounded-none border-[0.5px] border-gray-200 shadow-none">
            <CardHeader>
              <CardTitle className="font-serif tracking-wider text-lg">
                Resumen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 font-light text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Stock Actual</span>
                <span>{data.stockActual} un.</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Precio Promedio</span>
                <span>{formatCOP(data.precioCop || 0)}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Tamaño</span>
                <span>{data.sizeMm ? `${data.sizeMm} mm` : "-"}</span>
              </div>
            </CardContent>
          </Card>

          <StockHistory
            movements={data.stockMovements}
            usage={data.piezaPiedras}
          />
        </div>
      </div>
    );
  }

  if (viewType === "UNIQUE_ITEM") {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <Header
          title={`${data.tipoPiedra?.nombre} ${
            data.codigo ? `- ${data.codigo}` : ""
          }`}
          subtitle="Piedra Única Natural"
          badge="UNIQUE"
          onDelete={handleDelete}
        />

        <div className="grid gap-8 md:grid-cols-3">
          {/* 4Cs & Details */}
          <Card className="md:col-span-2 rounded-none border-[0.5px] border-gray-200 shadow-none">
            <CardHeader>
              <CardTitle className="font-serif tracking-wider text-lg">
                Especificaciones Gemológicas
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-8 gap-y-4 font-light text-sm">
              <DetailRow
                label="Peso (Carats)"
                value={data.carats ? `${data.carats} ct` : "-"}
              />
              <DetailRow label="Claridad" value={data.clarity || "-"} />
              <DetailRow label="Color" value={data.color || "-"} />
              <DetailRow label="Corte/Forma" value={data.shape || "-"} />
              <DetailRow label="Origen" value={data.origin || "-"} />
              <DetailRow
                label="Tratamiento"
                value={data.treatment || "Ninguno"}
              />
              <DetailRow
                label="Certificado"
                value={data.certificateNumber || "No certificado"}
              />
              <DetailRow label="Costo" value={formatCOP(data.costo || 0)} />
              <DetailRow label="Estado" value={data.estado} />
              <DetailRow label="Ubicación" value={data.ubicacion || "-"} />
            </CardContent>
          </Card>

          {/* Certificate Image */}
          <Card className="rounded-none border-[0.5px] border-gray-200 shadow-none bg-gray-50/50">
            <CardHeader>
              <CardTitle className="font-serif tracking-wider text-lg">
                Certificado
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center min-h-[200px]">
              {data.certificateImageUrl ? (
                <img
                  src={data.certificateImageUrl}
                  alt="Certificado"
                  className="w-full h-auto object-contain border border-gray-100"
                />
              ) : (
                <div className="text-gray-400 text-xs text-center border p-8 border-dashed border-gray-300">
                  Sin Imagen de Certificado
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (viewType === "UNIQUE_TYPE") {
    return (
      <div className="space-y-8">
        <Header
          title={data.nombre}
          subtitle="Categoría de Piedras Únicas"
          badge="CATEGORY"
          onDelete={handleDelete}
        />
        <div className="p-4 border border-gray-200 text-gray-500 rounded-none bg-white">
          <p>
            Esta es una categoría que contiene{" "}
            {data.piedrasIndividuales?.length || 0} piedras únicas.
          </p>
          <p>
            Seleccione una piedra individual desde el inventario principal para
            ver sus detalles.
          </p>
        </div>
      </div>
    );
  }

  return null;
}

function Header({
  title,
  subtitle,
  badge,
  onDelete,
}: {
  title: string;
  subtitle: string;
  badge: string;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 border-gray-100">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-serif text-black tracking-wide">
            {title}
          </h1>
          <Badge
            variant="outline"
            className="rounded-none text-xs tracking-widest uppercase"
          >
            {badge}
          </Badge>
        </div>
        <p className="text-gray-500 font-light mt-1 text-sm">{subtitle}</p>
      </div>
      <Button
        variant="outline"
        onClick={onDelete}
        className="rounded-none border-red-200 text-red-700 hover:bg-red-50 hover:text-red-900 uppercase text-xs tracking-widest"
      >
        Archivar
      </Button>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex flex-col border-b border-gray-50 pb-2 last:border-0">
      <span className="text-xs text-gray-400 uppercase tracking-wider">
        {label}
      </span>
      <span className="text-gray-900 font-medium">{value}</span>
    </div>
  );
}

function StockHistory({
  movements,
  usage,
}: {
  movements: any[];
  usage: any[];
}) {
  // Merge and sort movements and usage
  const log = [
    ...(movements || []).map((m) => ({
      date: new Date(m.creadoEn),
      type: m.tipoMovimiento,
      qty: m.cantidad,
      detail: m.notas || "Ajuste de Stock",
    })),
    ...(usage || []).map((u) => ({
      date: new Date(u.pieza?.fechaCreacion || new Date()),
      type: "USO_PIEZA",
      qty: -u.cantidad,
      detail: `Pieza: ${u.pieza?.codigo || "Desconocida"}`,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <Card className="rounded-none border-[0.5px] border-gray-200 shadow-none">
      <CardHeader>
        <CardTitle className="font-serif tracking-wider text-lg">
          Historial de Movimientos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {log.length === 0 ? (
          <p className="text-gray-400 text-sm font-light">
            No hay movimientos registrados.
          </p>
        ) : (
          <div className="space-y-4">
            {log.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center text-sm border-b border-gray-50 pb-2 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium text-gray-900">{item.type}</p>
                  <p className="text-gray-500 text-xs">{item.detail}</p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-mono ${
                      item.qty > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {item.qty > 0 ? "+" : ""}
                    {item.qty}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {item.date.toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
