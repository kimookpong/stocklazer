"use server"

import {
  getTopGainersLosers,
  getGlobalQuote,
  getDailyTimeSeries,
  getSMA,
  getRSI,
  getCompanyOverview,
  type TopGainersLosersResponse,
  type AlphaVantageQuote,
  type AlphaVantageTimeSeriesDaily,
  type TechnicalIndicatorResponse,
  type RSIResponse,
  type APIError,
} from "./alpha-vantage"

// Server action to get market overview data
export async function getMarketOverviewAction(): Promise<{
  success: boolean
  data?: TopGainersLosersResponse
  error?: APIError
}> {
  try {
    const data = await getTopGainersLosers()
    return { success: true, data }
  } catch (error) {
    try {
      const apiError = JSON.parse((error as Error).message) as APIError
      return { success: false, error: apiError }
    } catch {
      return {
        success: false,
        error: {
          type: "UNKNOWN",
          message: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาลองใหม่อีกครั้ง",
        },
      }
    }
  }
}

// Server action to get stock quote
export async function getStockQuoteAction(symbol: string): Promise<{
  success: boolean
  data?: AlphaVantageQuote
  error?: APIError
}> {
  try {
    const data = await getGlobalQuote(symbol)
    return { success: true, data }
  } catch (error) {
    try {
      const apiError = JSON.parse((error as Error).message) as APIError
      return { success: false, error: apiError }
    } catch {
      return {
        success: false,
        error: {
          type: "UNKNOWN",
          message: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาลองใหม่อีกครั้ง",
        },
      }
    }
  }
}

// Server action to get historical data
export async function getHistoricalDataAction(
  symbol: string,
  outputSize: "compact" | "full" = "compact",
): Promise<{
  success: boolean
  data?: AlphaVantageTimeSeriesDaily
  error?: APIError
}> {
  try {
    const data = await getDailyTimeSeries(symbol, outputSize)
    return { success: true, data }
  } catch (error) {
    try {
      const apiError = JSON.parse((error as Error).message) as APIError
      return { success: false, error: apiError }
    } catch {
      return {
        success: false,
        error: {
          type: "UNKNOWN",
          message: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาลองใหม่อีกครั้ง",
        },
      }
    }
  }
}

// Server action to get SMA data
export async function getSMAAction(
  symbol: string,
  interval = "daily",
  timePeriod = 20,
  seriesType = "close",
): Promise<{
  success: boolean
  data?: TechnicalIndicatorResponse
  error?: APIError
}> {
  try {
    const data = await getSMA(symbol, interval, timePeriod, seriesType)
    return { success: true, data }
  } catch (error) {
    try {
      const apiError = JSON.parse((error as Error).message) as APIError
      return { success: false, error: apiError }
    } catch {
      return {
        success: false,
        error: {
          type: "UNKNOWN",
          message: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาลองใหม่อีกครั้ง",
        },
      }
    }
  }
}

// Server action to get RSI data
export async function getRSIAction(
  symbol: string,
  interval = "daily",
  timePeriod = 14,
  seriesType = "close",
): Promise<{
  success: boolean
  data?: RSIResponse
  error?: APIError
}> {
  try {
    const data = await getRSI(symbol, interval, timePeriod, seriesType)
    return { success: true, data }
  } catch (error) {
    try {
      const apiError = JSON.parse((error as Error).message) as APIError
      return { success: false, error: apiError }
    } catch {
      return {
        success: false,
        error: {
          type: "UNKNOWN",
          message: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาลองใหม่อีกครั้ง",
        },
      }
    }
  }
}

// Server action to get company overview
export async function getCompanyOverviewAction(symbol: string): Promise<{
  success: boolean
  data?: any
  error?: APIError
}> {
  try {
    const data = await getCompanyOverview(symbol)
    return { success: true, data }
  } catch (error) {
    try {
      const apiError = JSON.parse((error as Error).message) as APIError
      return { success: false, error: apiError }
    } catch {
      return {
        success: false,
        error: {
          type: "UNKNOWN",
          message: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาลองใหม่อีกครั้ง",
        },
      }
    }
  }
}
