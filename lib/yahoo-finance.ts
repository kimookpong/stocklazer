// Yahoo Finance API integration - Server-side only
import yahooFinance from "yahoo-finance2";

export interface YahooQuote {
  symbol: string;
  regularMarketPrice: number;
  regularMarketPreviousClose: number;
  regularMarketOpen: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketVolume: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  marketCap?: number;
  trailingPE?: number;
  forwardPE?: number;
  dividendYield?: number;
  beta?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  averageVolume?: number;
  shortName?: string;
  longName?: string;
  currency?: string;
  exchangeName?: string;
}

export interface YahooHistoricalData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  adjClose: number;
  volume: number;
}

export interface YahooMarketSummary {
  gainers: Array<{
    symbol: string;
    shortName: string;
    regularMarketPrice: number;
    regularMarketChange: number;
    regularMarketChangePercent: number;
    regularMarketVolume: number;
  }>;
  losers: Array<{
    symbol: string;
    shortName: string;
    regularMarketPrice: number;
    regularMarketChange: number;
    regularMarketChangePercent: number;
    regularMarketVolume: number;
  }>;
  actives: Array<{
    symbol: string;
    shortName: string;
    regularMarketPrice: number;
    regularMarketChange: number;
    regularMarketChangePercent: number;
    regularMarketVolume: number;
  }>;
}

export interface TechnicalIndicator {
  date: string;
  value: number;
}

export interface APIError {
  type: "RATE_LIMIT" | "INVALID_SYMBOL" | "NETWORK_ERROR" | "UNKNOWN";
  message: string;
  retryAfter?: number;
}

export function createAPIError(error: any): APIError {
  if (error.message && error.message.includes("rate limit")) {
    return {
      type: "RATE_LIMIT",
      message: "เกินขีดจำกัดการเรียก API กรุณารอสักครู่แล้วลองใหม่",
      retryAfter: 60,
    };
  }

  if (error.message && error.message.includes("invalid symbol")) {
    return {
      type: "INVALID_SYMBOL",
      message: `ไม่พบข้อมูลหุ้น: ${error.message}`,
    };
  }

  if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
    return {
      type: "NETWORK_ERROR",
      message:
        "เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต",
    };
  }

  return {
    type: "UNKNOWN",
    message: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาลองใหม่อีกครั้ง",
  };
}

// Get trending stocks (gainers, losers, actives)
export async function getMarketSummary(): Promise<YahooMarketSummary> {
  try {
    // Get trending tickers
    const trending = await yahooFinance.trendingSymbols("US");

    // Get quotes for trending symbols (limited to first 10 for performance)
    const symbols = trending.quotes.slice(0, 10).map((q) => q.symbol);
    const quotes = await yahooFinance.quote(symbols);

    // Sort into gainers, losers, and actives based on change percent
    const validQuotes = Object.values(quotes).filter(
      (q) =>
        q.regularMarketPrice &&
        q.regularMarketChangePercent !== undefined &&
        q.regularMarketVolume
    );

    const gainers = validQuotes
      .filter((q) => (q.regularMarketChangePercent || 0) > 0)
      .sort(
        (a, b) =>
          (b.regularMarketChangePercent || 0) -
          (a.regularMarketChangePercent || 0)
      )
      .slice(0, 10)
      .map((q) => ({
        symbol: q.symbol || "",
        shortName: q.shortName || q.symbol || "",
        regularMarketPrice: q.regularMarketPrice || 0,
        regularMarketChange: q.regularMarketChange || 0,
        regularMarketChangePercent: q.regularMarketChangePercent || 0,
        regularMarketVolume: q.regularMarketVolume || 0,
      }));

    const losers = validQuotes
      .filter((q) => (q.regularMarketChangePercent || 0) < 0)
      .sort(
        (a, b) =>
          (a.regularMarketChangePercent || 0) -
          (b.regularMarketChangePercent || 0)
      )
      .slice(0, 10)
      .map((q) => ({
        symbol: q.symbol || "",
        shortName: q.shortName || q.symbol || "",
        regularMarketPrice: q.regularMarketPrice || 0,
        regularMarketChange: q.regularMarketChange || 0,
        regularMarketChangePercent: q.regularMarketChangePercent || 0,
        regularMarketVolume: q.regularMarketVolume || 0,
      }));

    const actives = validQuotes
      .sort(
        (a, b) => (b.regularMarketVolume || 0) - (a.regularMarketVolume || 0)
      )
      .slice(0, 10)
      .map((q) => ({
        symbol: q.symbol || "",
        shortName: q.shortName || q.symbol || "",
        regularMarketPrice: q.regularMarketPrice || 0,
        regularMarketChange: q.regularMarketChange || 0,
        regularMarketChangePercent: q.regularMarketChangePercent || 0,
        regularMarketVolume: q.regularMarketVolume || 0,
      }));

    return { gainers, losers, actives };
  } catch (error) {
    throw new Error(JSON.stringify(createAPIError(error)));
  }
}

