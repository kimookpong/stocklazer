"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  PieChart,
  Percent,
  Building2,
  Calendar,
  Activity,
  Target,
  LineChart,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Wifi,
  WifiOff,
  ArrowLeft,
} from "lucide-react"
import StockChart from "@/components/stock-chart"
import MetricsLegend from "@/components/metrics-legend"
import {
  getGlobalQuote,
  getDailyTimeSeries,
  getSMA,
  getRSI,
  getCompanyOverview,
  formatMarketCap,
  calculateSupportResistance,
  type APIError,
} from "@/lib/alpha-vantage"
import ShareButton from "@/components/share-button"

// Utility function to evaluate financial metrics
const evaluateMetric = (type: string, value: number) => {
  switch (type) {
    case "revenueGrowth":
      if (value > 20)
        return {
          symbol: "🚀",
          color: "text-emerald-600 dark:text-emerald-400",
          level: "ยอดเยี่ยม",
          desc: "การเติบโตสูงมาก",
          score: 100,
        }
      if (value > 10)
        return { symbol: "📈", color: "text-blue-600 dark:text-blue-400", level: "ดี", desc: "การเติบโตดี", score: 80 }
      if (value > 5)
        return {
          symbol: "⚡",
          color: "text-yellow-600 dark:text-yellow-400",
          level: "ปานกลาง",
          desc: "การเติบโตปานกลาง",
          score: 60,
        }
      return {
        symbol: "⚠️",
        color: "text-red-600 dark:text-red-400",
        level: "น่ากังวล",
        desc: "การเติบโตต่ำ",
        score: 20,
      }

    case "profitGrowth":
      if (value > 15)
        return {
          symbol: "🚀",
          color: "text-emerald-600 dark:text-emerald-400",
          level: "ยอดเยี่ยม",
          desc: "กำไรเติบโตสูง",
          score: 100,
        }
      if (value > 5)
        return { symbol: "📈", color: "text-blue-600 dark:text-blue-400", level: "ดี", desc: "กำไรเติบโตดี", score: 80 }
      if (value > 0)
        return {
          symbol: "⚡",
          color: "text-yellow-600 dark:text-yellow-400",
          level: "ปานกลาง",
          desc: "กำไรเติบโตเล็กน้อย",
          score: 60,
        }
      return {
        symbol: "⚠️",
        color: "text-red-600 dark:text-red-400",
        level: "น่ากังวล",
        desc: "กำไรลดลง",
        score: 20,
      }

    case "eps":
      if (value > 5)
        return {
          symbol: "✅",
          color: "text-emerald-600 dark:text-emerald-400",
          level: "ดีมาก",
          desc: "กำไรต่อหุ้นสูง",
          score: 100,
        }
      if (value > 2)
        return { symbol: "📊", color: "text-blue-600 dark:text-blue-400", level: "ดี", desc: "กำไรต่อหุ้นดี", score: 80 }
      if (value > 0)
        return {
          symbol: "⚡",
          color: "text-yellow-600 dark:text-yellow-400",
          level: "ปานกลาง",
          desc: "กำไรต่อหุ้นต่ำ",
          score: 60,
        }
      return { symbol: "❌", color: "text-red-600 dark:text-red-400", level: "ขาดทุน", desc: "บริษัทขาดทุน", score: 0 }

    case "pe":
      if (value < 10)
        return {
          symbol: "💎",
          color: "text-blue-600 dark:text-blue-400",
          level: "ราคาถูก",
          desc: "อาจถูกประเมินต่ำ",
          score: 90,
        }
      if (value < 25)
        return {
          symbol: "⚖️",
          color: "text-emerald-600 dark:text-emerald-400",
          level: "สมดุล",
          desc: "ราคาเหมาะสม",
          score: 80,
        }
      if (value < 40)
        return {
          symbol: "🔥",
          color: "text-orange-600 dark:text-orange-400",
          level: "ราคาสูง",
          desc: "หุ้นเติบโต/แพง",
          score: 50,
        }
      return {
        symbol: "⚠️",
        color: "text-red-600 dark:text-red-400",
        level: "แพงมาก",
        desc: "อาจประเมินสูงเกิน",
        score: 20,
      }

    case "ps":
      if (value < 2)
        return {
          symbol: "💎",
          color: "text-blue-600 dark:text-blue-400",
          level: "ราคาถูก",
          desc: "เทียบยอดขายถูก",
          score: 90,
        }
      if (value < 5)
        return {
          symbol: "⚖️",
          color: "text-emerald-600 dark:text-emerald-400",
          level: "สมดุล",
          desc: "ราคาเหมาะสม",
          score: 80,
        }
      if (value < 10)
        return {
          symbol: "🔥",
          color: "text-orange-600 dark:text-orange-400",
          level: "หุ้นพรีเมี่ยม",
          desc: "ราคาสูง",
          score: 50,
        }
      return {
        symbol: "⚠️",
        color: "text-red-600 dark:text-red-400",
        level: "แพงมาก",
        desc: "ราคาสูงมาก",
        score: 20,
      }

    case "dividend":
      if (value > 6)
        return {
          symbol: "⚠️",
          color: "text-red-600 dark:text-red-400",
          level: "สูงมาก",
          desc: "ควรตรวจสอบ",
          score: 40,
        }
      if (value > 4)
        return {
          symbol: "🏆",
          color: "text-yellow-600 dark:text-yellow-400",
          level: "สูง",
          desc: "หุ้นปันผลดี",
          score: 85,
        }
      if (value > 2)
        return {
          symbol: "💰",
          color: "text-emerald-600 dark:text-emerald-400",
          level: "ปานกลาง",
          desc: "ปันผลสมดุล",
          score: 75,
        }
      if (value > 0)
        return {
          symbol: "🌱",
          color: "text-blue-600 dark:text-blue-400",
          level: "ต่ำ",
          desc: "โฟกัสการเติบโต",
          score: 70,
        }
      return { symbol: "🚫", color: "text-gray-600 dark:text-gray-400", level: "ไม่จ่าย", desc: "ไม่จ่ายปันผล", score: 60 }

    default:
      return { symbol: "📊", color: "text-gray-600 dark:text-gray-400", level: "-", desc: "", score: 50 }
  }
}

