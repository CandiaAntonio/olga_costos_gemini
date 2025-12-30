"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StoneFiltersProps {
  currentSearch: string;
  currentCategory: string; // 'all' | 'Preciosa' | 'Semipreciosa' | 'Sintética'
  currentMaterialType: string; // 'all' | 'Natural' | 'Sintética'
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onMaterialTypeChange: (value: string) => void;
}

export function StoneFilters({
  currentSearch,
  currentCategory,
  currentMaterialType,
  onSearchChange,
  onCategoryChange,
  onMaterialTypeChange,
}: StoneFiltersProps) {
  return (
    <div className="flex flex-col xl:flex-row gap-6 mb-8 items-end justify-between font-technical border-b border-[#F3F4F6] pb-4">
      {/* Search - Minimalist Command Line */}
      <div className="relative w-full xl:max-w-xl group">
        <Search
          className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 group-focus-within:text-lebedeva-gold transition-colors"
          strokeWidth={1.5}
        />
        <Input
          value={currentSearch}
          placeholder="Comando de búsqueda (Nombre, ID, Categoría)..."
          className="pl-8 border-0 bg-transparent rounded-none px-0 h-10 w-full placeholder:text-gray-300 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Command Bar Actions */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4 w-full xl:w-auto">
        {/* Material Type Facet */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-gray-300">
            Tipo
          </span>
          <Select
            value={currentMaterialType}
            onValueChange={onMaterialTypeChange}
          >
            <SelectTrigger className="w-[100px] border-0 p-0 h-auto text-sm bg-transparent focus:ring-0 text-right justify-end gap-2 text-gray-600 hover:text-black transition-colors">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="Natural">Natural</SelectItem>
              <SelectItem value="Sintética">Sintética</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category Facet */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-gray-300">
            Categoría
          </span>
          <Select value={currentCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-[120px] border-0 p-0 h-auto text-sm bg-transparent focus:ring-0 text-right justify-end gap-2 text-gray-600 hover:text-black transition-colors">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="Preciosa">Preciosa</SelectItem>
              <SelectItem value="Semipreciosa">Semipreciosa</SelectItem>
              <SelectItem value="Sintética">Sintética</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