// Get real-time quote
export async function getQuote(symbol: string): Promise<YahooQuote> {
  try {
    const quote = await yahooFinance.quote(symbol);

    if (!quote || !quote.regularMarketPrice) {
      throw new Error(`ไม่พบข้อมูลหุ้น ${symbol}`);
    }

    return {
      symbol: quote.symbol || symbol,
      regularMarketPrice: quote.regularMarketPrice || 0,
      regularMarketPreviousClose: quote.regularMarketPreviousClose || 0,
      regularMarketOpen: quote.regularMarketOpen || 0,
      regularMarketDayHigh: quote.regularMarketDayHigh || 0,
      regularMarketDayLow: quote.regularMarketDayLow || 0,
      regularMarketVolume: quote.regularMarketVolume || 0,
      regularMarketChange: quote.regularMarketChange || 0,
      regularMarketChangePercent: quote.regularMarketChangePercent || 0,
      marketCap: quote.marketCap || undefined,
      trailingPE: quote.trailingPE || undefined,
      forwardPE: quote.forwardPE || undefined,
      dividendYield: quote.dividendYield || undefined,
      beta: quote.beta || undefined,
      fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh || undefined,
      fiftyTwoWeekLow: quote.fiftyTwoWeekLow || undefined,
      averageVolume: quote.averageVolume || undefined,
      shortName: quote.shortName || symbol,
      longName: quote.longName || quote.shortName || symbol,
      currency: quote.currency || "USD",
      exchangeName: quote.fullExchangeName || "Unknown",
    };
  } catch (error) {
    throw new Error(JSON.stringify(createAPIError(error)));
  }
}

// Get historical daily data
export async function getHistoricalData(
  symbol: string,
  period1: string | Date = "2023-01-01",
  period2: string | Date = new Date(),
  interval: "1d" | "1wk" | "1mo" = "1d"
): Promise<YahooHistoricalData[]> {
  try {
    const result = await yahooFinance.historical(symbol, {
      period1,
      period2,
      interval,
    });

    return result.map((item) => ({
      date: item.date,
      open: item.open || 0,
      high: item.high || 0,
      low: item.low || 0,
      close: item.close || 0,
      adjClose: item.adjClose || 0,
      volume: item.volume || 0,
    }));
  } catch (error) {
    throw new Error(JSON.stringify(createAPIError(error)));
  }
}

// Calculate Simple Moving Average from historical data
export function calculateSMA(
  historicalData: YahooHistoricalData[],
  period: number = 20
): TechnicalIndicator[] {
  const smaData: TechnicalIndicator[] = [];

  for (let i = period - 1; i < historicalData.length; i++) {
    const slice = historicalData.slice(i - period + 1, i + 1);
    const sum = slice.reduce((acc, item) => acc + item.close, 0);
    const sma = sum / period;

    smaData.push({
      date: historicalData[i].date.toISOString().split("T")[0],
      value: sma,
    });
  }

  return smaData;
}

// Calculate RSI (Relative Strength Index) from historical data
export function calculateRSI(
  historicalData: YahooHistoricalData[],
  period: number = 14
): TechnicalIndicator[] {
  const rsiData: TechnicalIndicator[] = [];
  const gains: number[] = [];
  const losses: number[] = [];

  // Calculate price changes
  for (let i = 1; i < historicalData.length; i++) {
    const change = historicalData[i].close - historicalData[i - 1].close;
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }

  // Calculate RSI for each period
  for (let i = period - 1; i < gains.length; i++) {
    const gainSlice = gains.slice(i - period + 1, i + 1);
    const lossSlice = losses.slice(i - period + 1, i + 1);

    const avgGain = gainSlice.reduce((sum, gain) => sum + gain, 0) / period;
    const avgLoss = lossSlice.reduce((sum, loss) => sum + loss, 0) / period;

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);

    rsiData.push({
      date: historicalData[i + 1].date.toISOString().split("T")[0],
      value: rsi,
    });
  }

  return rsiData;
}

