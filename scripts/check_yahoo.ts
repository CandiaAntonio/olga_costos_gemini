import yahooFinanceDefault from "yahoo-finance2";
import * as yahooFinanceStar from "yahoo-finance2";

console.log("Type of default export:", typeof yahooFinanceDefault);
console.log(
  "Is default export a class?",
  yahooFinanceDefault.toString().startsWith("class")
);
console.log("Keys of default export:", Object.keys(yahooFinanceDefault));

console.log("Keys of star export:", Object.keys(yahooFinanceStar));

try {
  const yf = new yahooFinanceDefault();
  console.log("Successfully instantiated new yahooFinanceDefault()");
} catch (e: any) {
  console.log("Failed to instantiate default:", e.message);
}
