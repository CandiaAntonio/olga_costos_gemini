"use client";

import { useState, useMemo } from "react";
import { StoneFilters } from "@/components/stones/StoneFilters";
import { GemCard } from "@/components/stones/GemCard";
import { Gem } from "lucide-react";

interface ClientGemGridProps {
  initialData: any[]; // Mixed array of Lots and Unique stones
}

export function ClientGemGrid({ initialData }: ClientGemGridProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [inventoryType, setInventoryType] = useState("all");

  const filteredData = useMemo(() => {
    return initialData.filter((item) => {
      // Search filter
      const matchesSearch =
        search === "" ||
        item.nombre.toLowerCase().includes(search.toLowerCase()) ||
        (item.codigo &&
          item.codigo.toLowerCase().includes(search.toLowerCase()));

      // Category filter
      const matchesCategory =
        category === "all" ||
        (item.categoria &&
          item.categoria.toLowerCase() === category.toLowerCase());

      // Type filter
      const matchesType =
        inventoryType === "all" || item.type === inventoryType;

      return matchesSearch && matchesCategory && matchesType;
    });
  }, [initialData, search, category, inventoryType]);

  return (
    <>
      <StoneFilters
        onSearchChange={setSearch}
        onCategoryChange={setCategory}
        onInventoryTypeChange={setInventoryType}
      />

      {filteredData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-700 slide-in-from-bottom-4">
          {filteredData.map((gem) => (
            <GemCard key={`${gem.type}-${gem.id}`} data={gem} type={gem.type} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
          <Gem className="mx-auto h-12 w-12 text-gray-300 mb-4 opacity-50" />
          <h3 className="text-lg font-serif text-gray-900">
            No se encontraron gemas
          </h3>
          <p className="text-gray-500 font-technical font-light text-sm">
            Intenta ajustar los filtros de búsqueda
          </p>
        </div>
      )}
    </>
  );
}