// Get company profile information
export async function getCompanyProfile(symbol: string) {
  try {
    const [quote, quoteSummary] = await Promise.all([
      yahooFinance.quote(symbol),
      yahooFinance.quoteSummary(symbol, {
        modules: [
          "assetProfile",
          "summaryProfile",
          "financialData",
          "defaultKeyStatistics",
          "incomeStatementHistory",
          "incomeStatementHistoryQuarterly",
          "cashflowStatementHistory",
          "balanceSheetHistory",
          "earningsHistory",
          "earnings",
        ],
      }),
    ]);

    const profile = quoteSummary.assetProfile || quoteSummary.summaryProfile;
    const financials = quoteSummary.financialData;
    const keyStats = quoteSummary.defaultKeyStatistics;
    const incomeHistory = quoteSummary.incomeStatementHistory;
    const quarterlyIncome = quoteSummary.incomeStatementHistoryQuarterly;
    const cashflow = quoteSummary.cashflowStatementHistory;
    const balanceSheet = quoteSummary.balanceSheetHistory;
    const earnings = quoteSummary.earnings;
    const earningsHistory = quoteSummary.earningsHistory;

    // Calculate revenue growth from historical data
    const calculateRevenueGrowth = () => {
      if (
        !incomeHistory?.incomeStatementHistory ||
        incomeHistory.incomeStatementHistory.length < 2
      ) {
        return null;
      }

      const statements = incomeHistory.incomeStatementHistory;
      const current = statements[0]?.totalRevenue?.raw;
      const previous = statements[1]?.totalRevenue?.raw;

      if (!current || !previous) return null;

      return (current - previous) / previous;
    };

    // Calculate quarterly revenue growth
    const calculateQuarterlyRevenueGrowth = () => {
      if (
        !quarterlyIncome?.incomeStatementHistory ||
        quarterlyIncome.incomeStatementHistory.length < 4
      ) {
        return null;
      }

      const statements = quarterlyIncome.incomeStatementHistory;
      const currentQuarter = statements[0]?.totalRevenue?.raw;
      const yearAgoQuarter = statements[3]?.totalRevenue?.raw; // Same quarter last year

      if (!currentQuarter || !yearAgoQuarter) return null;

      return (currentQuarter - yearAgoQuarter) / yearAgoQuarter;
    };

    // Get latest revenue data
    const getLatestRevenue = () => {
      if (
        !incomeHistory?.incomeStatementHistory ||
        incomeHistory.incomeStatementHistory.length === 0
      ) {
        return null;
      }

      return incomeHistory.incomeStatementHistory[0]?.totalRevenue?.raw;
    };

    // Get latest net income
    const getLatestNetIncome = () => {
      if (
        !incomeHistory?.incomeStatementHistory ||
        incomeHistory.incomeStatementHistory.length === 0
      ) {
        return null;
      }

      return incomeHistory.incomeStatementHistory[0]?.netIncome?.raw;
    };

    // Get latest gross profit
    const getLatestGrossProfit = () => {
      if (
        !incomeHistory?.incomeStatementHistory ||
        incomeHistory.incomeStatementHistory.length === 0
      ) {
        return null;
      }

      return incomeHistory.incomeStatementHistory[0]?.grossProfit?.raw;
    };

    // Calculate profit margins
    const calculateProfitMargins = () => {
      const revenue = getLatestRevenue();
      const netIncome = getLatestNetIncome();
      const grossProfit = getLatestGrossProfit();

      if (!revenue) return { netMargin: null, grossMargin: null };

      return {
        netMargin: netIncome ? netIncome / revenue : null,
        grossMargin: grossProfit ? grossProfit / revenue : null,
      };
    };

    const margins = calculateProfitMargins();

    return {
      symbol: quote.symbol,
      longName: quote.longName || quote.shortName,
      shortName: quote.shortName,
      description: profile?.longBusinessSummary,
      sector: profile?.sector,
      industry: profile?.industry,
      website: profile?.website,
      employees: profile?.fullTimeEmployees,
      city: profile?.city,
      state: profile?.state,
      country: profile?.country,
      marketCap: quote.marketCap,
      enterpriseValue: keyStats?.enterpriseValue?.raw,
      trailingPE: quote.trailingPE,
      forwardPE: quote.forwardPE,
      pegRatio: keyStats?.pegRatio?.raw,
      priceToBook: keyStats?.priceToBook?.raw,
      debtToEquity: financials?.debtToEquity?.raw,
      returnOnEquity: financials?.returnOnEquity?.raw,
      revenueGrowth: financials?.revenueGrowth?.raw || calculateRevenueGrowth(),
      earningsGrowth: financials?.earningsGrowth?.raw,
      currentRatio: financials?.currentRatio?.raw,
      dividendYield: quote.dividendYield,
      payoutRatio: keyStats?.payoutRatio?.raw,
      beta: quote.beta,
      fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
      // Additional revenue and financial data
      totalRevenue: getLatestRevenue(),
      netIncome: getLatestNetIncome(),
      grossProfit: getLatestGrossProfit(),
      netProfitMargin: margins.netMargin,
      grossProfitMargin: margins.grossMargin,
      quarterlyRevenueGrowth: calculateQuarterlyRevenueGrowth(),
      operatingMargin: financials?.operatingMargins?.raw,
      ebitdaMargin: financials?.ebitdaMargins?.raw,
      // Revenue history for trend analysis
      revenueHistory:
        incomeHistory?.incomeStatementHistory?.slice(0, 4).map((statement) => ({
          endDate: statement.endDate?.fmt,
          revenue: statement.totalRevenue?.raw,
          netIncome: statement.netIncome?.raw,
          grossProfit: statement.grossProfit?.raw,
        })) || [],
      // Quarterly data
      quarterlyRevenueHistory:
        quarterlyIncome?.incomeStatementHistory
          ?.slice(0, 8)
          .map((statement) => ({
            endDate: statement.endDate?.fmt,
            revenue: statement.totalRevenue?.raw,
            netIncome: statement.netIncome?.raw,
          })) || [],
    };
  } catch (error) {
    throw new Error(JSON.stringify(createAPIError(error)));
  }
}

