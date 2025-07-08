"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  Wifi,
  WifiOff,
  RefreshCw,
  Crown,
  Target,
  Volume2,
} from "lucide-react"
import { getTopGainersLosers, formatVolume, type TopGainersLosersResponse, type APIError } from "@/lib/alpha-vantage"

interface MarketOverviewProps {
  onStockSelect: (symbol: string) => void
}

export default function MarketOverview({ onStockSelect }: MarketOverviewProps) {
  const [marketData, setMarketData] = useState<TopGainersLosersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [apiError, setApiError] = useState<APIError | null>(null)
  const [isRealData, setIsRealData] = useState(false)
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

  const generateMockMarketData = (): TopGainersLosersResponse => {
    const mockStocks = [
      "AAPL",
      "MSFT",
      "GOOGL",
      "AMZN",
      "TSLA",
      "META",
      "NVDA",
      "JPM",
      "JNJ",
      "V",
      "PG",
      "UNH",
      "HD",
      "MA",
      "BAC",
      "DIS",
      "ADBE",
      "CRM",
      "NFLX",
      "XOM",
    ]

    const generateStockData = (count = 10) =>
      mockStocks.slice(0, count).map((ticker) => ({
        ticker,
        price: (Math.random() * 200 + 50).toFixed(2),
        change_amount: ((Math.random() - 0.5) * 20).toFixed(2),
        change_percentage: ((Math.random() - 0.5) * 10).toFixed(2) + "%",
        volume: Math.floor(Math.random() * 10000000 + 1000000).toString(),
      }))

    // Generate separate data for each category
    const gainersData = generateStockData(10).map((stock) => ({
      ...stock,
      change_amount: (Math.random() * 15 + 1).toFixed(2), // Positive gains
      change_percentage: (Math.random() * 8 + 1).toFixed(2) + "%",
    }))

    const losersData = generateStockData(10).map((stock) => ({
      ...stock,
      change_amount: (-(Math.random() * 15 + 1)).toFixed(2), // Negative losses
      change_percentage: (-(Math.random() * 8 + 1)).toFixed(2) + "%",
    }))

    const activeData = generateStockData(10).map((stock) => ({
      ...stock,
      volume: Math.floor(Math.random() * 50000000 + 10000000).toString(), // Higher volume
    }))

    return {
      metadata: "Top gainers, losers, and most actively traded US tickers",
      last_updated: new Date().toISOString(),
      top_gainers: gainersData.sort(
        (a, b) => Number.parseFloat(b.change_percentage) - Number.parseFloat(a.change_percentage),
      ),
      top_losers: losersData.sort(
        (a, b) => Number.parseFloat(a.change_percentage) - Number.parseFloat(b.change_percentage),
      ),
      most_actively_traded: activeData.sort((a, b) => Number.parseInt(b.volume) - Number.parseInt(a.volume)),
    }
  }

  const fetchMarketData = async () => {
    setLoading(true)
    setError(null)
    setApiError(null)
    setIsRealData(false)

    try {
      const data = await getTopGainersLosers()
      setMarketData(data)
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
        setError("เกิดข้อผิดพลาดในการเชื่อมต่อ API กรุณาลองใหม่อีกครั้ง")
      }

      // Fallback to mock data
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setMarketData(generateMockMarketData())
      setIsRealData(false)
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    if (retryCountdown === 0) {
      fetchMarketData()
    }
  }

  useEffect(() => {
    fetchMarketData()
  }, [])

  const StockCard = ({ stock, type }: { stock: any; type: "gainer" | "loser" | "active" }) => {
    const changePercent = Number.parseFloat(stock.change_percentage.replace("%", ""))
    const changeAmount = Number.parseFloat(stock.change_amount)
    const isPositive = changeAmount >= 0

    return (
      <Card
        className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm"
        onClick={() => onStockSelect(stock.ticker)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-bold text-lg">{stock.ticker}</div>
            <div className="flex items-center gap-1">
              {type === "gainer" && <TrendingUp className="h-4 w-4 text-emerald-600" />}
              {type === "loser" && <TrendingDown className="h-4 w-4 text-red-600" />}
              {type === "active" && <Volume2 className="h-4 w-4 text-blue-600" />}
            </div>
          </div>

          <div className="text-xl font-semibold mb-1">${Number.parseFloat(stock.price).toFixed(2)}</div>

          <div className="flex items-center gap-2 mb-2">
            <Badge variant={isPositive ? "default" : "destructive"} className="text-xs font-semibold">
              {isPositive ? "+" : ""}
              {changeAmount.toFixed(2)}
            </Badge>
            <Badge variant="outline" className={`text-xs ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
              {stock.change_percentage}
            </Badge>
          </div>

          <div className="text-xs text-muted-foreground">Volume: {formatVolume(stock.volume)}</div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <Skeleton className="h-8 w-64 mx-auto mb-2" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, sectionIndex) => (
            <div key={sectionIndex} className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="grid grid-cols-1 gap-3">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <Skeleton className="h-6 w-16 mb-2" />
                      <Skeleton className="h-8 w-20 mb-2" />
                      <div className="flex gap-2 mb-2">
                        <Skeleton className="h-5 w-12" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                      <Skeleton className="h-4 w-24" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* API Error Alert */}
      {apiError && (
        <Alert
          className={`border-2 ${
            apiError.type === "RATE_LIMIT"
              ? "border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/50"
              : "border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/50"
          }`}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold mb-1 text-sm">🚫 เกินขีดจำกัด API</div>
              <AlertDescription className="text-sm text-orange-800 dark:text-orange-200">
                {apiError.message}
              </AlertDescription>

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
                        <RefreshCw className="h-3 w-3 mr-2" />
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
            </div>
          </div>
        </Alert>
      )}

      {/* Demo Data Warning */}
      {!isRealData && marketData && (
        <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50">
          <div className="flex items-center gap-2">
            <WifiOff className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <span className="font-semibold">📊 กำลังแสดงข้อมูลจำลอง</span> - ข้อมูลจริงไม่สามารถใช้งานได้ในขณะนี้
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          {isRealData ? (
            <Wifi className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <WifiOff className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          )}
          <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
            ภาพรวมตลาดหุ้นสหรัฐฯ
          </h2>
        </div>
        <p className="text-muted-foreground">หุ้นที่ขึ้นมากที่สุด ลงมากที่สุด และมีการซื้อขายมากที่สุดในวันนี้</p>
        {marketData?.last_updated && (
          <p className="text-sm text-muted-foreground mt-2">
            อัปเดตล่าสุด: {new Date(marketData.last_updated).toLocaleString("th-TH")}
          </p>
        )}
      </div>

      {marketData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Gainers */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">🚀 Top Gainers</h3>
                <p className="text-sm text-muted-foreground">หุ้นที่ขึ้นมากที่สุด</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {marketData.top_gainers && marketData.top_gainers.length > 0 ? (
                marketData.top_gainers
                  .slice(0, 5)
                  .map((stock, index) => (
                    <StockCard key={`${stock.ticker}-gainer-${index}`} stock={stock} type="gainer" />
                  ))
              ) : (
                <div className="text-center text-muted-foreground py-8">ไม่มีข้อมูลหุ้นที่ขึ้น</div>
              )}
            </div>
          </div>

          {/* Top Losers */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-red-600 dark:text-red-400">📉 Top Losers</h3>
                <p className="text-sm text-muted-foreground">หุ้นที่ลงมากที่สุด</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {marketData.top_losers && marketData.top_losers.length > 0 ? (
                marketData.top_losers
                  .slice(0, 5)
                  .map((stock, index) => (
                    <StockCard key={`${stock.ticker}-loser-${index}`} stock={stock} type="loser" />
                  ))
              ) : (
                <div className="text-center text-muted-foreground py-8">ไม่มีข้อมูลหุ้นที่ลง</div>
              )}
            </div>
          </div>

          {/* Most Active */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400">🔥 Most Active</h3>
                <p className="text-sm text-muted-foreground">หุ้นที่มีการซื้อขายมากที่สุด</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {marketData.most_actively_traded && marketData.most_actively_traded.length > 0 ? (
                marketData.most_actively_traded
                  .slice(0, 5)
                  .map((stock, index) => (
                    <StockCard key={`${stock.ticker}-active-${index}`} stock={stock} type="active" />
                  ))
              ) : (
                <div className="text-center text-muted-foreground py-8">ไม่มีข้อมูลหุ้นที่ซื้อขายมาก</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* No Data Message */}
      {!marketData && !loading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold mb-2">ไม่มีข้อมูลตลาดหุ้น</h3>
          <p className="text-muted-foreground mb-4">ไม่สามารถโหลดข้อมูลภาพรวมตลาดได้ในขณะนี้</p>
          <Button onClick={handleRetry} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            ลองใหม่
          </Button>
        </div>
      )}

      {/* Refresh Button */}
      {marketData && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={handleRetry}
            disabled={retryCountdown > 0}
            className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm"
          >
            {retryCountdown > 0 ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                รอ {retryCountdown} วินาที
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                รีเฟรชข้อมูล
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
