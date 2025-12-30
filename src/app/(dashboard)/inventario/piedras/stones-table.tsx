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
  // Detail fields
  carats?: number | null;
  clarity?: string | null;
  color?: string | null;
  origin?: string | null;
  certificate?: string | null;
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
  const [currentCategory, setCurrentCategory] = useState("all");
  const [currentTrackingType, setCurrentTrackingType] = useState("all");
  const [currentStoneType, setCurrentStoneType] = useState("all");

  // Price Editing State
  const [editablePrices, setEditablePrices] = useState<Set<string>>(new Set());

  // Sorting State
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: SortDirection;
  }>({ key: null, direction: "asc" });

  const getDisplayId = (stone: StoneData) => {
    if (stone.type === "UNIQUE" && stone.codigo) return stone.codigo;
    // Fallback or generator for LOTs if they don't have a stored code
    const prefix = stone.type === "LOT" ? "L" : "U";
    // NameCode: DIA, RUB, ESM...
    const nameCode = stone.name
      .replace(/[^a-zA-Z]/g, "")
      .slice(0, 3)
      .toUpperCase();
    // For Lots, we can just say "LDIA" or "LDIA001" if we had an ID.
    // Since we don't have a lot serial, we'll use a dense format.
    // However, the prompt asked for "LDIA001". Using the last 3 of ID is a decent proxy if we lack a real serial.
    const uniqueSuffix = stone.id.slice(-3).toUpperCase();
    return `${prefix}${nameCode}${uniqueSuffix}`;
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
      const displayId = getDisplayId(stone).toLowerCase();
      const matchesSearch =
        stone.name.toLowerCase().includes(searchLower) ||
        displayId.includes(searchLower);

      // Category (Natural vs Synthetic)
      const catLower = stone.category?.toLowerCase() || "";
      const isSynthetic = catLower.includes("sintética");
      let matchesCategory = true;
      if (currentCategory === "natural") {
        matchesCategory = !isSynthetic;
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
        const valA = a[sortConfig.key!] ?? 0;
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
      />

      <div className="w-full">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b-[0.5px] border-[#F3F4F6] text-[10px] uppercase tracking-widest text-gray-400 font-serif">
              <th className="py-3 px-4 w-24">ID</th>
              <th className="py-3 px-4">Nombre</th>
              <th className="py-3 px-4">Categoría</th>
              <th
                className="py-3 px-4 text-center cursor-pointer hover:text-gray-800 transition-colors group select-none w-32"
                onClick={() => handleSort("stock")}
              >
                <div className="flex items-center justify-center gap-1">
                  Stock
                  <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </th>
              <th
                className="py-3 px-4 text-right cursor-pointer hover:text-gray-800 transition-colors group select-none w-48"
                onClick={() => handleSort("price")}
              >
                <div className="flex items-center justify-end gap-1">
                  Precio (COP)
                  <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </th>
              <th className="py-3 px-4 text-center w-16"></th>
            </tr>
          </thead>
          <tbody>
            {processedData.map((stone) => {
              const isPriceEditable = editablePrices.has(stone.id);
              return (
                <tr
                  key={stone.id}
                  onClick={() => router.push(`/inventario/piedras/${stone.id}`)}
                  className={`border-b-[0.5px] border-[#F3F4F6] hover:bg-[#FAFAFA] transition-colors group cursor-pointer ${
                    loadingId === stone.id
                      ? "opacity-50 pointer-events-none"
                      : ""
                  }`}
                >
                  <td className="py-3 px-4 text-lg font-serif text-gray-400">
                    {getDisplayId(stone)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-serif text-xl text-lebedeva-black">
                      {stone.name}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={getBadgeVariant(stone.category) as any}
                      className="rounded-none font-normal tracking-wide text-[10px] px-2 py-0.5 border-gray-200"
                    >
                      {stone.category || "General"}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {stone.type === "LOT" ? (
                      <Input
                        type="number"
                        defaultValue={stone.stock || 0}
                        className={cn(
                          "w-16 mx-auto text-center h-8 rounded-none border-0 p-0 focus:ring-0 bg-transparent transition-colors font-technical",
                          (stone.stock || 0) < 10
                            ? "text-lebedeva-gold font-bold"
                            : "text-gray-600 hover:bg-gray-50 focus:bg-white"
                        )}
                        onClick={(e) => e.stopPropagation()}
                        onBlur={(e) =>
                          handleStockUpdate(
                            stone.id,
                            stone.type,
                            e.target.value
                          )
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.currentTarget.blur();
                          }
                        }}
                      />
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-technical flex items-center justify-end gap-2">
                    <div
                      className={cn(
                        "relative group/price flex items-center justify-end",
                        isPriceEditable ? "w-32" : "w-auto"
                      )}
                    >
                      {isPriceEditable ? (
                        <Input
                          type="number"
                          autoFocus
                          defaultValue={stone.price}
                          className="w-full text-right h-8 rounded-none border-b border-lebedeva-gold p-0 focus:ring-0 bg-transparent text-black"
                          onClick={(e) => e.stopPropagation()}
                          onBlur={(e) => {
                            handlePriceUpdate(
                              stone.id,
                              stone.type,
                              e.target.value
                            );
                            const newEditable = new Set(editablePrices);
                            newEditable.delete(stone.id);
                            setEditablePrices(newEditable);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.currentTarget.blur();
                            }
                          }}
                        />
                      ) : (
                        <span className="text-gray-400 tabular-nums">
                          {new Intl.NumberFormat("es-CO", {
                            style: "currency",
                            currency: "COP",
                            maximumFractionDigits: 0,
                          }).format(stone.price)}
                        </span>
                      )}
                    </div>
                    {/* Lock Icon */}
                    <button
                      onClick={(e) => togglePriceEdit(stone.id, e)}
                      className={cn(
                        "h-6 w-6 flex items-center justify-center text-gray-300 hover:text-lebedeva-gold transition-colors z-10",
                        isPriceEditable
                          ? "text-lebedeva-gold"
                          : "opacity-0 group-hover:opacity-100"
                      )}
                      title={
                        isPriceEditable ? "Guardar precio" : "Editar precio"
                      }
                    >
                      {isPriceEditable ? (
                        <span className="text-[10px] uppercase">OK</span>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect
                            width="18"
                            height="11"
                            x="3"
                            y="11"
                            rx="2"
                            ry="2"
                          />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-none h-8 w-8 text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
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
              );
            })}
            {processedData.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="py-24 text-center text-gray-300 font-serif text-xl italic"
                >
                  No se encontraron gemas en el inventario.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
