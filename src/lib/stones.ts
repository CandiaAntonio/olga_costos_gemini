/**
 * helper function to generate a unique ID for a stone based on its name and inventory type.
 */
export function generateStoneUID(
  stoneName: string,
  inventoryType: "LOT" | "UNIQUE",
  existingCount: number = 0
): string {
  const prefix = stoneName
    .replace(/[^a-zA-Z]/g, "")
    .substring(0, 3)
    .toUpperCase();

  if (inventoryType === "LOT") {
    // For LOTs, we might just use a standard prefix or the same code if there is only one tracking entry per type.
    // However, if we want a code for the Type itself:
    return `${prefix}LOT`;
  }

  // For UNIQUE stones, we generate a specific code.
  // We can use the existing count to increment, or a random suffix.
  // Using sequential numbering is better for "human readable" codes like RUB001.
  const number = (existingCount + 1).toString().padStart(3, "0");
  return `${prefix}${number}`;
}
