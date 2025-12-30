import { generateStoneDisplayId } from "../src/lib/utils/stone-id";

// Mocks
const cases = [
  { type: "LOT", name: "Diamante", id: 1, expected: "LDIA001" },
  { type: "UNIQUE", name: "Esmeralda", id: "cust-id-123", expected: "UESM123" }, // Basic suffix assumption
  { type: "LOT", name: "Zirconia", id: 15, expected: "LZIR015" },
  { type: "UNIQUE", name: "Rubí", id: "some-uuid-abc", expected: "URUBABC" },
  { type: "LOT", name: "UnknownStone", id: 99, expected: "LUNK099" }, // Fallback logic check
];

console.log("Running Stone ID Generation Tests...\n");

let passed = 0;
cases.forEach((c) => {
  const result = generateStoneDisplayId(c.type as any, c.name, c.id);
  const ok = result === c.expected;
  if (ok) passed++;
  console.log(
    `[${ok ? "PASS" : "FAIL"}] Input: ${c.type} ${c.name} ${
      c.id
    } -> Output: ${result} (Expected: ${c.expected})`
  );
});

console.log(`\nPassed ${passed} / ${cases.length}`);
