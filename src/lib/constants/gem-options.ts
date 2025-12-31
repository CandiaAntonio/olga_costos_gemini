export const GEM_CUTS = [
  "Round",
  "Oval",
  "Emerald",
  "Princess",
  "Cushion",
  "Marquise",
  "Pear",
  "Heart",
  "Asscher",
  "Radiant",
  "Baguette",
  "Trilliant",
  "Cabochon",
  "Briolette",
];

export const GEM_CLARITY = [
  "FL (Flawless)",
  "IF (Internally Flawless)",
  "VVS1",
  "VVS2",
  "VS1",
  "VS2",
  "SI1",
  "SI2",
  "I1",
  "I2",
  "I3",
  "Opaque",
];

export const GEM_COLORS = [
  "Colorless (D-F)",
  "Near Colorless (G-J)",
  "Yellow",
  "Pink",
  "Red",
  "Blue",
  "Green",
  "Purple",
  "Orange",
  "Black",
  "Brown",
  "Multicolor",
];

// Generate sequence from 0.5mm to 20mm in 0.5mm increments
export const GEM_SIZES = Array.from({ length: 40 }, (_, i) => {
  const size = 0.5 + i * 0.5;
  return `${size} mm`;
});
