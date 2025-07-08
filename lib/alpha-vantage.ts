// Alpha Vantage API integration - Server-side only
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY || "0096TNQTJX4RAU4I";
const BASE_URL = "https://www.alphavantage.co/query";

export interface AlphaVantageQuote {
  "01. symbol": string;
  "02. open": string;
  "03. high": string;
  "04. low": string;
  "05. price": string;
  "06. volume": string;
  "07. latest trading day": string;
  "08. previous close": string;
  "09. change": string;
  "10. change percent": string;
}

export interface AlphaVantageTimeSeriesDaily {
  "Meta Data": {
    "1. Information": string;
    "2. Symbol": string;
    "3. Last Refreshed": string;
    "4. Output Size": string;
    "5. Time Zone": string;
  };
  "Time Series (Daily)": {
    [date: string]: {
      "1. open": string;
      "2. high": string;
      "3. low": string;
      "4. close": string;
      "5. volume": string;
    };
  };
}

export interface TechnicalIndicatorResponse {
  "Meta Data": {
    "1: Symbol": string;
    "2: Indicator": string;
    "3: Last Refreshed": string;
    "4: Interval": string;
    "5: Time Period": number;
    "6: Series Type": string;
    "7: Time Zone": string;
  };
  "Technical Analysis: SMA": {
    [date: string]: {
      SMA: string;
    };
  };
}

export interface RSIResponse {
  "Meta Data": {
    "1: Symbol": string;
    "2: Indicator": string;
    "3: Last Refreshed": string;
    "4: Interval": string;
    "5: Time Period": number;
    "6: Series Type": string;
    "7: Time Zone": string;
  };
  "Technical Analysis: RSI": {
    [date: string]: {
      RSI: string;
    };
  };
}

export interface TopGainersLosersResponse {
  metadata: string;
  last_updated: string;
  top_gainers: Array<{
    ticker: string;
    price: string;
    change_amount: string;
    change_percentage: string;
    volume: string;
  }>;
  top_losers: Array<{
    ticker: string;
    price: string;
    change_amount: string;
    change_percentage: string;
    volume: string;
  }>;
  most_actively_traded: Array<{
    ticker: string;
    price: string;
    change_amount: string;
    change_percentage: string;
    volume: string;
  }>;
}

export interface APIError {
  type: "RATE_LIMIT" | "INVALID_SYMBOL" | "NETWORK_ERROR" | "UNKNOWN";
  message: string;
  retryAfter?: number;
}

export function createAPIError(data: any, response?: Response): APIError {
  // ตรวจสอบ rate limit
  if (data["Note"] && data["Note"].includes("call frequency")) {
    return {
      type: "RATE_LIMIT",
      message:
        "เกินขีดจำกัดการเรียก API (5 ครั้ง/นาที) กรุณารอสักครู่แล้วลองใหม่",
      retryAfter: 60, // วินาที
    };
  }

  if (data["Note"] && data["Note"].includes("premium")) {
    return {
      type: "RATE_LIMIT",
      message:
        "เกินขีดจำกัดการเรียก API รายวัน (500 ครั้ง/วัน) กรุณาลองใหม่พรุ่งนี้",
      retryAfter: 86400, // 24 ชั่วโมง
    };
  }

  // ตรวจสอบ invalid symbol
  if (data["Error Message"]) {
    return {
      type: "INVALID_SYMBOL",
      message: `ไม่พบข้อมูลหุ้น: ${data["Error Message"]}`,
    };
  }

  // ตรวจสอบ network error
  if (response && !response.ok) {
    return {
      type: "NETWORK_ERROR",
      message: `เกิดข้อผิดพลาดในการเชื่อมต่อ: ${response.status} ${response.statusText}`,
    };
  }

  return {
    type: "UNKNOWN",
    message: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาลองใหม่อีกครั้ง",
  };
}

// Get top gainers, losers, and most actively traded
export async function getTopGainersLosers(): Promise<TopGainersLosersResponse> {
  const response = await fetch(
    `${BASE_URL}?function=TOP_GAINERS_LOSERS&apikey=${API_KEY}`
  );

  if (!response.ok) {
    const error = createAPIError({}, response);
    throw new Error(JSON.stringify(error));
  }

  const data = await response.json();

  if (data["Error Message"] || data["Note"]) {
    const error = createAPIError(data, response);
    throw new Error(JSON.stringify(error));
  }

  return data;
}

