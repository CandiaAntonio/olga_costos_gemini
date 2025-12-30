"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Box, Sparkles } from "lucide-react";

// Define the form data type
interface GemFormData {
  nombre: string;
  precioCop: string;
  descripcion: string;
  esNatural: boolean;
  categoria: "preciosa" | "semipreciosa" | "sintética";
  trackingType: "LOT" | "UNIQUE";
  // Unique specific
  codigo?: string;
  pesoCarats?: string;
  tamano?: string;
  claridad?: string;
  color?: string;
  certificado?: string;
  origen?: string;
  // Lot specific
  stockActual?: string;
}

export function NewGemForm() {
  const router = useRouter();
  const [step, setStep] = useState<"selection" | "form">("selection");
  const [type, setType] = useState<"LOT" | "UNIQUE">("LOT");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<GemFormData>({
    nombre: "",
    precioCop: "",
    descripcion: "",
    esNatural: true,
    categoria: "preciosa",
    trackingType: "LOT",
    pesoCarats: "",
    tamano: "",
    claridad: "",
    color: "",
  });

  // Handle selection
  const handleSelect = (selectedType: "LOT" | "UNIQUE") => {
    setType(selectedType);
    setFormData((prev) => ({ ...prev, trackingType: selectedType }));
    setStep("form");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Implement server action or API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("Submitting:", formData);
    setLoading(false);
    router.push("/inventario/piedras");
    router.refresh();
  };

  if (step === "selection") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Card
          className="cursor-pointer hover:border-lebedeva-gold transition-all duration-300 group relative overflow-hidden"
          onClick={() => handleSelect("LOT")}
        >
          <div className="absolute inset-0 bg-lebedeva-soft-silk opacity-0 group-hover:opacity-10 transition-opacity" />
          <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-4">
            <div className="p-4 rounded-full bg-gray-50 mb-2 group-hover:scale-110 transition-transform">
              <Box className="w-12 h-12 text-gray-400 group-hover:text-lebedeva-gold transition-colors" />
            </div>
            <h3 className="text-2xl font-serif text-lebedeva-black">
              Lote Calibrado
            </h3>
            <p className="text-gray-500 font-technical font-light">
              Piedras por cantidad, calibradas para producción en serie.
              <span className="block mt-2 text-xs uppercase tracking-widest text-lebedeva-gold">
                Inventario por Stock
              </span>
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:border-lebedeva-gold transition-all duration-300 group relative overflow-hidden"
          onClick={() => handleSelect("UNIQUE")}
        >
          <div className="absolute inset-0 bg-lebedeva-soft-silk opacity-0 group-hover:opacity-10 transition-opacity" />
          <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-4">
            <div className="p-4 rounded-full bg-gray-50 mb-2 group-hover:scale-110 transition-transform">
              <Sparkles className="w-12 h-12 text-gray-400 group-hover:text-lebedeva-gold transition-colors" />
            </div>
            <h3 className="text-2xl font-serif text-lebedeva-black">
              Gema Única
            </h3>
            <p className="text-gray-500 font-technical font-light">
              Pieza única certificada con características específicas.
              <span className="block mt-2 text-xs uppercase tracking-widest text-lebedeva-gold">
                Seguimiento Individual (4Cs)
              </span>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => setStep("selection")}
          className="p-0 hover:bg-transparent hover:text-lebedeva-gold transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div>
          <h2 className="text-2xl font-serif text-lebedeva-black">
            {type === "LOT" ? "Nuevo Lote Calibrado" : "Nueva Gema Natural"}
          </h2>
          <p className="text-gray-400 font-technical text-sm">
            Ingresa los detalles técnicos
          </p>
        </div>
      </div>

      <Card className="border-none shadow-none bg-white/50 backdrop-blur-sm">
        <CardContent className="p-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Common Fields */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="nombre"
                    className="text-xs uppercase tracking-wider text-gray-500"
                  >
                    Nombre / Referencia
                  </Label>
                  <Input
                    id="nombre"
                    placeholder={
                      type === "LOT"
                        ? "Ej: Esmeralda 3mm"
                        : "Ej: Esmeralda Colombiana 2ct"
                    }
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    className="border-gray-200 focus:border-lebedeva-gold rounded-none bg-transparent"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="categoria"
                    className="text-xs uppercase tracking-wider text-gray-500"
                  >
                    Categoría
                  </Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(v: any) =>
                      setFormData({ ...formData, categoria: v })
                    }
                  >
                    <SelectTrigger className="border-gray-200 focus:border-lebedeva-gold rounded-none bg-transparent">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preciosa">Preciosa</SelectItem>
                      <SelectItem value="semipreciosa">Semipreciosa</SelectItem>
                      <SelectItem value="sintética">Sintética</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="descripcion"
                  className="text-xs uppercase tracking-wider text-gray-500"
                >
                  Descripción
                </Label>
                <Textarea
                  id="descripcion"
                  placeholder="Detalles adicionales..."
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcion: e.target.value })
                  }
                  className="border-gray-200 focus:border-lebedeva-gold rounded-none bg-transparent min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="precio"
                    className="text-xs uppercase tracking-wider text-gray-500"
                  >
                    Precio (COP)
                  </Label>
                  <Input
                    id="precio"
                    type="number"
                    placeholder="0"
                    value={formData.precioCop}
                    onChange={(e) =>
                      setFormData({ ...formData, precioCop: e.target.value })
                    }
                    className="border-gray-200 focus:border-lebedeva-gold rounded-none bg-transparent"
                    required
                  />
                  <p className="text-[10px] text-gray-400">
                    {type === "UNIQUE"
                      ? "Precio total de la pieza"
                      : "Precio promedio por unidad"}
                  </p>
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Switch id="natural" checked={formData.esNatural} />
                  <Label
                    htmlFor="natural"
                    className="text-sm font-technical text-gray-600"
                  >
                    Es Natural
                  </Label>
                </div>
              </div>

              {type === "LOT" && (
                <div className="space-y-2">
                  <Label
                    htmlFor="stockActual"
                    className="text-xs uppercase tracking-wider text-gray-500"
                  >
                    Cantidad (Stock)
                  </Label>
                  <Input
                    id="stockActual"
                    type="number"
                    placeholder="0"
                    value={formData.stockActual || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, stockActual: e.target.value })
                    }
                    className="border-gray-200 focus:border-lebedeva-gold rounded-none bg-transparent"
                  />
                  <p className="text-[10px] text-lebedeva-gold">
                    * Se sumará al inventario existente si el nombre coincide.
                  </p>
                </div>
              )}
            </div>

            <div className="lebedeva-divider" />

            {/* Specific Fields */}
            {type === "UNIQUE" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-sm font-serif text-lebedeva-gold tracking-widest uppercase mb-4">
                  Certificación & 4Cs
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="carats"
                      className="text-xs uppercase tracking-wider text-gray-500"
                    >
                      Peso (Carats)
                    </Label>
                    <Input
                      id="carats"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.pesoCarats}
                      onChange={(e) =>
                        setFormData({ ...formData, pesoCarats: e.target.value })
                      }
                      className="border-gray-200 focus:border-lebedeva-gold rounded-none bg-transparent"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="color"
                      className="text-xs uppercase tracking-wider text-gray-500"
                    >
                      Color
                    </Label>
                    <Input
                      id="color"
                      placeholder="Ej: Vivid Green"
                      value={formData.color}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
                      }
                      className="border-gray-200 focus:border-lebedeva-gold rounded-none bg-transparent"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="clarity"
                      className="text-xs uppercase tracking-wider text-gray-500"
                    >
                      Claridad
                    </Label>
                    <Input
                      id="clarity"
                      placeholder="Ej: VVS1"
                      value={formData.claridad}
                      onChange={(e) =>
                        setFormData({ ...formData, claridad: e.target.value })
                      }
                      className="border-gray-200 focus:border-lebedeva-gold rounded-none bg-transparent"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="origen"
                      className="text-xs uppercase tracking-wider text-gray-500"
                    >
                      Origen
                    </Label>
                    <Input
                      id="origen"
                      placeholder="Ej: Colombia"
                      value={formData.origen || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          origen: e.target.value,
                        })
                      }
                      className="border-gray-200 focus:border-lebedeva-gold rounded-none bg-transparent"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="cert"
                      className="text-xs uppercase tracking-wider text-gray-500"
                    >
                      Certificado ID
                    </Label>
                    <Input
                      id="cert"
                      placeholder="Ej: GIA-123456"
                      value={formData.certificado}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          certificado: e.target.value,
                        })
                      }
                      className="border-gray-200 focus:border-lebedeva-gold rounded-none bg-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-6">
              <Button
                type="submit"
                className="w-full bg-lebedeva-black hover:bg-lebedeva-gold text-white rounded-none uppercase tracking-widest h-12"
                disabled={loading}
              >
                {loading ? "Guardando..." : "Guardar Joya"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
