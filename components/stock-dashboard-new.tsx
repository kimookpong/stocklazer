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
  Calculator,
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

      // Check if any request failed
      if (!quoteResult.success || !historicalResult.success) {
        const error = quoteResult.error || historicalResult.error;
        if (error) {
          setError(error);
        }
      } else {
        // Use real data
        console.log("Fetched company data:", companyResult.data);
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
    } finally {
      setLoading(false);
    }
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
              {companyData?.quote?.longName ||
                companyData?.quote?.shortName ||
                `${symbol} Corporation`}
            </p>
          </div>
        </div>
        <ShareButton
          symbol={symbol}
          companyName={
            companyData?.quote?.longName ||
            companyData?.quote?.shortName ||
            `${symbol} Corporation`
          }
        />
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
              {formatMarketCap(stockData.marketCap)}
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
                      {companyData?.quoteSummary?.summaryProfile
                        ?.longBusinessSummary ||
                        companyData?.quoteSummary?.assetProfile
                          ?.longBusinessSummary ||
                        "ไม่มีข้อมูลคำอธิบาย"}
                    </p>
                  </div>

                  {(companyData?.quoteSummary?.summaryProfile?.sector ||
                    companyData?.quoteSummary?.assetProfile?.sector) && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          ภาคธุรกิจ:
                        </span>
                        <div className="font-semibold">
                          {companyData?.quoteSummary?.summaryProfile?.sector ||
                            companyData?.quoteSummary?.assetProfile?.sector ||
                            "N/A"}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          อุตสาหกรรม:
                        </span>
                        <div className="font-semibold">
                          {companyData?.quoteSummary?.summaryProfile
                            ?.industry ||
                            companyData?.quoteSummary?.assetProfile?.industry ||
                            "N/A"}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Market Cap:</span>
                      <div className="font-semibold">
                        {formatMarketCap(stockData.marketCap)}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">พนักงาน:</span>
                      <div className="font-semibold">
                        {companyData?.quoteSummary?.summaryProfile
                          ?.fullTimeEmployees ||
                        companyData?.quoteSummary?.assetProfile
                          ?.fullTimeEmployees
                          ? (
                              companyData?.quoteSummary?.summaryProfile
                                ?.fullTimeEmployees ||
                              companyData?.quoteSummary?.assetProfile
                                ?.fullTimeEmployees
                            ).toLocaleString()
                          : "N/A"}
                      </div>
                    </div>
                  </div>

                  {(companyData?.quoteSummary?.summaryProfile?.website ||
                    companyData?.quoteSummary?.assetProfile?.website) && (
                    <div>
                      <span className="text-muted-foreground">เว็บไซต์:</span>
                      <div className="font-semibold">
                        <a
                          href={
                            companyData?.quoteSummary?.summaryProfile
                              ?.website ||
                            companyData?.quoteSummary?.assetProfile?.website
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {companyData?.quoteSummary?.summaryProfile?.website ||
                            companyData?.quoteSummary?.assetProfile?.website}
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
                    {/* Key Financial Metrics - Yahoo Finance Data */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h4 className="font-semibold mb-4 text-blue-800 dark:text-blue-200">
                        🔥 ตัวชี้วัดหลักจาก Yahoo Finance
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Revenue Growth */}
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-sm">
                              การเติบโตรายได้
                            </span>
                            {companyData?.quoteSummary?.financialData
                              ?.revenueGrowth !== undefined && (
                              <Badge
                                variant="outline"
                                className={
                                  evaluateRevenueGrowth(
                                    companyData.quoteSummary.financialData
                                      .revenueGrowth
                                  ).color
                                }
                              >
                                {
                                  evaluateRevenueGrowth(
                                    companyData.quoteSummary.financialData
                                      .revenueGrowth
                                  ).level
                                }
                              </Badge>
                            )}
                          </div>
                          <div className="text-xl font-bold">
                            {companyData?.quoteSummary?.financialData
                              ?.revenueGrowth !== undefined
                              ? `${(
                                  companyData.quoteSummary.financialData
                                    .revenueGrowth * 100
                                ).toFixed(1)}%`
                              : "N/A"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Revenue Growth (YoY)
                          </div>
                        </div>

                        {/* Earnings Growth (Profit Growth) */}
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-sm">
                              การเติบโตกำไร
                            </span>
                            {companyData?.quoteSummary?.financialData
                              ?.earningsGrowth !== undefined && (
                              <Badge
                                variant="outline"
                                className={
                                  evaluateRevenueGrowth(
                                    companyData.quoteSummary.financialData
                                      .earningsGrowth
                                  ).color
                                }
                              >
                                {
                                  evaluateRevenueGrowth(
                                    companyData.quoteSummary.financialData
                                      .earningsGrowth
                                  ).level
                                }
                              </Badge>
                            )}
                          </div>
                          <div className="text-xl font-bold">
                            {companyData?.quoteSummary?.financialData
                              ?.earningsGrowth !== undefined
                              ? `${(
                                  companyData.quoteSummary.financialData
                                    .earningsGrowth * 100
                                ).toFixed(1)}%`
                              : "N/A"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Profit Growth (YoY)
                          </div>
                        </div>

                        {/* PS Ratio */}
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-sm">
                              PS Ratio
                            </span>
                            {stockData.marketCap &&
                              companyData?.quoteSummary?.financialData
                                ?.totalRevenue && (
                                <Badge
                                  variant="outline"
                                  className={(() => {
                                    const psRatio =
                                      stockData.marketCap /
                                      companyData.quoteSummary.financialData
                                        .totalRevenue;
                                    return evaluatePSRatio(psRatio).color;
                                  })()}
                                >
                                  {(() => {
                                    const psRatio =
                                      stockData.marketCap /
                                      companyData.quoteSummary.financialData
                                        .totalRevenue;
                                    return evaluatePSRatio(psRatio).level;
                                  })()}
                                </Badge>
                              )}
                          </div>
                          <div className="text-xl font-bold">
                            {stockData.marketCap &&
                            companyData?.quoteSummary?.financialData
                              ?.totalRevenue
                              ? `${(
                                  stockData.marketCap /
                                  companyData.quoteSummary.financialData
                                    .totalRevenue
                                ).toFixed(2)}x`
                              : "N/A"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Price-to-Sales Ratio
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* EPS Analysis */}
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold">EPS (กำไรต่อหุ้น)</span>
                        {(companyData?.quoteSummary?.defaultKeyStatistics
                          ?.trailingEps ||
                          companyData?.quote?.epsTrailingTwelveMonths) && (
                          <Badge
                            variant="outline"
                            className={
                              evaluateEPS(
                                companyData?.quoteSummary?.defaultKeyStatistics
                                  ?.trailingEps ||
                                  companyData?.quote?.epsTrailingTwelveMonths ||
                                  0,
                                companyData?.quoteSummary?.financialData
                                  ?.earningsGrowth
                              ).color
                            }
                          >
                            {
                              evaluateEPS(
                                companyData?.quoteSummary?.defaultKeyStatistics
                                  ?.trailingEps ||
                                  companyData?.quote?.epsTrailingTwelveMonths ||
                                  0,
                                companyData?.quoteSummary?.financialData
                                  ?.earningsGrowth
                              ).level
                            }
                          </Badge>
                        )}
                      </div>
                      <div className="text-2xl font-bold mb-1">
                        $
                        {companyData?.quoteSummary?.defaultKeyStatistics
                          ?.trailingEps ||
                        companyData?.quote?.epsTrailingTwelveMonths
                          ? (
                              companyData?.quoteSummary?.defaultKeyStatistics
                                ?.trailingEps ||
                              companyData?.quote?.epsTrailingTwelveMonths
                            ).toFixed(2)
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
                        {(companyData?.quote?.trailingPE ||
                          companyData?.quoteSummary?.defaultKeyStatistics
                            ?.trailingPE) && (
                          <Badge
                            variant="outline"
                            className={
                              evaluatePERatio(
                                companyData?.quote?.trailingPE ||
                                  companyData?.quoteSummary
                                    ?.defaultKeyStatistics?.trailingPE
                              ).color
                            }
                          >
                            {
                              evaluatePERatio(
                                companyData?.quote?.trailingPE ||
                                  companyData?.quoteSummary
                                    ?.defaultKeyStatistics?.trailingPE
                              ).level
                            }
                          </Badge>
                        )}
                      </div>
                      <div className="text-2xl font-bold mb-1">
                        {companyData?.quote?.trailingPE ||
                        companyData?.quoteSummary?.defaultKeyStatistics
                          ?.trailingPE
                          ? `${(
                              companyData?.quote?.trailingPE ||
                              companyData?.quoteSummary?.defaultKeyStatistics
                                ?.trailingPE
                            ).toFixed(2)}x`
                          : "N/A"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        นักลงทุนยอมจ่ายกี่เท่าของกำไรเพื่อซื้อหุ้น 1 หุ้น -
                        ต่ำอาจหมายถึงหุ้นถูก สูงอาจหมายถึงคาดหวังการเติบโต
                      </div>
                      {(companyData?.quote?.forwardPE ||
                        companyData?.quoteSummary?.defaultKeyStatistics
                          ?.forwardPE) && (
                        <div className="mt-2 text-sm">
                          <span className="text-muted-foreground">
                            Forward P/E:{" "}
                          </span>
                          <span className="font-semibold">
                            {(
                              companyData?.quote?.forwardPE ||
                              companyData?.quoteSummary?.defaultKeyStatistics
                                ?.forwardPE
                            ).toFixed(2)}
                            x
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Additional Ratios Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <span className="text-muted-foreground">ROE:</span>
                          <div className="font-semibold">
                            {companyData?.quoteSummary?.financialData
                              ?.returnOnEquity
                              ? `${(
                                  companyData.quoteSummary.financialData
                                    .returnOnEquity * 100
                                ).toFixed(2)}%`
                              : "N/A"}
                          </div>
                          {companyData?.quoteSummary?.financialData
                            ?.returnOnEquity && (
                            <div className="text-xs text-muted-foreground">
                              {companyData.quoteSummary.financialData
                                .returnOnEquity > 0.15
                                ? "ดีมาก"
                                : companyData.quoteSummary.financialData
                                    .returnOnEquity > 0.1
                                ? "ดี"
                                : "ปานกลาง"}
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            P/B Ratio:
                          </span>
                          <div className="font-semibold">
                            {companyData?.quote?.priceToBook ||
                            companyData?.quoteSummary?.defaultKeyStatistics
                              ?.priceToBook
                              ? (
                                  companyData?.quote?.priceToBook ||
                                  companyData?.quoteSummary
                                    ?.defaultKeyStatistics?.priceToBook
                                ).toFixed(2)
                              : "N/A"}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <span className="text-muted-foreground">Beta:</span>
                          <div className="font-semibold">
                            {companyData?.quote?.beta ||
                            companyData?.quoteSummary?.defaultKeyStatistics
                              ?.beta
                              ? (
                                  companyData?.quote?.beta ||
                                  companyData?.quoteSummary
                                    ?.defaultKeyStatistics?.beta
                                ).toFixed(2)
                              : "N/A"}
                          </div>
                          {(companyData?.quote?.beta ||
                            companyData?.quoteSummary?.defaultKeyStatistics
                              ?.beta) && (
                            <div className="text-xs text-muted-foreground">
                              {(companyData?.quote?.beta ||
                                companyData?.quoteSummary?.defaultKeyStatistics
                                  ?.beta) > 1.2
                                ? "ผันผวนสูง"
                                : (companyData?.quote?.beta ||
                                    companyData?.quoteSummary
                                      ?.defaultKeyStatistics?.beta) < 0.8
                                ? "ผันผวนต่ำ"
                                : "ปกติ"}
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Total Revenue:
                          </span>
                          <div className="font-semibold">
                            {companyData?.quoteSummary?.financialData
                              ?.totalRevenue
                              ? formatMarketCap(
                                  companyData.quoteSummary.financialData
                                    .totalRevenue
                                )
                              : "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Price Targets & Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>เป้าหมายราคาและการวิเคราะห์</CardTitle>
                  <CardDescription>
                    ข้อมูลเป้าหมายราคาจากนักวิเคราะห์และการประเมินมูลค่า
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Price Target Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="text-sm text-green-700 dark:text-green-300 mb-1">
                          เป้าหมายสูงสุด
                        </div>
                        <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                          $
                          {(
                            companyData?.quoteSummary?.financialData
                              ?.targetHighPrice || currentPrice * 1.2
                          ).toFixed(2)}
                        </div>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="text-sm text-blue-700 dark:text-blue-300 mb-1">
                          เป้าหมายเฉลี่ย
                        </div>
                        <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                          $
                          {(
                            companyData?.quoteSummary?.financialData
                              ?.targetMeanPrice || currentPrice * 1.1
                          ).toFixed(2)}
                        </div>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                        <div className="text-sm text-orange-700 dark:text-orange-300 mb-1">
                          เป้าหมายต่ำสุด
                        </div>
                        <div className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                          $
                          {(
                            companyData?.quoteSummary?.financialData
                              ?.targetLowPrice || currentPrice * 0.9
                          ).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Analyst Recommendations */}
                    {companyData?.quoteSummary?.financialData
                      ?.recommendationKey && (
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold">
                            คำแนะนำจากนักวิเคราะห์
                          </span>
                          <Badge
                            variant={
                              companyData.quoteSummary.financialData
                                .recommendationKey === "buy" ||
                              companyData.quoteSummary.financialData
                                .recommendationKey === "strong_buy"
                                ? "default"
                                : companyData.quoteSummary.financialData
                                    .recommendationKey === "hold"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {companyData.quoteSummary.financialData.recommendationKey
                              .toUpperCase()
                              .replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ความเห็นโดยรวมจากนักวิเคราะห์ที่ติดตามหุ้นนี้
                        </div>
                      </div>
                    )}

                    {/* 52-Week Range */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          52 Week High:
                        </span>
                        <div className="font-semibold">
                          $
                          {(
                            companyData?.quote?.fiftyTwoWeekHigh ||
                            stockData.fiftyTwoWeekHigh ||
                            0
                          ).toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          52 Week Low:
                        </span>
                        <div className="font-semibold">
                          $
                          {(
                            companyData?.quote?.fiftyTwoWeekLow ||
                            stockData.fiftyTwoWeekLow ||
                            0
                          ).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* 52-Week Range Visualization */}
                    {companyData?.quote?.fiftyTwoWeekHigh &&
                      companyData?.quote?.fiftyTwoWeekLow && (
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="text-sm text-muted-foreground mb-2">
                            ตำแหน่งราคาในช่วง 52 สัปดาห์
                          </div>
                          <Progress
                            value={
                              ((currentPrice -
                                companyData.quote.fiftyTwoWeekLow) /
                                (companyData.quote.fiftyTwoWeekHigh -
                                  companyData.quote.fiftyTwoWeekLow)) *
                              100
                            }
                            className="h-3"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>
                              ${companyData.quote.fiftyTwoWeekLow.toFixed(2)}
                            </span>
                            <span>
                              ${companyData.quote.fiftyTwoWeekHigh.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
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
                      let rsiLevel = "ปกติ";
                      let rsiColor = "text-yellow-600 dark:text-yellow-400";

                      if (rsiValue > 70) {
                        rsiLevel = "ซื้อมากเกินไป";
                        rsiColor = "text-red-600 dark:text-red-400";
                      } else if (rsiValue < 30) {
                        rsiLevel = "ขายมากเกินไป";
                        rsiColor = "text-green-600 dark:text-green-400";
                      }

                      return (
                        <>
                          <div className="text-center">
                            <div className="text-3xl font-bold mb-2">
                              {rsiValue.toFixed(1)}
                            </div>
                            <div className={`text-sm font-medium ${rsiColor}`}>
                              {rsiLevel}
                            </div>
                          </div>
                          <Progress value={rsiValue} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>0</span>
                            <span>50</span>
                            <span>100</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-muted-foreground">ไม่มีข้อมูล RSI</div>
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
                      const priceVsSMA =
                        ((currentPrice - smaValue) / smaValue) * 100;

                      return (
                        <>
                          <div>
                            <span className="text-muted-foreground">
                              SMA (20):
                            </span>
                            <div className="font-semibold text-lg">
                              ${smaValue.toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              ราคาปัจจุบันเทียบกับ SMA:
                            </span>
                            <div
                              className={`font-semibold ${
                                priceVsSMA > 0
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              {priceVsSMA > 0 ? "+" : ""}
                              {priceVsSMA.toFixed(2)}%
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-muted-foreground">
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
                    <span className="text-muted-foreground">
                      ปริมาณการซื้อขายวันนี้:
                    </span>
                    <div className="font-semibold text-lg">
                      {formatVolume(stockData.regularMarketVolume || 0)}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      ปริมาณการซื้อขายเฉลี่ย (3 เดือน):
                    </span>
                    <div className="font-semibold">
                      {formatVolume(stockData.averageDailyVolume3Month || 0)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Investment Analysis Summary */}
      <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/30">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            ผลการวิเคราะห์และพิจารณา
          </CardTitle>
          <CardDescription>
            สรุปผลการประเมินตามเกณฑ์มาตรฐานและข้อเสนอแนะการลงทุน
          </CardDescription>
        </CardHeader>
        <CardContent>
          {companyData && (
            <div className="space-y-6">
              {/* Overall Investment Score */}
              <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border">
                <h4 className="font-semibold mb-3">สรุปการประเมินโดยรวม</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">
                      การเติบโตรายได้:
                    </span>
                    <div
                      className={
                        companyData?.quoteSummary?.financialData?.revenueGrowth
                          ? evaluateRevenueGrowth(
                              companyData.quoteSummary.financialData
                                .revenueGrowth
                            ).color
                          : "text-gray-500"
                      }
                    >
                      {companyData?.quoteSummary?.financialData?.revenueGrowth
                        ? evaluateRevenueGrowth(
                            companyData.quoteSummary.financialData.revenueGrowth
                          ).level
                        : "N/A"}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      การประเมินราคา (P/E):
                    </span>
                    <div
                      className={
                        companyData?.quote?.trailingPE ||
                        companyData?.quoteSummary?.defaultKeyStatistics
                          ?.trailingPE
                          ? evaluatePERatio(
                              companyData?.quote?.trailingPE ||
                                companyData?.quoteSummary?.defaultKeyStatistics
                                  ?.trailingPE
                            ).color
                          : "text-gray-500"
                      }
                    >
                      {companyData?.quote?.trailingPE ||
                      companyData?.quoteSummary?.defaultKeyStatistics
                        ?.trailingPE
                        ? evaluatePERatio(
                            companyData?.quote?.trailingPE ||
                              companyData?.quoteSummary?.defaultKeyStatistics
                                ?.trailingPE
                          ).level
                        : "N/A"}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      คำแนะนำนักวิเคราะห์:
                    </span>
                    <div className="font-semibold">
                      {companyData?.quoteSummary?.financialData
                        ?.recommendationKey
                        ? companyData.quoteSummary.financialData.recommendationKey
                            .toUpperCase()
                            .replace("_", " ")
                        : "N/A"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Investment Recommendation */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">คำแนะนำการลงทุน</h4>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>
                    การลงทุนในตลาดหุ้นมีความเสี่ยง
                    ผู้ลงทุนควรศึกษาข้อมูลอย่างละเอียดและพิจารณาความเสี่ยงที่สามารถรับได้
                  </p>
                  <p>
                    ข้อมูลที่แสดงเป็นเพียงการวิเคราะห์เบื้องต้น
                    ไม่ใช่คำแนะนำการลงทุน ควรปรึกษาที่ปรึกษาการลงทุนก่อนตัดสินใจ
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <MetricsLegend />
    </div>
  );
}