// Get real-time quote
export async function getGlobalQuote(
  symbol: string
): Promise<AlphaVantageQuote> {
  const response = await fetch(
    `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
  );

  if (!response.ok) {
    const error = createAPIError({}, response);
    throw new Error(JSON.stringify(error));
  }

  const data = await response.json();

  if (data["Error Message"] || data["Note"]) {
    const error = createAPIError(data, response);
    throw new Error(JSON.stringify(error));
  }

  return data["Global Quote"];
}

// Get historical daily data
export async function getDailyTimeSeries(
  symbol: string,
  outputSize: "compact" | "full" = "compact"
): Promise<AlphaVantageTimeSeriesDaily> {
  const response = await fetch(
    `${BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=${outputSize}&apikey=${API_KEY}`
  );

  if (!response.ok) {
    const error = createAPIError({}, response);
    throw new Error(JSON.stringify(error));
  }

  const data = await response.json();

  if (data["Error Message"] || data["Note"]) {
    const error = createAPIError(data, response);
    throw new Error(JSON.stringify(error));
  }

  return data;
}

// Get SMA (Simple Moving Average)
export async function getSMA(
  symbol: string,
  interval = "daily",
  timePeriod = 20,
  seriesType = "close"
): Promise<TechnicalIndicatorResponse> {
  const response = await fetch(
    `${BASE_URL}?function=SMA&symbol=${symbol}&interval=${interval}&time_period=${timePeriod}&series_type=${seriesType}&apikey=${API_KEY}`
  );

  if (!response.ok) {
    const error = createAPIError({}, response);
    throw new Error(JSON.stringify(error));
  }

  const data = await response.json();

  if (data["Error Message"] || data["Note"]) {
    const error = createAPIError(data, response);
    throw new Error(JSON.stringify(error));
  }

  return data;
}

// Get RSI (Relative Strength Index)
export async function getRSI(
  symbol: string,
  interval = "daily",
  timePeriod = 14,
  seriesType = "close"
): Promise<RSIResponse> {
  const response = await fetch(
    `${BASE_URL}?function=RSI&symbol=${symbol}&interval=${interval}&time_period=${timePeriod}&series_type=${seriesType}&apikey=${API_KEY}`
  );

  if (!response.ok) {
    const error = createAPIError({}, response);
    throw new Error(JSON.stringify(error));
  }

  const data = await response.json();

  if (data["Error Message"] || data["Note"]) {
    const error = createAPIError(data, response);
    throw new Error(JSON.stringify(error));
  }

  return data;
}

// Get company overview (fundamental data)
export async function getCompanyOverview(symbol: string) {
  const response = await fetch(
    `${BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`
  );

  if (!response.ok) {
    const error = createAPIError({}, response);
    throw new Error(JSON.stringify(error));
  }

  const data = await response.json();

  if (data["Error Message"] || data["Note"]) {
    const error = createAPIError(data, response);
    throw new Error(JSON.stringify(error));
  }

  return data;
}

// Helper function to calculate percentage change
export function calculatePercentageChange(
  current: number,
  previous: number
): number {
  return ((current - previous) / previous) * 100;
}

// Helper function to format market cap
export function formatMarketCap(marketCap: string): string {
  const value = Number.parseFloat(marketCap);
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
export function formatVolume(volume: string): string {
  const value = Number.parseFloat(volume);
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
export function calculateSupportResistance(priceData: {
  [date: string]: { "4. close": string };
}) {
  const prices = Object.values(priceData)
    .map((day) => Number.parseFloat(day["4. close"]))
    .slice(0, 50); // Last 50 days

  const sortedPrices = [...prices].sort((a, b) => a - b);
  const support = sortedPrices[Math.floor(sortedPrices.length * 0.1)]; // 10th percentile
  const resistance = sortedPrices[Math.floor(sortedPrices.length * 0.9)]; // 90th percentile

  return { support, resistance };
}
