import {
  consumeMetalFIFO,
  MetalLot,
} from "../src/lib/calculations/fifo-engine";

const mockInventory: MetalLot[] = [
  { id: "1", metalType: "GOLD", gramsRemaining: 10, pricePerGramCOP: 100 },
  { id: "2", metalType: "GOLD", gramsRemaining: 20, pricePerGramCOP: 110 },
  { id: "3", metalType: "GOLD", gramsRemaining: 5, pricePerGramCOP: 120 },
];

console.log("--- Initial Inventory ---");
console.table(mockInventory);

console.log("\n--- Test 1: Consume 5g (Should take from Lot 1) ---");
const result1 = consumeMetalFIFO(5, mockInventory);
console.log("Consumed Value:", result1.consumedValue);
console.log("Remaining needed:", result1.remainingForNextLot);
console.table(result1.lotsAffected);

if (
  result1.lotsAffected[0].id === "1" &&
  result1.lotsAffected[0].gramsConsumed === 5
) {
  console.log("✅ PASS: Correctly consumed from first lot");
} else {
  console.error("❌ FAIL: Incorrect consumption");
}

console.log(
  "\n--- Test 2: Consume 15g (Should take 10g from Lot 1, 5g from Lot 2) - RESETTING INVENTORY FIRST ---"
);
// Note: The function is pure, so we reuse mockInventory
const result2 = consumeMetalFIFO(15, mockInventory);
console.log("Consumed Value:", result2.consumedValue);
console.table(result2.lotsAffected);

const expectedValue2 = 10 * 100 + 5 * 110;
if (
  result2.consumedValue === expectedValue2 &&
  result2.lotsAffected.length === 2
) {
  console.log(
    `✅ PASS: Correctly spanned multiple lots. Value: ${result2.consumedValue}`
  );
} else {
  console.error(
    `❌ FAIL: Expected ${expectedValue2}, got ${result2.consumedValue}`
  );
}

console.log("\n--- Test 3: Consume MORE than available (40g) ---");
const result3 = consumeMetalFIFO(40, mockInventory);
console.log("Remaining needed (Should be 5):", result3.remainingForNextLot);
if (result3.remainingForNextLot === 5) {
  console.log("✅ PASS: Correctly reported shortage");
} else {
  console.error("❌ FAIL: Incorrect shortage report");
}
