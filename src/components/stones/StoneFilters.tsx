"use client";

import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StoneFiltersProps {
  currentSearch: string;
  currentCategory: string;
  currentTrackingType: string;
  isLowStock: boolean;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onTrackingTypeChange: (value: string) => void;
  onLowStockChange: (value: boolean) => void;
}

export function StoneFilters({
  currentSearch,
  currentCategory,
  currentTrackingType,
  isLowStock,
  onSearchChange,
  onCategoryChange,
  onTrackingTypeChange,
  onLowStockChange,
}: StoneFiltersProps) {
  return (
    <div className="flex flex-col xl:flex-row gap-4 mb-8 p-4 bg-white border border-gray-100 shadow-sm items-center justify-between">
      {/* Search */}
      <div className="relative w-full xl:w-96">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
          strokeWidth={1.2}
        />
        <Input
          value={currentSearch}
          placeholder="Buscar por nombre, código..."
          className="pl-9 border-gray-200 bg-gray-50/50 focus:border-lebedeva-gold rounded-none font-technical font-light h-10 w-full"
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Filters Group */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
        {/* Category Dropdown */}
        <Select value={currentCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-full sm:w-[180px] rounded-none border-gray-200 focus:ring-0 focus:border-lebedeva-gold">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent className="rounded-none">
            <SelectItem value="all">Todas las Categorías</SelectItem>
            <SelectItem value="preciosa">Preciosa</SelectItem>
            <SelectItem value="semipreciosa">Semipreciosa</SelectItem>
            <SelectItem value="sintética">Sintética</SelectItem>
          </SelectContent>
        </Select>

        {/* Tracking Type Toggle */}
        <div className="flex bg-gray-50 p-1 gap-1 border border-gray-100 w-full sm:w-auto overflow-x-auto">
          {["all", "LOT", "UNIQUE"].map((type) => (
            <button
              key={type}
              onClick={() => onTrackingTypeChange(type)}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-xs uppercase tracking-wider font-medium transition-all duration-300 whitespace-nowrap ${
                currentTrackingType === type
                  ? "bg-lebedeva-black text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {type === "all" ? "Todos" : type === "LOT" ? "Lotes" : "Únicas"}
            </button>
          ))}
        </div>

        {/* Low Stock Toggle */}
        <Button
          variant="outline"
          onClick={() => onLowStockChange(!isLowStock)}
          className={`w-full sm:w-auto rounded-none border px-4 h-10 gap-2 transition-colors ${
            isLowStock
              ? "border-lebedeva-gold bg-lebedeva-gold/5 text-lebedeva-gold"
              : "border-gray-200 text-gray-500 hover:border-gray-300"
          }`}
        >
          <Filter className="h-3.5 w-3.5" strokeWidth={1.2} />
          <span className="text-xs uppercase tracking-wider">Low Stock</span>
        </Button>
      </div>
    </div>
  );
}
