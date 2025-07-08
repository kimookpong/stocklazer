"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import StockChart from "./stock-chart";
import MetricsLegend from "./metrics-legend";
import ShareButton from "./share-button";
import {
  getStockQuoteAction,
  getHistoricalDataAction,
  getSMAAction,
  getRSIAction,
  getCompanyOverviewAction,
} from "@/lib/stock-actions";
import {
  formatMarketCap,
  formatVolume,
  calculateSupportResistance,
} from "@/lib/yahoo-finance";
import type { APIError } from "@/lib/yahoo-finance";

interface StockDashboardProps {
  symbol: string;
}

export default function StockDashboard({ symbol }: StockDashboardProps) {
  const [stockData, setStockData] = useState<any>(null);
  const [historicalData, setHistoricalData] = useState<any>(null);
  const [companyData, setCompanyData] = useState<any>(null);
  const [smaData, setSmaData] = useState<any>(null);
  const [rsiData, setRsiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<APIError | null>(null);
  const [retryCountdown, setRetryCountdown] = useState(0);
  const [isRealData, setIsRealData] = useState(false);

  const fetchStockData = async () => {
    setLoading(true);
    setError(null);
    setIsRealData(false);

    try {
      // Fetch all data in parallel
      const [
        quoteResult,
        historicalResult,
        companyResult,
        smaResult,
        rsiResult,
      ] = await Promise.all([
        getStockQuoteAction(symbol),
        getHistoricalDataAction(symbol),
        getCompanyOverviewAction(symbol),
        getSMAAction(symbol),
        getRSIAction(symbol),
      ]);

      console.log("API Results:", {
        quoteResult,
        historicalResult,
        companyResult,
        smaResult,
        rsiResult,
      });

      // Check if any request failed
      if (!quoteResult.success || !historicalResult.success) {
        const error = quoteResult.error || historicalResult.error;
        if (error) {
          setError(error);
        }
        // Use mock data as fallback
        generateMockData();
      } else {
        // Use real data
        setStockData(quoteResult.data);
        setHistoricalData(historicalResult.data);
        setCompanyData(companyResult.success ? companyResult.data : null);
        setSmaData(smaResult.success ? smaResult.data : null);
        setRsiData(rsiResult.success ? rsiResult.data : null);
        setIsRealData(true);
      }
    } catch (err) {
      setError({
        type: "UNKNOWN",
        message: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาลองใหม่อีกครั้ง",
      });
      generateMockData();
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = () => {
    const basePrice = Math.random() * 500 + 50;
    const change = (Math.random() - 0.5) * 20;
    const changePercent = (change / basePrice) * 100;

    setStockData({
      symbol: symbol,
      regularMarketPrice: basePrice,
      regularMarketOpen: basePrice - Math.random() * 10,
      regularMarketDayHigh: basePrice + Math.random() * 15,
      regularMarketDayLow: basePrice - Math.random() * 15,
      regularMarketVolume: Math.floor(Math.random() * 10000000 + 1000000),
      regularMarketPreviousClose: basePrice - change,
      regularMarketChange: change,
      regularMarketChangePercent: changePercent,
      shortName: `${symbol} Corporation`,
      longName: `${symbol} Corporation`,
    });

    // Generate mock historical data as array
    const mockHistoricalData = [];
    for (let i = 0; i < 100; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const dayPrice = basePrice + (Math.random() - 0.5) * 50;
      mockHistoricalData.push({
        date: date,
        open: dayPrice + (Math.random() - 0.5) * 5,
        high: dayPrice + Math.random() * 10,
        low: dayPrice - Math.random() * 10,
        close: dayPrice,
        adjClose: dayPrice,
        volume: Math.floor(Math.random() * 5000000 + 500000),
      });
    }

    setHistoricalData(mockHistoricalData);

    // Generate mock company data
    setCompanyData({
      Symbol: symbol,
      Name: `${symbol} Corporation`,
      Description: `Mock company data for ${symbol}. This is demonstration data.`,
      MarketCapitalization: (
        Math.random() * 1000000000000 +
        10000000000
      ).toString(),
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
      AnalystTargetPrice: (
        basePrice *
        (1 + (Math.random() - 0.5) * 0.3)
      ).toFixed(2),
      TrailingPE: (Math.random() * 25 + 8).toFixed(2),
      ForwardPE: (Math.random() * 20 + 6).toFixed(2),
      PriceToSalesRatioTTM: (Math.random() * 10 + 1).toFixed(2),
      PriceToBookRatio: (Math.random() * 5 + 0.5).toFixed(2),
      EVToRevenue: (Math.random() * 8 + 1).toFixed(2),
      EVToEBITDA: (Math.random() * 15 + 5).toFixed(2),
      Beta: (Math.random() * 2 + 0.5).toFixed(2),
      "52WeekHigh": (basePrice * 1.3).toFixed(2),
      "52WeekLow": (basePrice * 0.7).toFixed(2),
      "50DayMovingAverage": (
        basePrice *
        (1 + (Math.random() - 0.5) * 0.1)
      ).toFixed(2),
      "200DayMovingAverage": (
        basePrice *
        (1 + (Math.random() - 0.5) * 0.2)
      ).toFixed(2),
      SharesOutstanding: Math.floor(
        Math.random() * 5000000000 + 100000000
      ).toString(),
      DividendDate: new Date(
        Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000
      )
        .toISOString()
        .split("T")[0],
      ExDividendDate: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
      )
        .toISOString()
        .split("T")[0],
    });

    // Generate mock SMA data
    const mockSMAData = [];
    for (let i = 19; i < 100; i++) {
      // Start from 19 because we need 20 data points for 20-day SMA
      const date = new Date();
      date.setDate(date.getDate() - (100 - i));
      const smaValue = basePrice + (Math.random() - 0.5) * 30;
      mockSMAData.push({
        date: date.toISOString().split("T")[0],
        value: smaValue,
      });
    }
    setSmaData(mockSMAData);

    // Generate mock RSI data
    const mockRSIData = [];
    for (let i = 13; i < 100; i++) {
      // Start from 13 because we need 14 data points for 14-day RSI
      const date = new Date();
      date.setDate(date.getDate() - (100 - i));
      const rsiValue = Math.random() * 100;
      mockRSIData.push({
        date: date.toISOString().split("T")[0],
        value: rsiValue,
      });
    }
    setRsiData(mockRSIData);
  };

  useEffect(() => {
    fetchStockData();
  }, [symbol]);

  // Countdown timer for rate limit retry
  useEffect(() => {
    if (error?.type === "RATE_LIMIT" && error.retryAfter) {
      setRetryCountdown(error.retryAfter);
      const timer = setInterval(() => {
        setRetryCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [error]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Helper functions to evaluate financial metrics
  const evaluateRevenueGrowth = (growth: number) => {
    if (growth > 0.25)
      return {
        level: "ยอดเยี่ยม",
        color: "text-emerald-600 dark:text-emerald-400",
      };
    if (growth > 0.15)
      return { level: "ดีมาก", color: "text-green-600 dark:text-green-400" };
    if (growth > 0.1)
      return { level: "ดี", color: "text-green-600 dark:text-green-400" };
    if (growth > 0.05)
      return {
        level: "ปานกลาง",
        color: "text-yellow-600 dark:text-yellow-400",
      };
    return { level: "ต่ำ/น่ากังวล", color: "text-red-600 dark:text-red-400" };
  };

  const evaluatePERatio = (pe: number) => {
    if (pe < 10)
      return {
        level: "ถูกมาก/น่าสนใจ",
        color: "text-green-600 dark:text-green-400",
      };
    if (pe <= 15)
      return { level: "ราคาถูก", color: "text-green-600 dark:text-green-400" };
    if (pe <= 25)
      return {
        level: "ปานกลาง",
        color: "text-yellow-600 dark:text-yellow-400",
      };
    if (pe <= 35)
      return {
        level: "แพงค่อนข้างสูง",
        color: "text-orange-600 dark:text-orange-400",
      };
    return { level: "แพงมาก", color: "text-red-600 dark:text-red-400" };
  };

  const evaluatePSRatio = (ps: number) => {
    if (ps < 1)
      return { level: "ถูกมาก", color: "text-green-600 dark:text-green-400" };
    if (ps <= 2)
      return { level: "ราคาถูก", color: "text-green-600 dark:text-green-400" };
    if (ps <= 5)
      return {
        level: "ปานกลาง",
        color: "text-yellow-600 dark:text-yellow-400",
      };
    if (ps <= 10)
      return {
        level: "แพงค่อนข้างสูง",
        color: "text-orange-600 dark:text-orange-400",
      };
    return { level: "แพงมาก", color: "text-red-600 dark:text-red-400" };
  };

  const evaluateDividendYield = (yield_: number) => {
    if (yield_ === 0)
      return {
        level: "ไม่จ่ายปันผล",
        color: "text-gray-600 dark:text-gray-400",
      };
    if (yield_ < 0.02)
      return { level: "ต่ำ", color: "text-yellow-600 dark:text-yellow-400" };
    if (yield_ <= 0.04)
      return { level: "ปานกลาง", color: "text-green-600 dark:text-green-400" };
    if (yield_ <= 0.06)
      return { level: "สูง", color: "text-blue-600 dark:text-blue-400" };
    return {
      level: "สูงมาก/ต้องระวัง",
      color: "text-red-600 dark:text-red-400",
    };
  };

  const evaluateEPS = (eps: number, epsGrowth?: number) => {
    if (eps < 0)
      return { level: "ขาดทุน", color: "text-red-600 dark:text-red-400" };
    if (eps > 0 && epsGrowth && epsGrowth > 0.15)
      return {
        level: "ดีมาก (เติบโต)",
        color: "text-emerald-600 dark:text-emerald-400",
      };
    if (eps > 0 && epsGrowth && epsGrowth > 0.05)
      return {
        level: "ดี (เติบโต)",
        color: "text-green-600 dark:text-green-400",
      };
    if (eps > 0)
      return { level: "มีกำไร", color: "text-green-600 dark:text-green-400" };
    return { level: "ปานกลาง", color: "text-yellow-600 dark:text-yellow-400" };
  };

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
    );
  }

  if (!stockData) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">ไม่พบข้อมูลหุ้น</h3>
        <p className="text-muted-foreground mb-4">
          ไม่สามารถโหลดข้อมูลหุ้น {symbol} ได้
        </p>
        <Button onClick={fetchStockData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          ลองใหม่
        </Button>
      </div>
    );
  }

  const currentPrice = stockData.regularMarketPrice || 0;
  const change = stockData.regularMarketChange || 0;
  const changePercent = `${(stockData.regularMarketChangePercent || 0).toFixed(
    2
  )}%`;
  const isPositive = change >= 0;

  // Calculate additional metrics
  const supportResistance = historicalData
    ? calculateSupportResistance(historicalData)
    : { support: currentPrice * 0.9, resistance: currentPrice * 1.1 };

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
            <p className="text-muted-foreground">
              {companyData?.Name || `${symbol} Corporation`}
            </p>
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
            <Button
              variant="outline"
              size="sm"
              onClick={fetchStockData}
              disabled={retryCountdown > 0}
              className="ml-4"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${
                  retryCountdown > 0 ? "animate-spin" : ""
                }`}
              />
              {retryCountdown > 0 ? formatTime(retryCountdown) : "ลองใหม่"}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              ราคาปัจจุบัน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${currentPrice.toFixed(2)}</div>
            <div
              className={`flex items-center gap-1 text-sm ${
                isPositive
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              ${Math.abs(change).toFixed(2)} ({changePercent})
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              ปริมาณการซื้อขาย
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatVolume(stockData.regularMarketVolume || 0)}
            </div>
            <div className="text-sm text-muted-foreground">หุ้น</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              ราคาสูงสุด/ต่ำสุดวันนี้
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(stockData.regularMarketDayHigh || 0).toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">
              ต่ำสุด: ${(stockData.regularMarketDayLow || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Market Cap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatMarketCap(companyData.marketCap)}
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
              <CardDescription>
                ข้อมูลราคาหุ้นย้อนหลัง 100 วัน {!isRealData && "(ข้อมูลจำลอง)"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {historicalData && (
                <StockChart
                  data={historicalData.map((item: any) => ({
                    date:
                      item.date instanceof Date
                        ? item.date.toISOString().split("T")[0]
                        : item.date,
                    price: item.close || 0,
                  }))}
                />
              )}
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
                    <p className="text-sm text-muted-foreground">
                      {companyData.description || "ไม่มีข้อมูลคำอธิบาย"}
                    </p>
                  </div>
                  {companyData.sector && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          ภาคธุรกิจ:
                        </span>
                        <div className="font-semibold">
                          {companyData.sector}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          อุตสาหกรรม:
                        </span>
                        <div className="font-semibold">
                          {companyData.industry}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Market Cap:</span>
                      <div className="font-semibold">
                        {formatMarketCap(companyData.marketCap)}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">พนักงาน:</span>
                      <div className="font-semibold">
                        {companyData.employees
                          ? companyData.employees.toLocaleString()
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                  {companyData.website && (
                    <div>
                      <span className="text-muted-foreground">เว็บไซต์:</span>
                      <div className="font-semibold">
                        <a
                          href={companyData.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {companyData.website}
                        </a>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Financial Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>อัตราส่วนทางการเงิน</CardTitle>
                  <CardDescription>
                    การประเมินตัวชี้วัดทางการเงินหลัก
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* EPS Analysis */}
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold">EPS (กำไรต่อหุ้น)</span>
                        {companyData.trailingPE && (
                          <Badge
                            variant="outline"
                            className={
                              evaluateEPS(
                                companyData.trailingPE > 0
                                  ? companyData.trailingPE
                                  : 0,
                                companyData.earningsGrowth
                              ).color
                            }
                          >
                            {
                              evaluateEPS(
                                companyData.trailingPE > 0
                                  ? companyData.trailingPE
                                  : 0,
                                companyData.earningsGrowth
                              ).level
                            }
                          </Badge>
                        )}
                      </div>
                      <div className="text-2xl font-bold mb-1">
                        $
                        {companyData.trailingPE
                          ? (currentPrice / companyData.trailingPE).toFixed(2)
                          : "N/A"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        กำไรสุทธิต่อหุ้นแต่ละหุ้น -
                        ยิ่งสูงและเติบโตดีแสดงว่าบริษัทมีผลการดำเนินงานที่ดี
                      </div>
                    </div>

                    {/* PE Ratio Analysis */}
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold">
                          P/E Ratio (อัตราส่วนราคาต่อกำไร)
                        </span>
                        {companyData.trailingPE && (
                          <Badge
                            variant="outline"
                            className={
                              evaluatePERatio(companyData.trailingPE).color
                            }
                          >
                            {evaluatePERatio(companyData.trailingPE).level}
                          </Badge>
                        )}
                      </div>
                      <div className="text-2xl font-bold mb-1">
                        {companyData.trailingPE
                          ? `${companyData.trailingPE.toFixed(2)}x`
                          : "N/A"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        นักลงทุนยอมจ่ายกี่เท่าของกำไรเพื่อซื้อหุ้น 1 หุ้น -
                        ต่ำอาจหมายถึงหุ้นถูก สูงอาจหมายถึงคาดหวังการเติบโต
                      </div>
                      {companyData.forwardPE && (
                        <div className="mt-2 text-sm">
                          <span className="text-muted-foreground">
                            Forward P/E:{" "}
                          </span>
                          <span className="font-semibold">
                            {companyData.forwardPE.toFixed(2)}x
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Revenue Growth Analysis */}
                    {companyData.revenueGrowth && (
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold">
                            การเติบโตของรายได้
                          </span>
                          <Badge
                            variant="outline"
                            className={
                              evaluateRevenueGrowth(companyData.revenueGrowth)
                                .color
                            }
                          >
                            {
                              evaluateRevenueGrowth(companyData.revenueGrowth)
                                .level
                            }
                          </Badge>
                        </div>
                        <div className="text-2xl font-bold mb-1">
                          {(companyData.revenueGrowth * 100).toFixed(2)}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          อัตราการเติบโตของรายได้ต่อปี -
                          แสดงความสามารถในการขยายธุรกิจ
                        </div>
                      </div>
                    )}

                    {/* Dividend Yield Analysis */}
                    {companyData.dividendYield !== undefined && (
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold">
                            อัตราปันผล (Dividend Yield)
                          </span>
                          <Badge
                            variant="outline"
                            className={
                              evaluateDividendYield(companyData.dividendYield)
                                .color
                            }
                          >
                            {
                              evaluateDividendYield(companyData.dividendYield)
                                .level
                            }
                          </Badge>
                        </div>
                        <div className="text-2xl font-bold mb-1">
                          {(companyData.dividendYield * 100).toFixed(2)}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          เงินปันผลที่ได้รับต่อปีเทียบกับราคาหุ้น -
                          สำหรับนักลงทุนที่ต้องการรายได้สม่ำเสมอ
                        </div>
                        {companyData.payoutRatio && (
                          <div className="mt-2 text-sm">
                            <span className="text-muted-foreground">
                              Payout Ratio:{" "}
                            </span>
                            <span
                              className={`font-semibold ${
                                companyData.payoutRatio > 0.8
                                  ? "text-orange-600"
                                  : "text-green-600"
                              }`}
                            >
                              {(companyData.payoutRatio * 100).toFixed(1)}%
                            </span>
                            {companyData.payoutRatio > 0.8 && (
                              <span className="text-xs text-orange-600 ml-1">
                                (สูง - ต้องระวัง)
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Additional Ratios Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <span className="text-muted-foreground">
                            PEG Ratio:
                          </span>
                          <div className="font-semibold">
                            {companyData.pegRatio
                              ? companyData.pegRatio.toFixed(2)
                              : "N/A"}
                          </div>
                          {companyData.pegRatio && (
                            <div className="text-xs text-muted-foreground">
                              {companyData.pegRatio < 1
                                ? "ราคาถูกเทียบกับการเติบโต"
                                : companyData.pegRatio > 2
                                ? "ราคาแพงเทียบกับการเติบโต"
                                : "เหมาะสม"}
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            P/B Ratio:
                          </span>
                          <div className="font-semibold">
                            {companyData.priceToBook
                              ? companyData.priceToBook.toFixed(2)
                              : "N/A"}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <span className="text-muted-foreground">ROE:</span>
                          <div className="font-semibold">
                            {companyData.returnOnEquity
                              ? `${(companyData.returnOnEquity * 100).toFixed(
                                  2
                                )}%`
                              : "N/A"}
                          </div>
                          {companyData.returnOnEquity && (
                            <div className="text-xs text-muted-foreground">
                              {companyData.returnOnEquity > 0.15
                                ? "ดีมาก"
                                : companyData.returnOnEquity > 0.1
                                ? "ดี"
                                : "ปานกลาง"}
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Beta:</span>
                          <div className="font-semibold">
                            {companyData.beta
                              ? companyData.beta.toFixed(2)
                              : "N/A"}
                          </div>
                          {companyData.beta && (
                            <div className="text-xs text-muted-foreground">
                              {companyData.beta > 1.2
                                ? "ผันผวนสูง"
                                : companyData.beta < 0.8
                                ? "ผันผวนต่ำ"
                                : "ปกติ"}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Revenue & Growth */}
              <Card>
                <CardHeader>
                  <CardTitle>รายได้และการเติบโต</CardTitle>
                  <CardDescription>
                    การประเมินประสิทธิภาพการดำเนินงานและการเติบโต
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Total Revenue */}
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold">รายได้รวม (TTM)</span>
                      </div>
                      <div className="text-2xl font-bold mb-1">
                        {companyData.totalRevenue
                          ? formatMarketCap(companyData.totalRevenue)
                          : "N/A"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        รายได้ทั้งหมดในรอบ 12 เดือนที่ผ่านมา
                      </div>
                      {companyData.grossProfit && (
                        <div className="mt-2 text-sm">
                          <span className="text-muted-foreground">
                            กำไรขั้นต้น:{" "}
                          </span>
                          <span className="font-semibold">
                            {formatMarketCap(companyData.grossProfit)}
                          </span>
                          {companyData.grossProfitMargin && (
                            <span className="text-muted-foreground ml-2">
                              (
                              {(companyData.grossProfitMargin * 100).toFixed(1)}
                              %)
                            </span>
                          )}
                        </div>
                      )}
                      {companyData.netIncome && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">
                            กำไรสุทธิ:{" "}
                          </span>
                          <span
                            className={`font-semibold ${
                              companyData.netIncome > 0
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {formatMarketCap(companyData.netIncome)}
                          </span>
                          {companyData.netProfitMargin && (
                            <span className="text-muted-foreground ml-2">
                              ({(companyData.netProfitMargin * 100).toFixed(1)}
                              %)
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* P/S Ratio Analysis */}
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold">
                          P/S Ratio (อัตราส่วนราคาต่อยอดขาย)
                        </span>
                        {companyData.marketCap && companyData.totalRevenue && (
                          <Badge
                            variant="outline"
                            className={(() => {
                              const psRatio =
                                companyData.marketCap /
                                companyData.totalRevenue;
                              return evaluatePSRatio(psRatio).color;
                            })()}
                          >
                            {(() => {
                              const psRatio =
                                companyData.marketCap /
                                companyData.totalRevenue;
                              return evaluatePSRatio(psRatio).level;
                            })()}
                          </Badge>
                        )}
                      </div>
                      <div className="text-2xl font-bold mb-1">
                        {companyData.marketCap && companyData.totalRevenue
                          ? `${(
                              companyData.marketCap / companyData.totalRevenue
                            ).toFixed(2)}x`
                          : "N/A"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ราคาหุ้นเทียบกับยอดขายต่อหุ้น -
                        เหมาะสำหรับประเมินบริษัทที่ยังไม่มีกำไรแต่มีรายได้เติบโต
                      </div>
                    </div>

                    {/* Revenue Growth Analysis */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-sm">
                            การเติบโตรายได้ (YoY)
                          </span>
                          {companyData.revenueGrowth && (
                            <Badge
                              variant="outline"
                              className={
                                evaluateRevenueGrowth(companyData.revenueGrowth)
                                  .color
                              }
                            >
                              {
                                evaluateRevenueGrowth(companyData.revenueGrowth)
                                  .level
                              }
                            </Badge>
                          )}
                        </div>
                        <div className="text-xl font-bold mb-1">
                          {companyData.revenueGrowth
                            ? `${(companyData.revenueGrowth * 100).toFixed(2)}%`
                            : "N/A"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          อัตราการเติบโตของรายได้ปีต่อปี
                        </div>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-sm">
                            การเติบโตรายได้ (Quarterly)
                          </span>
                          {companyData.quarterlyRevenueGrowth && (
                            <Badge
                              variant="outline"
                              className={
                                evaluateRevenueGrowth(
                                  companyData.quarterlyRevenueGrowth
                                ).color
                              }
                            >
                              {
                                evaluateRevenueGrowth(
                                  companyData.quarterlyRevenueGrowth
                                ).level
                              }
                            </Badge>
                          )}
                        </div>
                        <div className="text-xl font-bold mb-1">
                          {companyData.quarterlyRevenueGrowth
                            ? `${(
                                companyData.quarterlyRevenueGrowth * 100
                              ).toFixed(2)}%`
                            : "N/A"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          อัตราการเติบโตของรายได้ไตรมาสล่าสุด
                        </div>
                      </div>
                    </div>

                    {/* Profit Margins */}
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold mb-3">
                        อัตราส่วนกำไร (Profit Margins)
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Gross Margin:
                          </span>
                          <div className="font-semibold">
                            {companyData.grossProfitMargin
                              ? `${(
                                  companyData.grossProfitMargin * 100
                                ).toFixed(1)}%`
                              : "N/A"}
                          </div>
                          {companyData.grossProfitMargin && (
                            <div className="text-xs text-muted-foreground">
                              {companyData.grossProfitMargin > 0.5
                                ? "ดีมาก"
                                : companyData.grossProfitMargin > 0.3
                                ? "ดี"
                                : companyData.grossProfitMargin > 0.15
                                ? "ปานกลาง"
                                : "ต่ำ"}
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Operating Margin:
                          </span>
                          <div className="font-semibold">
                            {companyData.operatingMargin
                              ? `${(companyData.operatingMargin * 100).toFixed(
                                  1
                                )}%`
                              : "N/A"}
                          </div>
                          {companyData.operatingMargin && (
                            <div className="text-xs text-muted-foreground">
                              {companyData.operatingMargin > 0.2
                                ? "ดีมาก"
                                : companyData.operatingMargin > 0.1
                                ? "ดี"
                                : companyData.operatingMargin > 0.05
                                ? "ปานกลาง"
                                : "ต่ำ"}
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Net Margin:
                          </span>
                          <div className="font-semibold">
                            {companyData.netProfitMargin
                              ? `${(companyData.netProfitMargin * 100).toFixed(
                                  1
                                )}%`
                              : "N/A"}
                          </div>
                          {companyData.netProfitMargin && (
                            <div className="text-xs text-muted-foreground">
                              {companyData.netProfitMargin > 0.15
                                ? "ดีมาก"
                                : companyData.netProfitMargin > 0.08
                                ? "ดี"
                                : companyData.netProfitMargin > 0.03
                                ? "ปานกลาง"
                                : companyData.netProfitMargin > 0
                                ? "ต่ำ"
                                : "ขาดทุน"}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Revenue History Trend */}
                    {companyData.revenueHistory &&
                      companyData.revenueHistory.length > 0 && (
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <h4 className="font-semibold mb-3">
                            แนวโน้มรายได้ (4 ปีล่าสุด)
                          </h4>
                          <div className="space-y-2">
                            {companyData.revenueHistory.map(
                              (item: any, index: number) => (
                                <div
                                  key={index}
                                  className="flex justify-between items-center text-sm"
                                >
                                  <span className="text-muted-foreground">
                                    {item.endDate || `ปี ${index + 1}`}:
                                  </span>
                                  <div className="flex items-center space-x-4">
                                    <span className="font-semibold">
                                      {item.revenue
                                        ? formatMarketCap(item.revenue)
                                        : "N/A"}
                                    </span>
                                    {index > 0 &&
                                      item.revenue &&
                                      companyData.revenueHistory[index - 1]
                                        ?.revenue && (
                                        <span
                                          className={`text-xs px-2 py-1 rounded ${
                                            item.revenue >
                                            companyData.revenueHistory[
                                              index - 1
                                            ].revenue
                                              ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                              : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                                          }`}
                                        >
                                          {item.revenue >
                                          companyData.revenueHistory[index - 1]
                                            .revenue
                                            ? "↗"
                                            : "↘"}
                                          {(
                                            ((item.revenue -
                                              companyData.revenueHistory[
                                                index - 1
                                              ].revenue) /
                                              companyData.revenueHistory[
                                                index - 1
                                              ].revenue) *
                                            100
                                          ).toFixed(1)}
                                          %
                                        </span>
                                      )}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Additional Financial Health Metrics */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          Current Ratio:
                        </span>
                        <div className="font-semibold">
                          {companyData.currentRatio
                            ? companyData.currentRatio.toFixed(2)
                            : "N/A"}
                        </div>
                        {companyData.currentRatio && (
                          <div className="text-xs text-muted-foreground">
                            {companyData.currentRatio > 2
                              ? "สภาพคล่องดีมาก"
                              : companyData.currentRatio > 1.5
                              ? "สภาพคล่องดี"
                              : companyData.currentRatio > 1
                              ? "สภาพคล่องพอใช้"
                              : "สภาพคล่องต่ำ"}
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Debt/Equity:
                        </span>
                        <div className="font-semibold">
                          {companyData.debtToEquity
                            ? companyData.debtToEquity.toFixed(2)
                            : "N/A"}
                        </div>
                        {companyData.debtToEquity && (
                          <div className="text-xs text-muted-foreground">
                            {companyData.debtToEquity < 0.3
                              ? "หนี้สินต่ำ"
                              : companyData.debtToEquity < 0.6
                              ? "หนี้สินปานกลาง"
                              : "หนี้สินสูง"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Price Targets & Investment Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>สรุปการประเมินและช่วงราคา</CardTitle>
                  <CardDescription>
                    สรุปผลการประเมินโดยรวมและข้อมูลช่วงราคา
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Investment Summary */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border">
                      <h4 className="font-semibold mb-3">
                        สรุปการประเมินโดยรวม
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>การเติบโต:</span>
                            <span
                              className={
                                companyData.revenueGrowth
                                  ? evaluateRevenueGrowth(
                                      companyData.revenueGrowth
                                    ).color
                                  : "text-gray-500"
                              }
                            >
                              {companyData.revenueGrowth
                                ? evaluateRevenueGrowth(
                                    companyData.revenueGrowth
                                  ).level
                                : "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>การประเมินราคา (P/E):</span>
                            <span
                              className={
                                companyData.trailingPE
                                  ? evaluatePERatio(companyData.trailingPE)
                                      .color
                                  : "text-gray-500"
                              }
                            >
                              {companyData.trailingPE
                                ? evaluatePERatio(companyData.trailingPE).level
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>ปันผล:</span>
                            <span
                              className={
                                companyData.dividendYield !== undefined
                                  ? evaluateDividendYield(
                                      companyData.dividendYield
                                    ).color
                                  : "text-gray-500"
                              }
                            >
                              {companyData.dividendYield !== undefined
                                ? evaluateDividendYield(
                                    companyData.dividendYield
                                  ).level
                                : "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>ความเสี่ยง (Beta):</span>
                            <span
                              className={
                                companyData.beta
                                  ? companyData.beta > 1.2
                                    ? "text-red-600"
                                    : companyData.beta < 0.8
                                    ? "text-green-600"
                                    : "text-yellow-600"
                                  : "text-gray-500"
                              }
                            >
                              {companyData.beta
                                ? companyData.beta > 1.2
                                  ? "สูง"
                                  : companyData.beta < 0.8
                                  ? "ต่ำ"
                                  : "ปกติ"
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price Range Analysis */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          52 Week High:
                        </span>
                        <div className="font-semibold">
                          $
                          {companyData.fiftyTwoWeekHigh
                            ? companyData.fiftyTwoWeekHigh.toFixed(2)
                            : "N/A"}
                        </div>
                        {companyData.fiftyTwoWeekHigh && (
                          <div className="text-xs text-muted-foreground">
                            ห่างจากราคาปัจจุบัน:{" "}
                            {(
                              ((companyData.fiftyTwoWeekHigh - currentPrice) /
                                currentPrice) *
                              100
                            ).toFixed(1)}
                            %
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          52 Week Low:
                        </span>
                        <div className="font-semibold">
                          $
                          {companyData.fiftyTwoWeekLow
                            ? companyData.fiftyTwoWeekLow.toFixed(2)
                            : "N/A"}
                        </div>
                        {companyData.fiftyTwoWeekLow && (
                          <div className="text-xs text-muted-foreground">
                            เหนือราคาต่ำสุด:{" "}
                            {(
                              ((currentPrice - companyData.fiftyTwoWeekLow) /
                                companyData.fiftyTwoWeekLow) *
                              100
                            ).toFixed(1)}
                            %
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Market Cap:
                        </span>
                        <div className="font-semibold">
                          {companyData.marketCap
                            ? formatMarketCap(companyData.marketCap)
                            : "N/A"}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Enterprise Value:
                        </span>
                        <div className="font-semibold">
                          {companyData.enterpriseValue
                            ? formatMarketCap(companyData.enterpriseValue)
                            : "N/A"}
                        </div>
                      </div>
                    </div>

                    {/* 52-Week Range Visualization */}
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground mb-2">
                        ตำแหน่งราคาในช่วง 52 สัปดาห์
                      </div>
                      {companyData.fiftyTwoWeekHigh &&
                        companyData.fiftyTwoWeekLow && (
                          <div className="space-y-2">
                            <Progress
                              value={
                                ((currentPrice - companyData.fiftyTwoWeekLow) /
                                  (companyData.fiftyTwoWeekHigh -
                                    companyData.fiftyTwoWeekLow)) *
                                100
                              }
                              className="h-3"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>
                                Low: ${companyData.fiftyTwoWeekLow.toFixed(2)}
                              </span>
                              <span className="font-semibold text-foreground">
                                ปัจจุบัน: ${currentPrice.toFixed(2)}
                              </span>
                              <span>
                                High: ${companyData.fiftyTwoWeekHigh.toFixed(2)}
                              </span>
                            </div>
                            <div className="text-center text-xs text-muted-foreground">
                              {(() => {
                                const position =
                                  ((currentPrice -
                                    companyData.fiftyTwoWeekLow) /
                                    (companyData.fiftyTwoWeekHigh -
                                      companyData.fiftyTwoWeekLow)) *
                                  100;
                                if (position < 25)
                                  return "อยู่ใกล้ราคาต่ำสุด - อาจเป็นโอกาสซื้อ";
                                if (position > 75)
                                  return "อยู่ใกล้ราคาสูงสุด - ควรระมัดระวัง";
                                return "อยู่ในช่วงกลาง - ราคาปานกลาง";
                              })()}
                            </div>
                          </div>
                        )}
                    </div>

                    {/* Investment Recommendation */}
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">คำแนะนำการลงทุน</h4>
                      <div className="text-sm text-muted-foreground space-y-2">
                        {companyData.revenueGrowth &&
                          companyData.revenueGrowth > 0.15 && (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>
                                บริษัทมีการเติบโตของรายได้ที่ดี
                                เหมาะสำหรับการลงทุนระยะยาว
                              </span>
                            </div>
                          )}
                        {companyData.dividendYield &&
                          companyData.dividendYield > 0.03 && (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span>
                                จ่ายปันผลดี
                                เหมาะสำหรับนักลงทุนที่ต้องการรายได้สม่ำเสมอ
                              </span>
                            </div>
                          )}
                        {companyData.trailingPE &&
                          companyData.trailingPE < 15 && (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                              <span>
                                P/E ต่ำ อาจเป็นโอกาสซื้อในราคาที่น่าสนใจ
                              </span>
                            </div>
                          )}
                        {companyData.beta && companyData.beta > 1.3 && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span>
                              มีความผันผวนสูง
                              เหมาะสำหรับนักลงทุนที่รับความเสี่ยงได้
                            </span>
                          </div>
                        )}
                        <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded text-xs">
                          <strong>หมายเหตุ:</strong>{" "}
                          ข้อมูลนี้เป็นเพียงการวิเคราะห์เบื้องต้น
                          ควรศึกษาข้อมูลเพิ่มเติมและปรึกษาผู้เชี่ยวชาญก่อนตัดสินใจลงทุน
                        </div>
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
                <h3 className="text-lg font-semibold mb-2">
                  ไม่มีข้อมูลพื้นฐาน
                </h3>
                <p className="text-muted-foreground">
                  ไม่สามารถโหลดข้อมูลพื้นฐานของบริษัทได้
                </p>
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
                    <span className="text-muted-foreground">
                      แนวต้าน (Resistance):
                    </span>
                    <div className="font-semibold text-lg text-red-600 dark:text-red-400">
                      ${supportResistance.resistance.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      แนวรับ (Support):
                    </span>
                    <div className="font-semibold text-lg text-green-600 dark:text-green-400">
                      ${supportResistance.support.toFixed(2)}
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-sm text-muted-foreground mb-2">
                      ตำแหน่งราคาปัจจุบัน
                    </div>
                    <Progress
                      value={
                        ((currentPrice - supportResistance.support) /
                          (supportResistance.resistance -
                            supportResistance.support)) *
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
                {rsiData && rsiData.length > 0 ? (
                  <div className="space-y-4">
                    {(() => {
                      const latestRSI = rsiData[rsiData.length - 1];
                      const rsiValue = latestRSI.value;

                      return (
                        <>
                          <div>
                            <div className="text-3xl font-bold">
                              {rsiValue.toFixed(2)}
                            </div>
                            <div
                              className={`text-sm ${
                                rsiValue > 70
                                  ? "text-red-600 dark:text-red-400"
                                  : rsiValue < 30
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {rsiValue > 70
                                ? "Overbought"
                                : rsiValue < 30
                                ? "Oversold"
                                : "Neutral"}
                            </div>
                          </div>
                          <Progress value={rsiValue} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>0 (Oversold)</span>
                            <span>50</span>
                            <span>100 (Overbought)</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-2xl font-bold">N/A</div>
                    <div className="text-sm text-muted-foreground">
                      ไม่มีข้อมูล RSI
                    </div>
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
                {smaData && smaData.length > 0 ? (
                  <div className="space-y-4">
                    {(() => {
                      const latestSMA = smaData[smaData.length - 1];
                      const smaValue = latestSMA.value;
                      const isAboveSMA = currentPrice > smaValue;

                      return (
                        <>
                          <div>
                            <span className="text-muted-foreground">
                              SMA (20 วัน):
                            </span>
                            <div className="font-semibold text-lg">
                              ${smaValue.toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              ราคาปัจจุบัน vs SMA:
                            </span>
                            <div
                              className={`font-semibold ${
                                isAboveSMA
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              {isAboveSMA ? "เหนือค่าเฉลี่ย" : "ใต้ค่าเฉลี่ย"}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              ส่วนต่าง:
                            </span>
                            <div
                              className={`font-semibold ${
                                isAboveSMA
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              {isAboveSMA ? "+" : ""}$
                              {(currentPrice - smaValue).toFixed(2)}(
                              {(
                                ((currentPrice - smaValue) / smaValue) *
                                100
                              ).toFixed(2)}
                              %)
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-lg font-semibold">N/A</div>
                    <div className="text-sm text-muted-foreground">
                      ไม่มีข้อมูล Moving Average
                    </div>
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
                    <div className="font-semibold text-lg">
                      {formatVolume(stockData.regularMarketVolume || 0)}
                    </div>
                  </div>
                  {historicalData &&
                    (() => {
                      const dailyData = historicalData.slice(0, 20);
                      const avgVolume =
                        dailyData.reduce(
                          (sum: number, day: any) => sum + (day.volume || 0),
                          0
                        ) / dailyData.length;
                      const currentVolume = stockData.regularMarketVolume || 0;
                      const volumeRatio = currentVolume / avgVolume;

                      return (
                        <>
                          <div>
                            <span className="text-muted-foreground">
                              ปริมาณเฉลี่ย (20 วัน):
                            </span>
                            <div className="font-semibold">
                              {formatVolume(avgVolume.toString())}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              เปรียบเทียบกับค่าเฉลี่ย:
                            </span>
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
                              {volumeRatio > 1.5
                                ? " (สูงมาก)"
                                : volumeRatio > 1.2
                                ? " (สูง)"
                                : " (ปกติ)"}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Technical Analysis Legend */}
        </TabsContent>
      </Tabs>

      <MetricsLegend />
    </div>
  );
}
