"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { updateStoneStock, updateStonePrice, deleteStone } from "./actions";
import { useRouter } from "next/navigation";
import { StoneFilters } from "@/components/stones/StoneFilters";

interface StoneData {
  id: string;
  type: "LOT" | "UNIQUE";
  name: string;
  category: string | null;
  stock: number | null; // Null for unique if not applicable
  price: number;
  displayId?: string; // Optional pre-calculated ID
  codigo?: string | null; // For uniques
}

interface StonesTableProps {
  initialData: StoneData[];
}

export function StonesTable({ initialData }: StonesTableProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Filter State
  const [currentSearch, setCurrentSearch] = useState("");
  const [currentCategory, setCurrentCategory] = useState("all");
  const [currentTrackingType, setCurrentTrackingType] = useState("all");
  const [isLowStock, setIsLowStock] = useState(false);

  const getDisplayId = (stone: StoneData) => {
    if (stone.type === "UNIQUE" && stone.codigo) return stone.codigo;
    const prefix = stone.type === "LOT" ? "L" : "U";
    // Generate a consistent pseudo-ID if real one missing
    const nameCode = stone.name.slice(0, 2).toUpperCase();
    const uniqueSuffix = stone.id.slice(-3).toUpperCase();
    return `${prefix}-${nameCode}-${uniqueSuffix}`;
  };

  const handleStockUpdate = async (
    id: string,
    type: "LOT" | "UNIQUE",
    val: string
  ) => {
    const num = parseInt(val, 10);
    if (isNaN(num)) return;
    await updateStoneStock(id, type, num);
  };

  const handlePriceUpdate = async (
    id: string,
    type: "LOT" | "UNIQUE",
    val: string
  ) => {
    const num = parseFloat(val);
    if (isNaN(num)) return;
    await updateStonePrice(id, type, num);
  };

  const handleDelete = async (id: string, type: "LOT" | "UNIQUE") => {
    if (!confirm("¿Estás seguro de retirar esta piedra del inventario?"))
      return;
    setLoadingId(id);
    await deleteStone(id, type);
    setLoadingId(null);
  };

  // Helper for Badge styling
  const getBadgeVariant = (cat: string | null) => {
    const lower = cat?.toLowerCase() || "";
    if (lower.includes("preciosa") && !lower.includes("semi")) return "default"; // Gold/Dark usually
    if (lower.includes("sintética")) return "outline";
    return "secondary";
  };

  // Filtering Logic
  const filteredData = initialData.filter((stone) => {
    // 1. Search (Name or ID)
    const searchLower = currentSearch.toLowerCase();
    const matchesSearch =
      stone.name.toLowerCase().includes(searchLower) ||
      getDisplayId(stone).toLowerCase().includes(searchLower);

    // 2. Category
    const matchesCategory =
      currentCategory === "all" ||
      (stone.category && stone.category.toLowerCase() === currentCategory);

    // 3. Tracking Type
    const matchesType =
      currentTrackingType === "all" || stone.type === currentTrackingType;

    // 4. Low Stock (Only applies to LOTs usually, or low quantity)
    // Assuming Low Stock means stock < 10 for LOTs. unique always has stock 1 so maybe irrelevant or treat as ok.
    // Let's say Low Stock filters for LOTs with < 10.
    const matchesLowStock =
      !isLowStock || (stone.type === "LOT" && (stone.stock || 0) < 10);

    return matchesSearch && matchesCategory && matchesType && matchesLowStock;
  });

  return (
    <div className="w-full">
      <StoneFilters
        currentSearch={currentSearch}
        currentCategory={currentCategory}
        currentTrackingType={currentTrackingType}
        isLowStock={isLowStock}
        onSearchChange={setCurrentSearch}
        onCategoryChange={setCurrentCategory}
        onTrackingTypeChange={setCurrentTrackingType}
        onLowStockChange={setIsLowStock}
      />

      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b-[0.5px] border-[#F3F4F6] text-xs uppercase tracking-widest text-gray-500 font-medium">
              <th className="py-4 px-4 sm:px-6">ID</th>
              <th className="py-4 px-4 sm:px-6 w-1/3">Nombre</th>
              <th className="py-4 px-4 sm:px-6">Categoría</th>
              <th className="py-4 px-4 sm:px-6 text-center">Stock</th>
              <th className="py-4 px-4 sm:px-6 text-right">Precio (COP)</th>
              <th className="py-4 px-4 sm:px-6 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((stone) => (
              <tr
                key={stone.id}
                onClick={() => router.push(`/inventario/piedras/${stone.id}`)}
                className={`border-b-[0.5px] border-[#F3F4F6] hover:bg-[#FAFAFA] transition-colors group cursor-pointer ${
                  loadingId === stone.id ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                <td className="py-4 px-4 sm:px-6 font-technical text-sm text-gray-400">
                  {getDisplayId(stone)}
                </td>
                <td className="py-4 px-4 sm:px-6">
                  <span className="font-serif text-lg text-lebedeva-black">
                    {stone.name}
                  </span>
                </td>
                <td className="py-4 px-4 sm:px-6">
                  <Badge
                    variant={getBadgeVariant(stone.category) as any}
                    className="rounded-none font-normal tracking-wide"
                  >
                    {stone.category || "General"}
                  </Badge>
                </td>
                <td className="py-4 px-4 sm:px-6 text-center">
                  {stone.type === "LOT" ? (
                    <Input
                      type="number"
                      defaultValue={stone.stock || 0}
                      className="w-20 mx-auto text-center h-8 rounded-none border-gray-200 focus:border-lebedeva-gold focus:ring-0 bg-transparent"
                      onClick={(e) => e.stopPropagation()}
                      onBlur={(e) =>
                        handleStockUpdate(stone.id, stone.type, e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.currentTarget.blur();
                        }
                      }}
                    />
                  ) : (
                    <span className="text-gray-300 text-sm">—</span>
                  )}
                </td>
                <td className="py-4 px-4 sm:px-6 text-right font-technical">
                  <div className="relative inline-block w-32">
                    <Input
                      type="number"
                      defaultValue={stone.price}
                      className="w-full text-right h-8 rounded-none border-transparent hover:border-gray-200 focus:border-lebedeva-gold focus:ring-0 bg-transparent pr-1"
                      onClick={(e) => e.stopPropagation()}
                      onBlur={(e) =>
                        handlePriceUpdate(stone.id, stone.type, e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.currentTarget.blur();
                        }
                      }}
                    />
                  </div>
                </td>
                <td className="py-4 px-4 sm:px-6 text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-none hover:bg-red-50 hover:text-red-500 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(stone.id, stone.type);
                    }}
                    disabled={loadingId === stone.id}
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.2} />
                  </Button>
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-400">
                  No se encontraron piedras.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
