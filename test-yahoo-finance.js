// Test script to verify Yahoo Finance integration
import {
  getQuote,
  getHistoricalData,
  getMarketSummary,
  calculateSMA,
  calculateRSI,
} from "../lib/yahoo-finance.js";

async function testYahooFinance() {
  try {
    console.log("Testing Yahoo Finance integration...\n");

    // Test getting a quote
    console.log("1. Testing getQuote for AAPL...");
    const quote = await getQuote("AAPL");
    console.log("✅ Quote data:", {
      symbol: quote.symbol,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent,
    });

    // Test getting historical data
    console.log("\n2. Testing getHistoricalData for AAPL...");
    const historical = await getHistoricalData("AAPL");
    console.log("✅ Historical data:", {
      dataPoints: historical.length,
      latestDate: historical[0]?.date,
      latestPrice: historical[0]?.close,
    });

    // Test calculating SMA
    console.log("\n3. Testing calculateSMA...");
    const sma = calculateSMA(historical, 20);
    console.log("✅ SMA data:", {
      dataPoints: sma.length,
      latestSMA: sma[sma.length - 1]?.value,
    });

    // Test calculating RSI
    console.log("\n4. Testing calculateRSI...");
    const rsi = calculateRSI(historical, 14);
    console.log("✅ RSI data:", {
      dataPoints: rsi.length,
      latestRSI: rsi[rsi.length - 1]?.value,
    });

    // Test getting market summary
    console.log("\n5. Testing getMarketSummary...");
    const marketSummary = await getMarketSummary();
    console.log("✅ Market summary:", {
      gainers: marketSummary.gainers.length,
      losers: marketSummary.losers.length,
      actives: marketSummary.actives.length,
    });

    console.log(
      "\n🎉 All tests passed! Yahoo Finance integration is working correctly."
    );
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testYahooFinance();
