import YahooFinance from "yahoo-finance2";

async function main() {
  try {
    const yf = new YahooFinance();
    console.log("Instantiated YF");
    const quote = await yf.quote("GC=F");
    console.log("Quote:", quote);
  } catch (e) {
    console.error("Error with new:", e);
    try {
      console.log("Trying without new...");
      // @ts-ignore
      const quote = await YahooFinance.quote("GC=F");
      console.log("Quote without new:", quote);
    } catch (e2) {
      console.error("Error without new:", e2);
    }
  }
}

main();