// Helper function to calculate percentage change
export function calculatePercentageChange(
  current: number,
  previous: number
): number {
  return ((current - previous) / previous) * 100;
}

// Helper function to format market cap
export function formatMarketCap(
  marketCap: number | string | undefined | null
): string {
  // Convert to number and handle invalid values
  const value =
    typeof marketCap === "string" ? parseFloat(marketCap) : marketCap;

  if (!value || isNaN(value) || value <= 0) {
    return "N/A";
  }

  if (value >= 1e12) {
    return `$${(value / 1e12).toFixed(1)}T`;
  } else if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(1)}B`;
  } else if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(1)}M`;
  }
  return `$${value.toFixed(0)}`;
}

// Helper function to format volume
export function formatVolume(
  volume: number | string | undefined | null
): string {
  // Convert to number and handle invalid values
  const value = typeof volume === "string" ? parseFloat(volume) : volume;

  if (!value || isNaN(value) || value <= 0) {
    return "0";
  }

  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(1)}B`;
  } else if (value >= 1e6) {
    return `${(value / 1e6).toFixed(1)}M`;
  } else if (value >= 1e3) {
    return `${(value / 1e3).toFixed(1)}K`;
  }
  return value.toFixed(0);
}

// Helper function to get support and resistance levels from price data
export function calculateSupportResistance(priceData: YahooHistoricalData[]) {
  const prices = priceData.slice(0, 50).map((item) => item.close); // Last 50 days
  const sortedPrices = [...prices].sort((a, b) => a - b);
  const support = sortedPrices[Math.floor(sortedPrices.length * 0.1)]; // 10th percentile
  const resistance = sortedPrices[Math.floor(sortedPrices.length * 0.9)]; // 90th percentile

  return { support, resistance };
}

// Search for stocks by symbol or company name
export async function searchStocks(query: string) {
  try {
    const result = await yahooFinance.search(query);

    return result.quotes
      .filter((item) => item.typeDisp === "Equity" && item.exchDisp)
      .slice(0, 10)
      .map((item) => ({
        symbol: item.symbol,
        shortName: item.shortname || item.longname,
        longName: item.longname,
        exchange: item.exchDisp,
        type: item.typeDisp,
      }));
  } catch (error) {
    throw new Error(JSON.stringify(createAPIError(error)));
  }
}
