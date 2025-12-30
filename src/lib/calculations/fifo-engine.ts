/**
 * FIFO Engine for Metals Treasury
 *
 * Handles value calculations based on First-In-First-Out logic for metal inventory.
 */

// Define interface locally to avoid dependency strictness before generation
export interface MetalLot {
  id: string;
  metalType: string;
  gramsRemaining: number;
  pricePerGramCOP: number;
}

/**
 * Calculates the total accounting value of the inventory based on historical purchase prices.
 * Formula: Sum(gramsRemaining * pricePerGramCOP)
 */
export function calculateTotalInventoryValue(inventory: MetalLot[]): number {
  return inventory.reduce((total, lot) => {
    return total + lot.gramsRemaining * lot.pricePerGramCOP;
  }, 0);
}

/**
 * Calculates the replacement value of the entire inventory based on a single current market price.
 * Formula: TotalGramsRemaining * CurrentMarketPrice
 */
export function calculateReplacementValue(
  inventory: MetalLot[],
  currentMarketPriceCOP: number
): number {
  const totalGrams = inventory.reduce(
    (sum, lot) => sum + lot.gramsRemaining,
    0
  );
  return totalGrams * currentMarketPriceCOP;
}

/**
 * Helper to get total weight available
 */
export function getTotalWeight(inventory: MetalLot[]): number {
  return inventory.reduce((sum, lot) => sum + lot.gramsRemaining, 0);
}

export interface ConsumptionResult {
  consumedValue: number;
  remainingForNextLot: number; // If positive, we need more metal than available
  lotsAffected: {
    id: string;
    gramsBefore: number;
    gramsAfter: number;
    gramsConsumed: number;
  }[];
}

/**
 * Calculates how a consumption event affects the available lots using FIFO.
 * This is a pure function - it does not modify the database.
 */
export function consumeMetalFIFO(
  requiredGrams: number,
  inventory: MetalLot[]
): ConsumptionResult {
  let remainingParams = requiredGrams;
  let totalConsumedValue = 0;
  const lotsAffected = [];

  // Sort by date equivalent (assuming array is passed sorted, but if IDs are time-sortable...)
  // Ideally the caller passes sorted inventory. We will assume inventory is sorted FIFO.

  for (const lot of inventory) {
    if (remainingParams <= 0) break;
    if (lot.gramsRemaining <= 0) continue;

    const availableInLot = lot.gramsRemaining;
    const toConsume = Math.min(availableInLot, remainingParams);

    lotsAffected.push({
      id: lot.id,
      gramsBefore: availableInLot,
      gramsAfter: availableInLot - toConsume,
      gramsConsumed: toConsume,
    });

    totalConsumedValue += toConsume * lot.pricePerGramCOP;
    remainingParams -= toConsume;
  }

  // Handle precision issues if any, but simplistic subtraction is usually fine for these scales
  // if strictly managing floating point, might need rounding.

  return {
    consumedValue: totalConsumedValue,
    remainingForNextLot: remainingParams,
    lotsAffected,
  };
}
