"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, BarChart3, AlertCircle, RefreshCw } from "lucide-react"
import StockChart from "./stock-chart"
import MetricsLegend from "./metrics-legend"
import ShareButton from "./share-button"
import {
  getStockQuoteAction,
  getHistoricalDataAction,
  getSMAAction,
  getRSIAction,
  getCompanyOverviewAction,
} from "@/lib/stock-actions"
import { formatMarketCap, formatVolume, calculateSupportResistance } from "@/lib/alpha-vantage"
import type { APIError } from "@/lib/alpha-vantage"

interface StockDashboardProps {
  symbol: string
}

export default function StockDashboard({ symbol }: StockDashboardProps) {
  const [stockData, setStockData] = useState<any>(null)
  const [historicalData, setHistoricalData] = useState<any>(null)
  const [companyData, setCompanyData] = useState<any>(null)
  const [smaData, setSmaData] = useState<any>(null)
  const [rsiData, setRsiData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<APIError | null>(null)
  const [retryCountdown, setRetryCountdown] = useState(0)
  const [isRealData, setIsRealData] = useState(false)

  const fetchStockData = async () => {
    setLoading(true)
    setError(null)
    setIsRealData(false)

    try {
      // Fetch all data in parallel
      const [quoteResult, historicalResult, companyResult, smaResult, rsiResult] = await Promise.all([
        getStockQuoteAction(symbol),
        getHistoricalDataAction(symbol),
        getCompanyOverviewAction(symbol),
        getSMAAction(symbol),
        getRSIAction(symbol),
      ])

      // Check if any request failed
      if (!quoteResult.success || !historicalResult.success) {
        const error = quoteResult.error || historicalResult.error
        if (error) {
          setError(error)
        }
        // Use mock data as fallback
        generateMockData()
      } else {
        // Use real data
        setStockData(quoteResult.data)
        setHistoricalData(historicalResult.data)
        setCompanyData(companyResult.success ? companyResult.data : null)
        setSmaData(smaResult.success ? smaResult.data : null)
        setRsiData(rsiResult.success ? rsiResult.data : null)
        setIsRealData(true)
      }
    } catch (err) {
      setError({
        type: "UNKNOWN",
        message: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาลองใหม่อีกครั้ง",
      })
      generateMockData()
    } finally {
      setLoading(false)
    }
  }

  const generateMockData = () => {
    const basePrice = Math.random() * 500 + 50
    const change = (Math.random() - 0.5) * 20
    const changePercent = (change / basePrice) * 100

    setStockData({
      "01. symbol": symbol,
      "02. open": (basePrice - Math.random() * 10).toFixed(2),
      "03. high": (basePrice + Math.random() * 15).toFixed(2),
      "04. low": (basePrice - Math.random() * 15).toFixed(2),
      "05. price": basePrice.toFixed(2),
      "06. volume": Math.floor(Math.random() * 10000000 + 1000000).toString(),
      "07. latest trading day": new Date().toISOString().split("T")[0],
      "08. previous close": (basePrice - change).toFixed(2),
      "09. change": change.toFixed(2),
      "10. change percent": `${changePercent.toFixed(2)}%`,
    })

    // Generate mock historical data
    const mockHistoricalData: any = {
      "Meta Data": {
        "1. Information": "Daily Prices (Mock Data)",
        "2. Symbol": symbol,
        "3. Last Refreshed": new Date().toISOString().split("T")[0],
        "4. Output Size": "Compact",
        "5. Time Zone": "US/Eastern",
      },
      "Time Series (Daily)": {},
    }

    // Generate 100 days of mock data
    for (let i = 0; i < 100; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      const dayPrice = basePrice + (Math.random() - 0.5) * 50
      mockHistoricalData["Time Series (Daily)"][dateStr] = {
        "1. open": (dayPrice + (Math.random() - 0.5) * 5).toFixed(2),
        "2. high": (dayPrice + Math.random() * 10).toFixed(2),
        "3. low": (dayPrice - Math.random() * 10).toFixed(2),
        "4. close": dayPrice.toFixed(2),
        "5. volume": Math.floor(Math.random() * 5000000 + 500000).toString(),
      }
    }

    setHistoricalData(mockHistoricalData)

    // Generate mock company data
    setCompanyData({
      Symbol: symbol,
      Name: `${symbol} Corporation`,
      Description: `Mock company data for ${symbol}. This is demonstration data.`,
      MarketCapitalization: (Math.random() * 1000000000000 + 10000000000).toString(),
      PERatio: (Math.random() * 30 + 5).toFixed(2),
      PEGRatio: (Math.random() * 2 + 0.5).toFixed(2),
      BookValue: (Math.random() * 50 + 5).toFixed(2),
      DividendPerShare: (Math.random() * 5).toFixed(2),
      DividendYield: (Math.random() * 0.05).toFixed(4),
      EPS: (Math.random() * 10 + 1).toFixed(2),
      RevenuePerShareTTM: (Math.random() * 100 + 10).toFixed(2),
      ProfitMargin: (Math.random() * 0.3).toFixed(4),
      OperatingMarginTTM: (Math.random() * 0.25).toFixed(4),
      ReturnOnAssetsTTM: (Math.random() * 0.15).toFixed(4),
      ReturnOnEquityTTM: (Math.random() * 0.25).toFixed(4),
      RevenueTTM: (Math.random() * 100000000000 + 1000000000).toString(),
      GrossProfitTTM: (Math.random() * 50000000000 + 500000000).toString(),
      DilutedEPSTTM: (Math.random() * 10 + 1).toFixed(2),
      QuarterlyEarningsGrowthYOY: (Math.random() * 0.5 - 0.1).toFixed(4),
      QuarterlyRevenueGrowthYOY: (Math.random() * 0.3 - 0.05).toFixed(4),
      AnalystTargetPrice: (basePrice * (1 + (Math.random() - 0.5) * 0.3)).toFixed(2),
      TrailingPE: (Math.random() * 25 + 8).toFixed(2),
      ForwardPE: (Math.random() * 20 + 6).toFixed(2),
      PriceToSalesRatioTTM: (Math.random() * 10 + 1).toFixed(2),
      PriceToBookRatio: (Math.random() * 5 + 0.5).toFixed(2),
      EVToRevenue: (Math.random() * 8 + 1).toFixed(2),
      EVToEBITDA: (Math.random() * 15 + 5).toFixed(2),
      Beta: (Math.random() * 2 + 0.5).toFixed(2),
      "52WeekHigh": (basePrice * 1.3).toFixed(2),
      "52WeekLow": (basePrice * 0.7).toFixed(2),
      "50DayMovingAverage": (basePrice * (1 + (Math.random() - 0.5) * 0.1)).toFixed(2),
      "200DayMovingAverage": (basePrice * (1 + (Math.random() - 0.5) * 0.2)).toFixed(2),
      SharesOutstanding: Math.floor(Math.random() * 5000000000 + 100000000).toString(),
      DividendDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      ExDividendDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    })
  }

  useEffect(() => {
    fetchStockData()
  }, [symbol])

  // Countdown timer for rate limit retry
  useEffect(() => {
    if (error?.type === "RATE_LIMIT" && error.retryAfter) {
      setRetryCountdown(error.retryAfter)
      const timer = setInterval(() => {
        setRetryCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [error])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <Skeleton className="h-10 w-24" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-80 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!stockData) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">ไม่พบข้อมูลหุ้น</h3>
        <p className="text-muted-foreground mb-4">ไม่สามารถโหลดข้อมูลหุ้น {symbol} ได้</p>
        <Button onClick={fetchStockData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          ลองใหม่
        </Button>
      </div>
    )
  }

  const currentPrice = Number.parseFloat(stockData["05. price"])
  const change = Number.parseFloat(stockData["09. change"])
  const changePercent = stockData["10. change percent"]
  const isPositive = change >= 0

  // Calculate additional metrics
  const supportResistance = historicalData
    ? calculateSupportResistance(historicalData["Time Series (Daily)"])
    : { support: currentPrice * 0.9, resistance: currentPrice * 1.1 }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              {symbol}
              {!isRealData && (
                <Badge variant="secondary" className="text-xs">
                  ข้อมูลจำลอง
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground">{companyData?.Name || `${symbol} Corporation`}</p>
          </div>
        </div>
        <ShareButton symbol={symbol} />
      </div>

      {/* Error Alert */}
      {error && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error.message}</span>
            <Button variant="outline" size="sm" onClick={fetchStockData} disabled={retryCountdown > 0} className="ml-4">
              <RefreshCw className={`h-4 w-4 mr-2 ${retryCountdown > 0 ? "animate-spin" : ""}`} />
              {retryCountdown > 0 ? formatTime(retryCountdown) : "ลองใหม่"}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ราคาปัจจุบัน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${currentPrice.toFixed(2)}</div>
            <div
              className={`flex items-center gap-1 text-sm ${
                isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              }`}
            >
              {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}$
              {Math.abs(change).toFixed(2)} ({changePercent})
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ปริมาณการซื้อขาย</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatVolume(stockData["06. volume"])}</div>
            <div className="text-sm text-muted-foreground">หุ้น</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ราคาสูงสุด/ต่ำสุดวันนี้</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${Number.parseFloat(stockData["03. high"]).toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">
              ต่ำสุด: ${Number.parseFloat(stockData["04. low"]).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Market Cap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {companyData?.MarketCapitalization ? formatMarketCap(companyData.MarketCapitalization) : "N/A"}
            </div>
            <div className="text-sm text-muted-foreground">มูลค่าตลาด</div>
          </CardContent>
        </Card>
      </div>

      {/* Chart and Analysis */}
      <Tabs defaultValue="chart" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chart">กราฟราคา</TabsTrigger>
          <TabsTrigger value="fundamentals">ข้อมูลพื้นฐาน</TabsTrigger>
          <TabsTrigger value="technical">การวิเคราะห์เทคนิค</TabsTrigger>
        </TabsList>

        <TabsContent value="chart" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>กราฟราคาหุ้น {symbol}</CardTitle>
              <CardDescription>ข้อมูลราคาหุ้นย้อนหลัง 100 วัน {!isRealData && "(ข้อมูลจำลอง)"}</CardDescription>
            </CardHeader>
            <CardContent>
              {historicalData && <StockChart data={historicalData["Time Series (Daily)"]} symbol={symbol} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fundamentals" className="space-y-4">
          {companyData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Info */}
              <Card>
                <CardHeader>
                  <CardTitle>ข้อมูลบริษัท</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">คำอธิบาย</h4>
                    <p className="text-sm text-muted-foreground">{companyData.Description || "ไม่มีข้อมูลคำอธิบาย"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Market Cap:</span>
                      <div className="font-semibold">{formatMarketCap(companyData.MarketCapitalization || "0")}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">หุ้นที่ออกจำหน่าย:</span>
                      <div className="font-semibold">{formatVolume(companyData.SharesOutstanding || "0")}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>อัตราส่วนทางการเงิน</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-3">
                      <div>
                        <span className="text-muted-foreground">P/E Ratio:</span>
                        <div className="font-semibold">{companyData.PERatio || "N/A"}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">P/B Ratio:</span>
                        <div className="font-semibold">{companyData.PriceToBookRatio || "N/A"}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">EPS:</span>
                        <div className="font-semibold">${companyData.EPS || "N/A"}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Book Value:</span>
                        <div className="font-semibold">${companyData.BookValue || "N/A"}</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-muted-foreground">Dividend Yield:</span>
                        <div className="font-semibold">
                          {companyData.DividendYield
                            ? `${(Number.parseFloat(companyData.DividendYield) * 100).toFixed(2)}%`
                            : "N/A"}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">ROE:</span>
                        <div className="font-semibold">
                          {companyData.ReturnOnEquityTTM
                            ? `${(Number.parseFloat(companyData.ReturnOnEquityTTM) * 100).toFixed(2)}%`
                            : "N/A"}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Profit Margin:</span>
                        <div className="font-semibold">
                          {companyData.ProfitMargin
                            ? `${(Number.parseFloat(companyData.ProfitMargin) * 100).toFixed(2)}%`
                            : "N/A"}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Beta:</span>
                        <div className="font-semibold">{companyData.Beta || "N/A"}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Revenue & Growth */}
              <Card>
                <CardHeader>
                  <CardTitle>รายได้และการเติบโต</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <span className="text-muted-foreground">รายได้ (TTM):</span>
                      <div className="font-semibold text-lg">
                        {companyData.RevenueTTM ? formatMarketCap(companyData.RevenueTTM) : "N/A"}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">กำไรขั้นต้น (TTM):</span>
                      <div className="font-semibold text-lg">
                        {companyData.GrossProfitTTM ? formatMarketCap(companyData.GrossProfitTTM) : "N/A"}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">การเติบโตรายได้ (YoY):</span>
                        <div
                          className={`font-semibold ${
                            companyData.QuarterlyRevenueGrowthYOY &&
                            Number.parseFloat(companyData.QuarterlyRevenueGrowthYOY) >= 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {companyData.QuarterlyRevenueGrowthYOY
                            ? `${(Number.parseFloat(companyData.QuarterlyRevenueGrowthYOY) * 100).toFixed(2)}%`
                            : "N/A"}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">การเติบโตกำไร (YoY):</span>
                        <div
                          className={`font-semibold ${
                            companyData.QuarterlyEarningsGrowthYOY &&
                            Number.parseFloat(companyData.QuarterlyEarningsGrowthYOY) >= 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {companyData.QuarterlyEarningsGrowthYOY
                            ? `${(Number.parseFloat(companyData.QuarterlyEarningsGrowthYOY) * 100).toFixed(2)}%`
                            : "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Price Targets & Ranges */}
              <Card>
                <CardHeader>
                  <CardTitle>เป้าหมายราคาและช่วงราคา</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <span className="text-muted-foreground">เป้าหมายราคาจากนักวิเคราะห์:</span>
                      <div className="font-semibold text-lg">${companyData.AnalystTargetPrice || "N/A"}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">52 Week High:</span>
                        <div className="font-semibold">${companyData["52WeekHigh"] || "N/A"}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">52 Week Low:</span>
                        <div className="font-semibold">${companyData["52WeekLow"] || "N/A"}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">50 Day MA:</span>
                        <div className="font-semibold">${companyData["50DayMovingAverage"] || "N/A"}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">200 Day MA:</span>
                        <div className="font-semibold">${companyData["200DayMovingAverage"] || "N/A"}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">ไม่มีข้อมูลพื้นฐาน</h3>
                <p className="text-muted-foreground">ไม่สามารถโหลดข้อมูลพื้นฐานของบริษัทได้</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="technical" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Support & Resistance */}
            <Card>
              <CardHeader>
                <CardTitle>Support & Resistance</CardTitle>
                <CardDescription>ระดับแนวรับและแนวต้าน</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <span className="text-muted-foreground">แนวต้าน (Resistance):</span>
                    <div className="font-semibold text-lg text-red-600 dark:text-red-400">
                      ${supportResistance.resistance.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">แนวรับ (Support):</span>
                    <div className="font-semibold text-lg text-green-600 dark:text-green-400">
                      ${supportResistance.support.toFixed(2)}
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-sm text-muted-foreground mb-2">ตำแหน่งราคาปัจจุบัน</div>
                    <Progress
                      value={
                        ((currentPrice - supportResistance.support) /
                          (supportResistance.resistance - supportResistance.support)) *
                        100
                      }
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Support</span>
                      <span>Resistance</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* RSI */}
            <Card>
              <CardHeader>
                <CardTitle>RSI (Relative Strength Index)</CardTitle>
                <CardDescription>ดัชนีความแข็งแกร่งสัพเพกษ์</CardDescription>
              </CardHeader>
              <CardContent>
                {rsiData ? (
                  <div className="space-y-4">
                    {(() => {
                      const rsiValues = Object.values(rsiData["Technical Analysis: RSI"])
                      const latestRSI = rsiValues[0] as { RSI: string }
                      const rsiValue = Number.parseFloat(latestRSI.RSI)

                      return (
                        <>
                          <div>
                            <div className="text-3xl font-bold">{rsiValue.toFixed(2)}</div>
                            <div
                              className={`text-sm ${
                                rsiValue > 70
                                  ? "text-red-600 dark:text-red-400"
                                  : rsiValue < 30
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-muted-foreground"
                              }`}
                            >
                              {rsiValue > 70 ? "Overbought" : rsiValue < 30 ? "Oversold" : "Neutral"}
                            </div>
                          </div>
                          <Progress value={rsiValue} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>0 (Oversold)</span>
                            <span>50</span>
                            <span>100 (Overbought)</span>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-2xl font-bold">N/A</div>
                    <div className="text-sm text-muted-foreground">ไม่มีข้อมูล RSI</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Moving Averages */}
            <Card>
              <CardHeader>
                <CardTitle>Moving Averages</CardTitle>
                <CardDescription>ค่าเฉลี่ยเคลื่อนที่</CardDescription>
              </CardHeader>
              <CardContent>
                {smaData ? (
                  <div className="space-y-4">
                    {(() => {
                      const smaValues = Object.values(smaData["Technical Analysis: SMA"])
                      const latestSMA = smaValues[0] as { SMA: string }
                      const smaValue = Number.parseFloat(latestSMA.SMA)
                      const isAboveSMA = currentPrice > smaValue

                      return (
                        <>
                          <div>
                            <span className="text-muted-foreground">SMA (20 วัน):</span>
                            <div className="font-semibold text-lg">${smaValue.toFixed(2)}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">ราคาปัจจุบัน vs SMA:</span>
                            <div
                              className={`font-semibold ${
                                isAboveSMA ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              {isAboveSMA ? "เหนือค่าเฉลี่ย" : "ใต้ค่าเฉลี่ย"}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">ส่วนต่าง:</span>
                            <div
                              className={`font-semibold ${
                                isAboveSMA ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              {isAboveSMA ? "+" : ""}${(currentPrice - smaValue).toFixed(2)}(
                              {(((currentPrice - smaValue) / smaValue) * 100).toFixed(2)}%)
                            </div>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-lg font-semibold">N/A</div>
                    <div className="text-sm text-muted-foreground">ไม่มีข้อมูล Moving Average</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Volume Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Volume Analysis</CardTitle>
                <CardDescription>การวิเคราะห์ปริมาณการซื้อขาย</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <span className="text-muted-foreground">ปริมาณวันนี้:</span>
                    <div className="font-semibold text-lg">{formatVolume(stockData["06. volume"])}</div>
                  </div>
                  {historicalData &&
                    (() => {
                      const dailyData = Object.values(historicalData["Time Series (Daily)"]).slice(0, 20)
                      const avgVolume =
                        dailyData.reduce((sum: number, day: any) => sum + Number.parseInt(day["5. volume"]), 0) /
                        dailyData.length
                      const currentVolume = Number.parseInt(stockData["06. volume"])
                      const volumeRatio = currentVolume / avgVolume

                      return (
                        <>
                          <div>
                            <span className="text-muted-foreground">ปริมาณเฉลี่ย (20 วัน):</span>
                            <div className="font-semibold">{formatVolume(avgVolume.toString())}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">เปรียบเทียบกับค่าเฉลี่ย:</span>
                            <div
                              className={`font-semibold ${
                                volumeRatio > 1.5
                                  ? "text-orange-600 dark:text-orange-400"
                                  : volumeRatio > 1.2
                                    ? "text-blue-600 dark:text-blue-400"
                                    : "text-muted-foreground"
                              }`}
                            >
                              {volumeRatio.toFixed(2)}x
                              {volumeRatio > 1.5 ? " (สูงมาก)" : volumeRatio > 1.2 ? " (สูง)" : " (ปกติ)"}
                            </div>
                          </div>
                        </>
                      )
                    })()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Technical Analysis Legend */}
          <MetricsLegend />
        </TabsContent>
      </Tabs>
    </div>
  )
}
