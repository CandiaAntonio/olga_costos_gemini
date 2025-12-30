import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Generates a high-precision luxury ID: [Type][NameCode][Serial]
 * Example: LDIA001 (Lot Diamond 001)
 * @param type 'LOT' | 'UNIQUE'
 * @param name Stone Name (e.g. 'Diamante')
 * @param id Unique ID or Serial string
 */
export function generateStoneUID(
  type: "LOT" | "UNIQUE",
  name: string,
  id: string
): string {
  const prefix = type === "LOT" ? "L" : "U";
  // Take first 3 letters of name, uppercase, remove spaces/special chars
  const nameCode = name
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 3)
    .toUpperCase()
    .padEnd(3, "X");
  // Take last 3 chars of ID (usually uuid)
  const uniqueSuffix = id.slice(-3).toUpperCase();

  return `${prefix}${nameCode}${uniqueSuffix}`;
}
