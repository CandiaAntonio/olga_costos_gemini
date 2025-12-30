export type TrackingType = "LOT" | "UNIQUE";

const STONE_CODE_MAP: Record<string, string> = {
  // Preciosa
  Diamante: "DIA",
  Esmeralda: "ESM",
  Rubí: "RUB",
  Zafiro: "ZAF",

  // Semipreciosa
  Amatista: "AMA",
  Topacio: "TOP",
  Granate: "GRA",
  Perla: "PER",
  Ópalo: "OPA",
  Aguamarina: "AGU",
  Turmalina: "TUR",
  Citrino: "CIT",

  // Sintética
  Zirconia: "ZIR",
  Moissanita: "MOI",
  Sintético: "SIN",
};

/**
 * Generates a luxury display ID for stones.
 * Format: [TrackingType][ShortName][Serial]
 *
 * Examples:
 * - Lot of Diamonds -> LDIA001
 * - Unique Emerald -> UESM234
 */
export function generateStoneDisplayId(
  type: TrackingType,
  stoneName: string,
  serialOrId: string | number
): string {
  // 1. Prefix
  const prefix = type === "LOT" ? "L" : "U";

  // 2. Stone Code
  // Normalize name to Title Case or finding map key
  const normalizedName = Object.keys(STONE_CODE_MAP).find(
    (k) => k.toLowerCase() === stoneName.toLowerCase()
  );

  let code = "UNK";
  if (normalizedName) {
    code = STONE_CODE_MAP[normalizedName];
  } else {
    // Fallback: First 3 letters, uppercase
    code = stoneName
      .slice(0, 3)
      .toUpperCase()
      .replace(/[^A-Z]/g, "X");
  }

  // 3. Serial
  // If it's a number, pad it. If it's a UUID/CUID, take last 3 chars and numberify or keep as hex
  let serial = "000";
  if (typeof serialOrId === "number") {
    serial = serialOrId.toString().padStart(3, "0");
  } else {
    // Assist in deterministic pseudo-serial from ID strings
    // Take last 3 chars, if they are digits use them, else simple hash-like mapping?
    // User requested "Serial" e.g. 001.
    // Since we don't have a sequential counter in DB easily accessible here without query,
    // we might stick to last 3 chars of ID but capitalized for now, or rely on a passed index.
    // If the input is indeed a sequential index (from map), use that.
    const last3 = serialOrId.toString().slice(-3).toUpperCase();
    serial = last3;
  }

  return `${prefix}${code}${serial}`;
}
