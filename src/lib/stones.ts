/**
 * helper function to generate a unique ID for a stone based on its name and inventory type.
 */
export function generateStoneUID(
  stoneName: string,
  inventoryType: "LOT" | "UNIQUE",
  existingCount: number = 0,
  serialOverride?: string
): string {
  // [Type]: L for LOT, U for UNIQUE
  const typePrefix = inventoryType === "LOT" ? "L" : "U";

  // [NameCode]: First 3 letters of name, uppercased, no special chars
  const nameCode = stoneName
    .replace(/[^a-zA-Z]/g, "")
    .substring(0, 3)
    .toUpperCase();

  // [Serial]: 3 digits. strict format.
  // If serialOverride provided (e.g. from existing DB "005"), use it.
  // Otherwise use existingCount + 1 padded.
  const serial = serialOverride
    ? serialOverride
    : (existingCount + 1).toString().padStart(3, "0");

  return `${typePrefix}${nameCode}${serial}`;
}
