"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowUpDown } from "lucide-react";
import { updateStoneStock, updateStonePrice, deleteStone } from "./actions";
import { useRouter } from "next/navigation";
import { StoneFilters } from "@/components/stones/StoneFilters";
import { cn } from "@/lib/utils";

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

type SortKey = "stock" | "price" | null;
type SortDirection = "asc" | "desc";

export function StonesTable({ initialData }: StonesTableProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Filter State
  const [currentSearch, setCurrentSearch] = useState("");
  const [currentCategory, setCurrentCategory] = useState("all"); // 'all' | 'natural' | 'synthetic'
  const [currentTrackingType, setCurrentTrackingType] = useState("all");
  const [currentStoneType, setCurrentStoneType] = useState("all");
  const [isLowStock, setIsLowStock] = useState(false);

  // Price Editing State
  const [editablePrices, setEditablePrices] = useState<Set<string>>(new Set());

  // Sorting State
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: SortDirection;
  }>({ key: null, direction: "asc" });

  const getDisplayId = (stone: StoneData) => {
    if (stone.type === "UNIQUE" && stone.codigo) return stone.codigo;
    const prefix = stone.type === "LOT" ? "L" : "U";
    const nameCode = stone.name.slice(0, 2).toUpperCase();
    const uniqueSuffix = stone.id.slice(-3).toUpperCase();
    return `${prefix}-${nameCode}-${uniqueSuffix}`;
  };

  // Derive unique stone names for the filter dropdown
  const uniqueStoneNames = useMemo(() => {
    const names = new Set(initialData.map((s) => s.name));
    return Array.from(names).sort();
  }, [initialData]);

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

  const togglePriceEdit = (id: string, e: React.SyntheticEvent) => {
    e.stopPropagation();
    const newEditable = new Set(editablePrices);
    if (newEditable.has(id)) {
      newEditable.delete(id);
    } else {
      newEditable.add(id);
    }
    setEditablePrices(newEditable);
  };

  const handleDelete = async (id: string, type: "LOT" | "UNIQUE") => {
    if (!confirm("¿Estás seguro de retirar esta piedra del inventario?"))
      return;
    setLoadingId(id);
    await deleteStone(id, type);
    setLoadingId(null);
  };

  const handleSort = (key: SortKey) => {
    if (!key) return;
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getBadgeVariant = (cat: string | null) => {
    const lower = cat?.toLowerCase() || "";
    if (lower.includes("preciosa") && !lower.includes("semi")) return "default";
    if (lower.includes("sintética")) return "outline";
    return "secondary";
  };

  // Processing Data: Filter -> Sort
  const processedData = useMemo(() => {
    let data = [...initialData];

    // 1. Filter
    data = data.filter((stone) => {
      // Search
      const searchLower = currentSearch.toLowerCase();
      const matchesSearch =
        stone.name.toLowerCase().includes(searchLower) ||
        getDisplayId(stone).toLowerCase().includes(searchLower);

      // Category (Natural vs Synthetic)
      const catLower = stone.category?.toLowerCase() || "";
      const isSynthetic = catLower.includes("sintética");
      let matchesCategory = true;
      if (currentCategory === "natural") {
        matchesCategory = !isSynthetic; // Includes Preciosa & Semipreciosa
      } else if (currentCategory === "synthetic") {
        matchesCategory = isSynthetic;
      }

      // Stone Type
      const matchesStoneType =
        currentStoneType === "all" || stone.name === currentStoneType;

      // Tracking Type
      const matchesType =
        currentTrackingType === "all" || stone.type === currentTrackingType;

      return (
        matchesSearch && matchesCategory && matchesStoneType && matchesType
      );
    });

    // 2. Sort
    if (sortConfig.key) {
      data.sort((a, b) => {
        const valA = a[sortConfig.key!] ?? 0; // Treat null as 0 for sorting
        const valB = b[sortConfig.key!] ?? 0;

        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [
    initialData,
    currentSearch,
    currentCategory,
    currentStoneType,
    currentTrackingType,
    sortConfig,
  ]);

  return (
    <div className="w-full">
      <StoneFilters
        currentSearch={currentSearch}
        currentCategory={currentCategory}
        currentStoneType={currentStoneType}
        currentTrackingType={currentTrackingType}
        stoneTypes={uniqueStoneNames}
        onSearchChange={setCurrentSearch}
        onCategoryChange={setCurrentCategory}
        onStoneTypeChange={setCurrentStoneType}
        onTrackingTypeChange={setCurrentTrackingType}
        isLowStock={isLowStock}
        onLowStockChange={setIsLowStock}
      />

      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b-[0.5px] border-[#F3F4F6] text-xs uppercase tracking-widest text-gray-500 font-medium">
              <th className="py-4 px-4 sm:px-6">ID</th>
              <th className="py-4 px-4 sm:px-6 w-1/3">Nombre</th>
              <th className="py-4 px-4 sm:px-6">Categoría</th>
              <th
                className="py-4 px-4 sm:px-6 text-center cursor-pointer hover:text-gray-800 transition-colors group select-none"
                onClick={() => handleSort("stock")}
              >
                <div className="flex items-center justify-center gap-1">
                  Stock
                  <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </th>
              <th
                className="py-4 px-4 sm:px-6 text-right cursor-pointer hover:text-gray-800 transition-colors group select-none"
                onClick={() => handleSort("price")}
              >
                <div className="flex items-center justify-end gap-1">
                  Precio (COP)
                  <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </th>
              <th className="py-4 px-4 sm:px-6 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {processedData.map((stone) => (
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
                      className={cn(
                        "w-20 mx-auto text-center h-8 rounded-none border-gray-200 focus:border-lebedeva-gold focus:ring-0 bg-transparent transition-colors",
                        // Low stock intelligence: Highlight if stock < 10
                        (stone.stock || 0) < 10
                          ? "text-lebedeva-gold font-bold"
                          : ""
                      )}
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
            {processedData.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-400">
                  No se encontraron piedras con los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
