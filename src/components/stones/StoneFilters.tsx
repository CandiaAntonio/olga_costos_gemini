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
import { cn } from "@/lib/utils";

interface StoneFiltersProps {
  currentSearch: string;
  currentCategory: string; // 'all' | 'natural' | 'synthetic'
  currentStoneType: string;
  currentTrackingType: string;
  stoneTypes: string[]; // List of unique stone names for the dropdown
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onStoneTypeChange: (value: string) => void;
  onTrackingTypeChange: (value: string) => void;
  isLowStock: boolean;
  onLowStockChange: (value: boolean) => void;
}

export function StoneFilters({
  currentSearch,
  currentCategory,
  currentStoneType,
  currentTrackingType,
  stoneTypes,
  onSearchChange,
  onCategoryChange,
  onStoneTypeChange,
  onTrackingTypeChange,
  isLowStock,
  onLowStockChange,
}: StoneFiltersProps) {
  return (
    <div className="flex flex-col xl:flex-row gap-4 mb-8 items-center justify-between font-technical">
      {/* Search - Minimalist & Expanded */}
      <div className="relative w-full xl:max-w-md">
        <Search
          className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
          strokeWidth={1.5}
        />
        <Input
          value={currentSearch}
          placeholder="Filtrar por nombre, código o ID..."
          className="pl-8 border-0 border-b border-gray-200 bg-transparent focus:border-lebedeva-gold rounded-none px-0 h-10 w-full placeholder:text-gray-300 focus-visible:ring-0 focus-visible:ring-offset-0"
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Command Bar Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-6 w-full xl:w-auto">
        {/* Stone Type Facet */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs uppercase tracking-widest text-gray-400 whitespace-nowrap hidden sm:block">
            Tipo:
          </span>
          <Select value={currentStoneType} onValueChange={onStoneTypeChange}>
            <SelectTrigger className="w-full sm:w-[150px] border-0 border-b border-gray-200 rounded-none px-0 focus:ring-0 focus:border-lebedeva-gold text-sm">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent className="rounded-none max-h-[300px]">
              <SelectItem value="all">Todas</SelectItem>
              {stoneTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category Facet */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs uppercase tracking-widest text-gray-400 whitespace-nowrap hidden sm:block">
            Origen:
          </span>
          <Select value={currentCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-full sm:w-[130px] border-0 border-b border-gray-200 rounded-none px-0 focus:ring-0 focus:border-lebedeva-gold text-sm">
              <SelectValue placeholder="Origen" />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              <SelectItem value="all">Cualquiera</SelectItem>
              <SelectItem value="natural">Natural</SelectItem>
              <SelectItem value="synthetic">Sintética</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tracking Type Toggle (Minimalist) */}
        <div className="flex items-center gap-4 border-l border-gray-200 pl-6 ml-2">
          {["all", "LOT", "UNIQUE"].map((type) => (
            <button
              key={type}
              onClick={() => onTrackingTypeChange(type)}
              className={cn(
                "text-xs uppercase tracking-widest transition-colors duration-200",
                currentTrackingType === type
                  ? "text-lebedeva-gold font-medium"
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              {type === "all" ? "Todos" : type === "LOT" ? "Lotes" : "Únicas"}
            </button>
          ))}
        </div>

        {/* Low Stock Toggle */}
        <div className="flex items-center gap-2 border-l border-gray-200 pl-6 ml-2">
          <button
            onClick={() => onLowStockChange(!isLowStock)}
            className={cn(
              "text-xs uppercase tracking-widest transition-colors duration-200",
              isLowStock
                ? "text-red-500 font-medium"
                : "text-gray-400 hover:text-gray-600"
            )}
          >
            Stock Bajo
          </button>
        </div>
      </div>
    </div>
  );
}
