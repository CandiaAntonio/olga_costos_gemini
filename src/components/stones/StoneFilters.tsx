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
import { Button } from "@/components/ui/button";

interface StoneFiltersProps {
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onInventoryTypeChange: (value: string) => void;
}

export function StoneFilters({
  onSearchChange,
  onCategoryChange,
  onInventoryTypeChange,
}: StoneFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 bg-white/50 backdrop-blur-sm border-b border-gray-100">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar por nombre, código..."
          className="pl-9 border-gray-200 bg-transparent focus:border-lebedeva-gold rounded-none font-technical font-light"
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex gap-4">
        <Select onValueChange={onCategoryChange}>
          <SelectTrigger className="w-[180px] rounded-none border-gray-200 bg-transparent">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="preciosa">Preciosas</SelectItem>
            <SelectItem value="semipreciosa">Semipreciosas</SelectItem>
            <SelectItem value="sintética">Sintéticas</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={onInventoryTypeChange}>
          <SelectTrigger className="w-[180px] rounded-none border-gray-200 bg-transparent">
            <SelectValue placeholder="Tipo Inventario" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="LOT">Lotes (Stock)</SelectItem>
            <SelectItem value="UNIQUE">Piezas Únicas</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
