const yahooFinance = require("yahoo-finance2").default;

async function testYahooData() {
  try {
    const symbol = "AAPL";

    // Test quote data
    const quote = await yahooFinance.quote(symbol);
    console.log("Quote data:", {
      symbol: quote.symbol,
      marketCap: quote.marketCap,
      regularMarketPrice: quote.regularMarketPrice,
      trailingPE: quote.trailingPE,
      dividendYield: quote.dividendYield,
    });

    // Test quoteSummary for comprehensive data
    const quoteSummary = await yahooFinance.quoteSummary(symbol, {
      modules: [
        "financialData",
        "defaultKeyStatistics",
        "incomeStatementHistory",
        "incomeStatementHistoryQuarterly",
        "assetProfile",
        "summaryProfile",
      ],
    });

    console.log("Financial data:", {
      revenueGrowth: quoteSummary.financialData?.revenueGrowth?.raw,
      earningsGrowth: quoteSummary.financialData?.earningsGrowth?.raw,
      totalRevenue:
        quoteSummary.incomeStatementHistory?.incomeStatementHistory[0]
          ?.totalRevenue?.raw,
      marketCap: quoteSummary.defaultKeyStatistics?.marketCap?.raw,
    });

    // Calculate PS Ratio if we have the data
    const marketCap =
      quoteSummary.defaultKeyStatistics?.marketCap?.raw || quote.marketCap;
    const totalRevenue =
      quoteSummary.incomeStatementHistory?.incomeStatementHistory[0]
        ?.totalRevenue?.raw;

    if (marketCap && totalRevenue) {
      const psRatio = marketCap / totalRevenue;
      console.log("PS Ratio:", psRatio);
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

testYahooData();