// Calculate investment recommendation
const calculateInvestmentScore = (stockData: StockData) => {
  const weights = {
    revenueGrowth: 0.2,
    profitGrowth: 0.2,
    eps: 0.15,
    pe: 0.2,
    ps: 0.15,
    dividend: 0.1,
  }

  const scores = {
    revenueGrowth: evaluateMetric("revenueGrowth", stockData.revenueGrowth).score,
    profitGrowth: evaluateMetric("profitGrowth", stockData.profitGrowth).score,
    eps: evaluateMetric("eps", stockData.eps).score,
    pe: evaluateMetric("pe", stockData.pe).score,
    ps: evaluateMetric("ps", stockData.ps).score,
    dividend: evaluateMetric("dividend", stockData.dividendYield).score,
  }

  const totalScore =
    scores.revenueGrowth * weights.revenueGrowth +
    scores.profitGrowth * weights.profitGrowth +
    scores.eps * weights.eps +
    scores.pe * weights.pe +
    scores.ps * weights.ps +
    scores.dividend * weights.dividend

  return Math.round(totalScore)
}

interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  marketCap: string
  pe: number
  eps: number
  dividendYield: number
  avgDividend5Y: number
  revenueGrowth: number
  profitGrowth: number
  ps: number
  chartData: Array<{ date: string; price: number }>
}

interface TrendData {
  sma20: number
  sma50: number
  rsi: number
  macd: number
  volume: number
  support: number
  resistance: number
}

interface StockDashboardProps {
  symbol: string
}

