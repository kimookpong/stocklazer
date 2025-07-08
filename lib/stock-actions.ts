"use server";

import {
  getMarketSummary,
  getQuote,
  getHistoricalData,
  calculateSMA,
  calculateRSI,
  getCompanyProfile,
  type YahooMarketSummary,
  type YahooQuote,
  type YahooHistoricalData,
  type TechnicalIndicator,
  type APIError,
} from "./yahoo-finance";

// Server action to get market overview data
export async function getMarketOverviewAction(): Promise<{
  success: boolean;
  data?: YahooMarketSummary;
  error?: APIError;
}> {
  try {
    const data = await getMarketSummary();
    return { success: true, data };
  } catch (error) {
    try {
      const apiError = JSON.parse((error as Error).message) as APIError;
      return { success: false, error: apiError };
    } catch {
      return {
        success: false,
        error: {
          type: "UNKNOWN",
          message: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาลองใหม่อีกครั้ง",
        },
      };
    }
  }
}

// Server action to get stock quote
export async function getStockQuoteAction(symbol: string): Promise<{
  success: boolean;
  data?: any;
  error?: APIError;
}> {
  try {
    const data = await getQuote(symbol);
    return { success: true, data };
  } catch (error) {
    try {
      const apiError = JSON.parse((error as Error).message) as APIError;
      return { success: false, error: apiError };
    } catch {
      return {
        success: false,
        error: {
          type: "UNKNOWN",
          message: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาลองใหม่อีกครั้ง",
        },
      };
    }
  }
}

// Server action to get historical data
export async function getHistoricalDataAction(
  symbol: string,
  period1: string | Date = "2023-01-01",
  period2: string | Date = new Date(),
  interval: "1d" | "1wk" | "1mo" = "1d"
): Promise<{
  success: boolean;
  data?: YahooHistoricalData[];
  error?: APIError;
}> {
  try {
    const data = await getHistoricalData(symbol, period1, period2, interval);
    return { success: true, data };
  } catch (error) {
    try {
      const apiError = JSON.parse((error as Error).message) as APIError;
      return { success: false, error: apiError };
    } catch {
      return {
        success: false,
        error: {
          type: "UNKNOWN",
          message: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาลองใหม่อีกครั้ง",
        },
      };
    }
  }
}

// Server action to get SMA data
export async function getSMAAction(
  symbol: string,
  period: number = 20
): Promise<{
  success: boolean;
  data?: TechnicalIndicator[];
  error?: APIError;
}> {
  try {
    // Get historical data first
    const historicalData = await getHistoricalData(symbol);
    const data = calculateSMA(historicalData, period);
    return { success: true, data };
  } catch (error) {
    try {
      const apiError = JSON.parse((error as Error).message) as APIError;
      return { success: false, error: apiError };
    } catch {
      return {
        success: false,
        error: {
          type: "UNKNOWN",
          message: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาลองใหม่อีกครั้ง",
        },
      };
    }
  }
}

// Server action to get RSI data
export async function getRSIAction(
  symbol: string,
  period: number = 14
): Promise<{
  success: boolean;
  data?: TechnicalIndicator[];
  error?: APIError;
}> {
  try {
    // Get historical data first
    const historicalData = await getHistoricalData(symbol);
    const data = calculateRSI(historicalData, period);

    return { success: true, data };
  } catch (error) {
    try {
      const apiError = JSON.parse((error as Error).message) as APIError;
      return { success: false, error: apiError };
    } catch {
      return {
        success: false,
        error: {
          type: "UNKNOWN",
          message: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาลองใหม่อีกครั้ง",
        },
      };
    }
  }
}

// Server action to get company overview
export async function getCompanyOverviewAction(symbol: string): Promise<{
  success: boolean;
  data?: any;
  error?: APIError;
}> {
  try {
    const data = await getCompanyProfile(symbol);
    return { success: true, data };
  } catch (error) {
    try {
      const apiError = JSON.parse((error as Error).message) as APIError;
      return { success: false, error: apiError };
    } catch {
      return {
        success: false,
        error: {
          type: "UNKNOWN",
          message: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาลองใหม่อีกครั้ง",
        },
      };
    }
  }
}
