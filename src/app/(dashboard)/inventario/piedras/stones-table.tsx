"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowUpDown, Pencil, Check } from "lucide-react";
import { updateStoneStock, updateStonePrice, deleteStone } from "./actions";
import { useRouter } from "next/navigation";
import { StoneFilters } from "@/components/stones/StoneFilters";
import { cn } from "@/lib/utils";
import { generateStoneUID } from "@/lib/stones";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  shape?: string | null; // Cut/Shape
  size?: string | null; // Size for lots
  carats?: number | null;
  clarity?: string | null;
  color?: string | null;
  origin?: string | null;
  certificate?: string | null;
}

interface StonesTableProps {
  initialData: StoneData[];
}

type SortKey =
  | "stock"
  | "price"
  | "category"
  | "shape"
  | "color"
  | "clarity"
  | "weight"
  | null;
type SortDirection = "asc" | "desc";

export function StonesTable({ initialData }: StonesTableProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Filter State
  const [currentSearch, setCurrentSearch] = useState("");
  const [currentCategory, setCurrentCategory] = useState("all");
  const [currentMaterialType, setCurrentMaterialType] = useState("all");

  // Editing State
  const [editablePrices, setEditablePrices] = useState<Set<string>>(new Set());
  const [editableStockId, setEditableStockId] = useState<string | null>(null);

  // Sorting State
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: SortDirection;
  }>({ key: null, direction: "asc" });

  const getDisplayId = (stone: StoneData) => {
    if (stone.type === "UNIQUE" && stone.codigo) return stone.codigo;
    // Strict format usage: [Type][NameCode][Serial]
    return generateStoneUID(
      stone.name,
      stone.type,
      0,
      stone.id.slice(-3).toUpperCase()
    );
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
        displayId.includes(searchLower) ||
        (stone.category?.toLowerCase() || "").includes(searchLower);

      // Category
      const matchesCategory =
        currentCategory === "all" || stone.category === currentCategory;

      // Material Type
      const catLower = stone.category?.toLowerCase() || "";
      const isSynthetic = catLower.includes("sintética");
      let matchesMaterial = true;
      if (currentMaterialType === "Natural") {
        matchesMaterial = !isSynthetic;
      } else if (currentMaterialType === "Sintética") {
        matchesMaterial = isSynthetic;
      }

      return matchesSearch && matchesCategory && matchesMaterial;
    });

    // 2. Sort
    if (sortConfig.key) {
      data.sort((a, b) => {
        let valA: string | number = 0;
        let valB: string | number = 0;

        switch (sortConfig.key) {
          case "stock":
            valA = a.stock || 0;
            valB = b.stock || 0;
            break;
          case "price":
            valA = a.price;
            valB = b.price;
            break;
          case "category":
            valA = a.category || "";
            valB = b.category || "";
            break;
          case "shape":
            valA = a.shape || "";
            valB = b.shape || "";
            break;
          case "color":
            valA = a.color || "";
            valB = b.color || "";
            break;
          case "clarity":
            valA = a.clarity || "";
            valB = b.clarity || "";
            break;
          case "weight":
            // For lots, use size string logic (rough approx for sorting) or 0
            // For uniques, use carats
            // To enable sorting mixed types, we might prioritize carats.
            valA = a.type === "UNIQUE" ? a.carats || 0 : 0;
            valB = b.type === "UNIQUE" ? b.carats || 0 : 0;
            // If both are lots, sort by size string? (complex due to "mm")
            if (a.type === "LOT" && b.type === "LOT") {
              valA = parseFloat(a.size || "0");
              valB = parseFloat(b.size || "0");
            }
            break;
          default:
            return 0;
        }

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
    currentMaterialType,
    sortConfig,
  ]);

  return (
    <TooltipProvider>
      <div className="w-full">
        <StoneFilters
          currentSearch={currentSearch}
          currentCategory={currentCategory}
          currentMaterialType={currentMaterialType}
          onSearchChange={setCurrentSearch}
          onCategoryChange={setCurrentCategory}
          onMaterialTypeChange={setCurrentMaterialType}
        />

        <div className="w-full">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b-[0.5px] border-[#F3F4F6] text-sm text-gray-500 font-serif font-normal tracking-widest uppercase">
                <th className="py-6 px-4 w-32 font-normal">
                  <Tooltip>
                    <TooltipTrigger
                      className="cursor-help hover:text-lebedeva-gold transition-colors"
                      title="L: Lote / U: Única + Cód. Piedra + Secuencial (Ej: LDIA001)"
                    >
                      ID
                    </TooltipTrigger>
                    <TooltipContent className="font-technical text-xs bg-lebedeva-black text-white border-0">
                      L: Lote / U: Única + Cód. Piedra + Secuencial (Ej:
                      LDIA001)
                    </TooltipContent>
                  </Tooltip>
                </th>
                <th className="py-6 px-4 font-normal">Nombre</th>
                <th
                  className="py-6 px-4 font-normal cursor-pointer hover:text-lebedeva-gold transition-colors group select-none"
                  onClick={() => handleSort("category")}
                >
                  <div className="flex items-center gap-1">
                    Categoría
                    <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </th>
                <th
                  className="py-6 px-4 font-normal cursor-pointer hover:text-lebedeva-gold transition-colors group select-none hidden md:table-cell"
                  onClick={() => handleSort("shape")}
                >
                  <div className="flex items-center gap-1">
                    Corte
                    <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </th>
                <th
                  className="py-6 px-4 font-normal cursor-pointer hover:text-lebedeva-gold transition-colors group select-none hidden lg:table-cell"
                  onClick={() => handleSort("color")}
                >
                  <div className="flex items-center gap-1">
                    Color
                    <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </th>
                <th
                  className="py-6 px-4 font-normal cursor-pointer hover:text-lebedeva-gold transition-colors group select-none hidden lg:table-cell"
                  onClick={() => handleSort("clarity")}
                >
                  <div className="flex items-center gap-1">
                    Claridad
                    <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </th>
                <th
                  className="py-6 px-4 font-normal cursor-pointer hover:text-lebedeva-gold transition-colors group select-none text-center"
                  onClick={() => handleSort("weight")}
                >
                  <div className="flex items-center justify-center gap-1">
                    Tamaño / Ct
                    <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </th>

                <th
                  className="py-6 px-4 text-center cursor-pointer hover:text-lebedeva-gold transition-colors group select-none w-24 font-normal"
                  onClick={() => handleSort("stock")}
                >
                  <div className="flex items-center justify-center gap-1">
                    Stock
                    <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </th>
                <th
                  className="py-6 px-4 text-right cursor-pointer hover:text-lebedeva-gold transition-colors group select-none w-40 font-normal"
                  onClick={() => handleSort("price")}
                >
                  <div className="flex items-center justify-end gap-1">
                    Precio
                    <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </th>
                <th className="py-6 px-4 text-center w-16"></th>
              </tr>
            </thead>
            <tbody>
              {processedData.map((stone) => {
                const isPriceEditable = editablePrices.has(stone.id);
                return (
                  <tr
                    key={stone.id}
                    className={`border-b-[0.5px] border-[#F3F4F6] hover:bg-white odd:bg-[#FCFCFC] transition-colors group ${
                      loadingId === stone.id
                        ? "opacity-50 pointer-events-none"
                        : ""
                    }`}
                  >
                    <td className="py-6 px-4 text-sm font-technical font-light text-gray-400 tracking-wide">
                      <Link
                        href={`/inventario/piedras/${stone.id}`}
                        className="block w-full h-full cursor-pointer hover:text-gray-900 transition-colors"
                      >
                        {getDisplayId(stone)}
                      </Link>
                    </td>
                    <td className="py-6 px-4">
                      <Link
                        href={`/inventario/piedras/${stone.id}`}
                        className="block w-full h-full cursor-pointer group"
                      >
                        <span className="font-serif text-lg text-lebedeva-black tracking-wide group-hover:text-lebedeva-gold transition-colors">
                          {stone.name}
                        </span>
                      </Link>
                    </td>
                    <td className="py-6 px-4">
                      <Badge
                        variant={getBadgeVariant(stone.category) as any}
                        className="rounded-none font-technical font-light tracking-wide text-[10px] px-3 py-1 border-gray-100 bg-white shadow-sm cursor-pointer hover:bg-gray-100 transition-colors uppercase"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (stone.category) {
                            // Toggle Logic: If clicking active category, reset to 'all'
                            const nextCategory =
                              currentCategory === stone.category
                                ? "all"
                                : stone.category;
                            setCurrentCategory(nextCategory);
                          }
                        }}
                      >
                        {stone.category || "General"}
                      </Badge>
                    </td>
                    {/* New Columns */}
                    <td className="py-6 px-4 text-sm font-technical text-gray-500 hidden md:table-cell">
                      {stone.shape || "—"}
                    </td>
                    <td className="py-6 px-4 text-sm font-technical text-gray-500 hidden lg:table-cell">
                      {stone.color || "—"}
                    </td>
                    <td className="py-6 px-4 text-sm font-technical text-gray-500 hidden lg:table-cell">
                      {stone.clarity || "—"}
                    </td>
                    <td className="py-6 px-4 text-sm font-technical text-gray-600 text-center font-medium">
                      {stone.type === "LOT" ? (
                        <span>{stone.size || "—"}</span>
                      ) : (
                        <span>{stone.carats ? `${stone.carats} ct` : "—"}</span>
                      )}
                    </td>

                    <td className="py-6 px-4 text-center">
                      {stone.type === "LOT" ? (
                        editableStockId === stone.id ? (
                          <Input
                            type="number"
                            autoFocus
                            defaultValue={stone.stock || 0}
                            className="w-16 mx-auto text-center h-8 rounded-none border-0 p-0 focus:ring-0 bg-white transition-colors font-technical shadow-sm"
                            onClick={(e) => e.stopPropagation()}
                            onBlur={(e) => {
                              handleStockUpdate(
                                stone.id,
                                stone.type,
                                e.target.value
                              );
                              setEditableStockId(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.currentTarget.blur();
                              }
                            }}
                          />
                        ) : (
                          <button
                            className={cn(
                              "cursor-pointer hover:bg-gray-50 px-2 py-1 transition-colors block w-full text-center outline-none focus:bg-gray-50 font-technical text-sm text-gray-600",
                              (stone.stock || 0) < 10
                                ? "text-lebedeva-gold font-bold"
                                : ""
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditableStockId(stone.id);
                            }}
                          >
                            {stone.stock || 0}
                          </button>
                        )
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="py-6 px-4 text-right font-technical font-light flex items-center justify-end gap-2">
                      <div
                        className={cn(
                          "relative group/price flex items-center justify-end",
                          isPriceEditable ? "w-28" : "w-auto"
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
                          <span className="text-gray-600 tabular-nums font-technical text-sm font-medium">
                            {new Intl.NumberFormat("es-CO", {
                              style: "currency",
                              currency: "COP",
                              maximumFractionDigits: 0,
                            }).format(stone.price)}
                          </span>
                        )}
                      </div>
                      {/* Price Action Icon */}
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
                          <Check className="h-4 w-4" />
                        ) : (
                          <Pencil className="h-3 w-3" />
                        )}
                      </button>
                    </td>
                    <td className="py-6 px-4 text-center">
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
                    colSpan={10}
                    className="py-24 text-center text-gray-300 font-serif text-xl italic"
                  >
                    No se encontraron gemas con estos filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </TooltipProvider>
  );
}