export default function StockDashboard({ symbol }: StockDashboardProps) {
  const [stockData, setStockData] = useState<StockData | null>(null)
  const [trendData, setTrendData] = useState<TrendData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRealData, setIsRealData] = useState(false)
  const [apiError, setApiError] = useState<APIError | null>(null)
  const [retryCountdown, setRetryCountdown] = useState<number>(0)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (retryCountdown > 0) {
      interval = setInterval(() => {
        setRetryCountdown((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [retryCountdown])

  const fetchStockData = async () => {
    setLoading(true)
    setError(null)
    setApiError(null)
    setIsRealData(false)

    try {
      // Try to fetch real data from Alpha Vantage
      const [quoteData, timeSeriesData, companyData] = await Promise.all([
        getGlobalQuote(symbol),
        getDailyTimeSeries(symbol, "compact"),
        getCompanyOverview(symbol),
      ])

      // Process time series data for chart
      const timeSeries = timeSeriesData["Time Series (Daily)"]
      const chartData = Object.entries(timeSeries)
        .slice(0, 60) // Last 60 days
        .reverse()
        .map(([date, data]) => ({
          date,
          price: Number.parseFloat(data["4. close"]),
        }))

      // Calculate support and resistance
      const { support, resistance } = calculateSupportResistance(timeSeries)

      // Try to fetch technical indicators
      let sma20Data, sma50Data, rsiData
      try {
        ;[sma20Data, sma50Data, rsiData] = await Promise.all([
          getSMA(symbol, "daily", 20),
          getSMA(symbol, "daily", 50),
          getRSI(symbol, "daily", 14),
        ])
      } catch (techError) {
        console.warn("Technical indicators failed, using calculated values:", techError)
      }

      // Get latest SMA and RSI values
      const latestSMA20 = sma20Data ? Object.values(sma20Data["Technical Analysis: SMA"])[0]?.SMA : null
      const latestSMA50 = sma50Data ? Object.values(sma50Data["Technical Analysis: SMA"])[0]?.SMA : null
      const latestRSI = rsiData ? Object.values(rsiData["Technical Analysis: RSI"])[0]?.RSI : null

      // Parse company data
      const currentPrice = Number.parseFloat(quoteData["05. price"])
      const change = Number.parseFloat(quoteData["09. change"])
      const changePercent = Number.parseFloat(quoteData["10. change percent"].replace("%", ""))

      const processedStockData: StockData = {
        symbol: quoteData["01. symbol"],
        name: companyData.Name || `${symbol} Corporation`,
        price: currentPrice,
        change: change,
        changePercent: changePercent,
        marketCap: formatMarketCap(companyData.MarketCapitalization || "0"),
        pe: Number.parseFloat(companyData.PERatio) || 0,
        eps: Number.parseFloat(companyData.EPS) || 0,
        dividendYield: Number.parseFloat(companyData.DividendYield) * 100 || 0,
        avgDividend5Y: Number.parseFloat(companyData.DividendYield) * 100 || 0, // Simplified
        revenueGrowth: Number.parseFloat(companyData.QuarterlyRevenueGrowthYOY) * 100 || 0,
        profitGrowth: Number.parseFloat(companyData.QuarterlyEarningsGrowthYOY) * 100 || 0,
        ps: Number.parseFloat(companyData.PriceToSalesRatioTTM) || 0,
        chartData,
      }

      const processedTrendData: TrendData = {
        sma20: latestSMA20 ? Number.parseFloat(latestSMA20) : currentPrice * (0.95 + Math.random() * 0.1),
        sma50: latestSMA50 ? Number.parseFloat(latestSMA50) : currentPrice * (0.9 + Math.random() * 0.2),
        rsi: latestRSI ? Number.parseFloat(latestRSI) : 30 + Math.random() * 40,
        macd: (Math.random() - 0.5) * 5, // Simplified MACD
        volume: Number.parseFloat(quoteData["06. volume"]),
        support,
        resistance,
      }

      setStockData(processedStockData)
      setTrendData(processedTrendData)
      setIsRealData(true)
    } catch (apiError) {
      console.warn("Alpha Vantage API failed:", apiError)

      // ตรวจสอบว่าเป็น API Error หรือไม่
      try {
        const parsedError: APIError = JSON.parse((apiError as Error).message)
        setApiError(parsedError)

        // ตั้งค่า countdown สำหรับ rate limit
        if (parsedError.retryAfter) {
          setRetryCountdown(parsedError.retryAfter)
        }
      } catch {
        // ถ้าไม่ใช่ API Error ให้ใช้ข้อความทั่วไป
        setError("เกิดข้อผิดพลาดในการเชื่อมต่อ API กรุณาลองใหม่อีกครั้ง")
      }

      // Fallback to mock data
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockData: StockData = {
        symbol: symbol,
        name: getCompanyName(symbol),
        price: Math.random() * 200 + 50,
        change: (Math.random() - 0.5) * 10,
        changePercent: (Math.random() - 0.5) * 5,
        marketCap: `$${(Math.random() * 2000 + 100).toFixed(0)}B`,
        pe: Math.random() * 30 + 10,
        eps: Math.random() * 10 + 1,
        dividendYield: Math.random() * 4,
        avgDividend5Y: Math.random() * 3.5,
        revenueGrowth: Math.random() * 20 - 5,
        profitGrowth: Math.random() * 25 - 10,
        ps: Math.random() * 8 + 1,
        chartData: generateMockChartData(),
      }

      const mockTrendData = generateTrendData(mockData.price)

      setStockData(mockData)
      setTrendData(mockTrendData)
      setIsRealData(false)
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    if (retryCountdown === 0) {
      fetchStockData()
    }
  }

  useEffect(() => {
    fetchStockData()
  }, [symbol])

  const getCompanyName = (symbol: string) => {
    const companies: Record<string, string> = {
      AAPL: "Apple Inc.",
      MSFT: "Microsoft Corporation",
      GOOGL: "Alphabet Inc.",
      AMZN: "Amazon.com Inc.",
      TSLA: "Tesla Inc.",
      META: "Meta Platforms Inc.",
      NVDA: "NVIDIA Corporation",
      JPM: "JPMorgan Chase & Co.",
      JNJ: "Johnson & Johnson",
      V: "Visa Inc.",
    }
    return companies[symbol] || `${symbol} Corporation`
  }

  const generateMockChartData = () => {
    const data = []
    const startDate = new Date()
    startDate.setFullYear(startDate.getFullYear() - 5)

    let price = Math.random() * 100 + 50

    for (let i = 0; i < 60; i++) {
      const date = new Date(startDate)
      date.setMonth(date.getMonth() + i)

      price += (Math.random() - 0.5) * 10
      price = Math.max(10, price)

      data.push({
        date: date.toISOString().split("T")[0],
        price: Number(price.toFixed(2)),
      })
    }

    return data
  }

  const generateTrendData = (currentPrice: number) => {
    return {
      sma20: currentPrice * (0.95 + Math.random() * 0.1),
      sma50: currentPrice * (0.9 + Math.random() * 0.2),
      rsi: Math.random() * 100,
      macd: (Math.random() - 0.5) * 10,
      volume: Math.random() * 1000000 + 500000,
      support: currentPrice * (0.85 + Math.random() * 0.1),
      resistance: currentPrice * (1.1 + Math.random() * 0.1),
    }
  }

  const getTrendSignal = (trendData: TrendData, currentPrice: number) => {
    let bullishSignals = 0
    let bearishSignals = 0

    // SMA Analysis
    if (currentPrice > trendData.sma20 && trendData.sma20 > trendData.sma50) bullishSignals++
    else if (currentPrice < trendData.sma20 && trendData.sma20 < trendData.sma50) bearishSignals++

    // RSI Analysis
    if (trendData.rsi < 30)
      bullishSignals++ // Oversold
    else if (trendData.rsi > 70) bearishSignals++ // Overbought

    // MACD Analysis
    if (trendData.macd > 0) bullishSignals++
    else bearishSignals++

    // Support/Resistance
    if (currentPrice > trendData.resistance) bullishSignals++
    else if (currentPrice < trendData.support) bearishSignals++

    if (bullishSignals > bearishSignals) return { signal: "BUY", color: "text-emerald-600", icon: "📈" }
    else if (bearishSignals > bullishSignals) return { signal: "SELL", color: "text-red-600", icon: "📉" }
    else return { signal: "HOLD", color: "text-yellow-600", icon: "⚖️" }
  }

  const getInvestmentRecommendation = (score: number) => {
    if (score >= 80)
      return {
        level: "แนะนำซื้อขอ",
        color: "text-emerald-600 dark:text-emerald-400",
        bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
        icon: <CheckCircle className="h-5 w-5" />,
        desc: "ตัวชี้วัดส่วนใหญ่อยู่ในเกณฑ์ดี",
      }
    else if (score >= 60)
      return {
        level: "พิจารณาซื้อ",
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-50 dark:bg-blue-950/30",
        icon: <Activity className="h-5 w-5" />,
        desc: "ตัวชี้วัดอยู่ในเกณฑ์ปานกลาง",
      }
    else if (score >= 40)
      return {
        level: "รอดูก่อน",
        color: "text-yellow-600 dark:text-yellow-400",
        bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
        icon: <AlertTriangle className="h-5 w-5" />,
        desc: "ตัวชี้วัดมีทั้งดีและไม่ดี",
      }
    else
      return {
        level: "ไม่แนะนำ",
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-50 dark:bg-red-950/30",
        icon: <XCircle className="h-5 w-5" />,
        desc: "ตัวชี้วัดส่วนใหญ่ไม่ดี",
      }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <Card className="border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-80 w-full" />
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error && !stockData) {
    return (
      <Alert className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50">
        <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
      </Alert>
    )
  }

  if (!stockData || !trendData) return null

  const investmentScore = calculateInvestmentScore(stockData)
  const trendSignal = getTrendSignal(trendData, stockData.price)
  const recommendation = getInvestmentRecommendation(investmentScore)

  return (
    <div className="space-y-8">
      {/* API Error Alert */}
      {apiError && (
        <Alert
          className={`border-2 ${
            apiError.type === "RATE_LIMIT"
              ? "border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/50"
              : apiError.type === "INVALID_SYMBOL"
                ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50"
                : "border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/50"
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {apiError.type === "RATE_LIMIT" && (
                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              )}
              {apiError.type === "INVALID_SYMBOL" && <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />}
              {apiError.type === "NETWORK_ERROR" && (
                <WifiOff className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              )}
              {apiError.type === "UNKNOWN" && (
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              )}
            </div>
            <div className="flex-1">
              <div className="font-semibold mb-1 text-sm">
                {apiError.type === "RATE_LIMIT" && "🚫 เกินขีดจำกัด API"}
                {apiError.type === "INVALID_SYMBOL" && "❌ ไม่พบข้อมูลหุ้น"}
                {apiError.type === "NETWORK_ERROR" && "🌐 ปัญหาการเชื่อมต่อ"}
                {apiError.type === "UNKNOWN" && "⚠️ เกิดข้อผิดพลาด"}
              </div>
              <AlertDescription
                className={`text-sm ${
                  apiError.type === "RATE_LIMIT"
                    ? "text-orange-800 dark:text-orange-200"
                    : apiError.type === "INVALID_SYMBOL"
                      ? "text-red-800 dark:text-red-200"
                      : "text-yellow-800 dark:text-yellow-200"
                }`}
              >
                {apiError.message}
              </AlertDescription>

              {/* Retry Button with Countdown */}
              {apiError.type === "RATE_LIMIT" && (
                <div className="mt-3 flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    disabled={retryCountdown > 0}
                    className="bg-white dark:bg-slate-800"
                  >
                    {retryCountdown > 0 ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2"></div>
                        รอ {retryCountdown} วินาที
                      </>
                    ) : (
                      <>
                        <Activity className="h-3 w-3 mr-2" />
                        ลองใหม่
                      </>
                    )}
                  </Button>
                  {retryCountdown > 0 && (
                    <div className="text-xs text-muted-foreground">
                      กรุณารอ {Math.floor(retryCountdown / 60)} นาที {retryCountdown % 60} วินาที
                    </div>
                  )}
                </div>
              )}

              {apiError.type === "INVALID_SYMBOL" && (
                <div className="mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.history.back()}
                    className="bg-white dark:bg-slate-800"
                  >
                    <ArrowLeft className="h-3 w-3 mr-2" />
                    กลับไปค้นหาใหม่
                  </Button>
                </div>
              )}

              {(apiError.type === "NETWORK_ERROR" || apiError.type === "UNKNOWN") && (
                <div className="mt-3">
                  <Button variant="outline" size="sm" onClick={handleRetry} className="bg-white dark:bg-slate-800">
                    <Activity className="h-3 w-3 mr-2" />
                    ลองใหม่
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Alert>
      )}

      {/* Demo Data Warning */}
      {!isRealData && stockData && (
        <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50">
          <div className="flex items-center gap-2">
            <WifiOff className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <span className="font-semibold">📊 กำลังแสดงข้อมูลจำลอง</span> - ข้อมูลจริงไม่สามารถใช้งานได้ในขณะนี้ เนื่องจาก{" "}
              {apiError ? apiError.message : "ปัญหาการเชื่อมต่อ API"}
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Stock Header */}
      <Card className="border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-3xl font-bold">{stockData.symbol}</CardTitle>
                  {isRealData ? (
                    <Wifi className="h-5 w-5 text-emerald-600 dark:text-emerald-400" title="Real-time data" />
                  ) : (
                    <WifiOff className="h-5 w-5 text-orange-600 dark:text-orange-400" title="Demo data" />
                  )}
                </div>
                <CardDescription className="text-lg">{stockData.name}</CardDescription>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {isRealData ? "Real-time Data" : "Demo Data"}
                  </Badge>
                  <ShareButton symbol={stockData.symbol} companyName={stockData.name} />
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold mb-2">${stockData.price.toFixed(2)}</div>
              <div className="flex items-center gap-2 justify-end">
                {stockData.change >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                )}
                <span
                  className={`text-lg font-semibold ${stockData.change >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
                >
                  ${Math.abs(stockData.change).toFixed(2)} ({stockData.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <StockChart data={stockData.chartData} />
        </CardContent>
      </Card>

      {/* New Cards: Trend Analysis and Investment Recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Analysis Card */}
        <Card className="border-0 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                  <LineChart className="h-4 w-4 text-white" />
                </div>
                แนวโน้มเทคนิคัล
              </CardTitle>
              <CardDescription>วิเคราะห์จากตัวชี้วัดทางเทคนิค</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl mb-1">{trendSignal.icon}</div>
              <Badge variant="outline" className={`${trendSignal.color} font-semibold`}>
                {trendSignal.signal}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg">
                  <div className="text-sm text-muted-foreground">SMA 20</div>
                  <div className="text-lg font-semibold">${trendData.sma20.toFixed(2)}</div>
                </div>
                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg">
                  <div className="text-sm text-muted-foreground">SMA 50</div>
                  <div className="text-lg font-semibold">${trendData.sma50.toFixed(2)}</div>
                </div>
                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg">
                  <div className="text-sm text-muted-foreground">RSI</div>
                  <div className="text-lg font-semibold">{trendData.rsi.toFixed(1)}</div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                    <div
                      className={`h-2 rounded-full ${
                        trendData.rsi > 70 ? "bg-red-500" : trendData.rsi < 30 ? "bg-green-500" : "bg-blue-500"
                      }`}
                      style={{ width: `${trendData.rsi}%` }}
                    ></div>
                  </div>
                </div>
                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg">
                  <div className="text-sm text-muted-foreground">MACD</div>
                  <div className={`text-lg font-semibold ${trendData.macd > 0 ? "text-green-600" : "text-red-600"}`}>
                    {trendData.macd.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Support: ${trendData.support.toFixed(2)}</span>
                  <span>Resistance: ${trendData.resistance.toFixed(2)}</span>
                </div>
                <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="absolute top-0 left-0 h-3 bg-red-200 dark:bg-red-900 rounded-l-full"
                    style={{ width: `${((trendData.support - 30) / (trendData.resistance - 30)) * 100}%` }}
                  ></div>
                  <div
                    className="absolute top-0 right-0 h-3 bg-green-200 dark:bg-green-900 rounded-r-full"
                    style={{ width: `${100 - ((trendData.resistance - 30) / (trendData.resistance - 30)) * 100}%` }}
                  ></div>
                  <div
                    className="absolute top-0 w-1 h-3 bg-blue-600 rounded"
                    style={{
                      left: `${((stockData.price - trendData.support) / (trendData.resistance - trendData.support)) * 100}%`,
                    }}
                  ></div>
                </div>
                <div className="text-center text-xs text-muted-foreground mt-1">ราคาปัจจุบัน</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Investment Recommendation Card */}
        <Card className={`border-0 ${recommendation.bgColor} shadow-lg`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                  <ShoppingCart className="h-4 w-4 text-white" />
                </div>
                คำแนะนำการลงทุน
              </CardTitle>
              <CardDescription>วิเคราะห์จากตัวชี้วัดทางการเงิน</CardDescription>
            </div>
            <div className="text-right">
              <div className={`${recommendation.color} mb-2`}>{recommendation.icon}</div>
              <Badge variant="outline" className={`${recommendation.color} font-semibold`}>
                {recommendation.level}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">{investmentScore}%</div>
                <Progress value={investmentScore} className="w-full h-3 mb-2" />
                <p className={`text-sm ${recommendation.color}`}>{recommendation.desc}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-2 bg-white dark:bg-slate-800 rounded">
                  <div className="text-muted-foreground">การเติบโต</div>
                  <div className="font-semibold">
                    {evaluateMetric("revenueGrowth", stockData.revenueGrowth).symbol}{" "}
                    {evaluateMetric("revenueGrowth", stockData.revenueGrowth).level}
                  </div>
                </div>
                <div className="p-2 bg-white dark:bg-slate-800 rounded">
                  <div className="text-muted-foreground">ความคุ้มค่า</div>
                  <div className="font-semibold">
                    {evaluateMetric("pe", stockData.pe).symbol} {evaluateMetric("pe", stockData.pe).level}
                  </div>
                </div>
                <div className="p-2 bg-white dark:bg-slate-800 rounded">
                  <div className="text-muted-foreground">กำไรต่อหุ้น</div>
                  <div className="font-semibold">
                    {evaluateMetric("eps", stockData.eps).symbol} {evaluateMetric("eps", stockData.eps).level}
                  </div>
                </div>
                <div className="p-2 bg-white dark:bg-slate-800 rounded">
                  <div className="text-muted-foreground">ปันผล</div>
                  <div className="font-semibold">
                    {evaluateMetric("dividend", stockData.dividendYield).symbol}{" "}
                    {evaluateMetric("dividend", stockData.dividendYield).level}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg">
                <h4 className="font-semibold mb-2">น้ำหนักการประเมิน:</h4>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>การเติบโตรายได้ & กำไร</span>
                    <span>40%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ความคุ้มค่า (PE & PS)</span>
                    <span>35%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>กำไรต่อหุ้น (EPS)</span>
                    <span>15%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>อัตราปันผล</span>
                    <span>10%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Cap</CardTitle>
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stockData.marketCap}</div>
            <p className="text-xs text-muted-foreground mt-1">มูลค่าตลาด</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">P/E Ratio</CardTitle>
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <div className="text-3xl font-bold">{stockData.pe.toFixed(2)}</div>
              <div className="text-2xl">{evaluateMetric("pe", stockData.pe).symbol}</div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">อัตราส่วนราคาต่อกำไร</p>
              <Badge variant="outline" className={`text-xs ${evaluateMetric("pe", stockData.pe).color}`}>
                {evaluateMetric("pe", stockData.pe).level}
              </Badge>
            </div>
            <p className={`text-xs mt-1 ${evaluateMetric("pe", stockData.pe).color}`}>
              {evaluateMetric("pe", stockData.pe).desc}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">EPS</CardTitle>
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
              <Target className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <div className="text-3xl font-bold">${stockData.eps.toFixed(2)}</div>
              <div className="text-2xl">{evaluateMetric("eps", stockData.eps).symbol}</div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">กำไรต่อหุ้น</p>
              <Badge variant="outline" className={`text-xs ${evaluateMetric("eps", stockData.eps).color}`}>
                {evaluateMetric("eps", stockData.eps).level}
              </Badge>
            </div>
            <p className={`text-xs mt-1 ${evaluateMetric("eps", stockData.eps).color}`}>
              {evaluateMetric("eps", stockData.eps).desc}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/50 dark:to-red-950/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">P/S Ratio</CardTitle>
            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
              <PieChart className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <div className="text-3xl font-bold">{stockData.ps.toFixed(2)}</div>
              <div className="text-2xl">{evaluateMetric("ps", stockData.ps).symbol}</div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">อัตราส่วนราคาต่อยอดขาย</p>
              <Badge variant="outline" className={`text-xs ${evaluateMetric("ps", stockData.ps).color}`}>
                {evaluateMetric("ps", stockData.ps).level}
              </Badge>
            </div>
            <p className={`text-xs mt-1 ${evaluateMetric("ps", stockData.ps).color}`}>
              {evaluateMetric("ps", stockData.ps).desc}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dividend Yield</CardTitle>
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
              <Percent className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <div className="text-3xl font-bold">{stockData.dividendYield.toFixed(2)}%</div>
              <div className="text-2xl">{evaluateMetric("dividend", stockData.dividendYield).symbol}</div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">เฉลี่ย 5 ปี: {stockData.avgDividend5Y.toFixed(2)}%</p>
              <Badge
                variant="outline"
                className={`text-xs ${evaluateMetric("dividend", stockData.dividendYield).color}`}
              >
                {evaluateMetric("dividend", stockData.dividendYield).level}
              </Badge>
            </div>
            <p className={`text-xs mt-1 ${evaluateMetric("dividend", stockData.dividendYield).color}`}>
              {evaluateMetric("dividend", stockData.dividendYield).desc}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/50 dark:to-blue-950/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rates</CardTitle>
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
              <Activity className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">รายได้:</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{evaluateMetric("revenueGrowth", stockData.revenueGrowth).symbol}</span>
                  <Badge variant={stockData.revenueGrowth >= 0 ? "default" : "destructive"} className="font-semibold">
                    {stockData.revenueGrowth.toFixed(1)}%
                  </Badge>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">กำไร:</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{evaluateMetric("profitGrowth", stockData.profitGrowth).symbol}</span>
                  <Badge variant={stockData.profitGrowth >= 0 ? "default" : "destructive"} className="font-semibold">
                    {stockData.profitGrowth.toFixed(1)}%
                  </Badge>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-xs">
                  <span className={evaluateMetric("revenueGrowth", stockData.revenueGrowth).color}>
                    รายได้: {evaluateMetric("revenueGrowth", stockData.revenueGrowth).level}
                  </span>
                  <span className={evaluateMetric("profitGrowth", stockData.profitGrowth).color}>
                    กำไร: {evaluateMetric("profitGrowth", stockData.profitGrowth).level}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metrics Legend */}
      <MetricsLegend />

      {/* API Information */}
      <Card className="border-0 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            เกี่ยวกับข้อมูล
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              {isRealData ? (
                <Wifi className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <WifiOff className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              )}
              <span className="font-semibold">
                {isRealData ? "ข้อมูลจริงจาก Alpha Vantage API" : "ข้อมูลจำลองสำหรับการทดสอบ"}
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              {isRealData
                ? "ข้อมูลหุ้นและตัวชี้วัดทางเทคนิคมาจาก Alpha Vantage API แบบเรียลไทม์"
                : "เนื่องจากข้อจำกัดของ API หรือการเชื่อมต่อ จึงแสดงข้อมูลจำลองแทน"}
            </p>
          </div>

          <p className="text-muted-foreground mb-4">สำหรับการใช้งานจริง คุณสามารถใช้ API ฟรีจาก:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border">
              <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">Alpha Vantage ⭐</h4>
              <p className="text-sm text-muted-foreground">5 requests/minute, 500 requests/day</p>
              <p className="text-xs text-muted-foreground mt-1">Technical indicators, SMA, RSI, MACD</p>
              <Badge variant="outline" className="mt-2 text-xs">
                Currently Integrated
              </Badge>
            </div>
            <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border">
              <h4 className="font-semibold text-emerald-600 dark:text-emerald-400 mb-2">Finnhub</h4>
              <p className="text-sm text-muted-foreground">60 calls/minute</p>
              <p className="text-xs text-muted-foreground mt-1">Real-time quotes, technical analysis</p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border">
              <h4 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">IEX Cloud</h4>
              <p className="text-sm text-muted-foreground">50,000 requests/month</p>
              <p className="text-xs text-muted-foreground mt-1">Market data, technical indicators</p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border">
              <h4 className="font-semibold text-orange-600 dark:text-orange-400 mb-2">Yahoo Finance</h4>
              <p className="text-sm text-muted-foreground">Unlimited (unofficial)</p>
              <p className="text-xs text-muted-foreground mt-1">Historical data, basic indicators</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
