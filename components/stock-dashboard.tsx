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
  DollarSign,
  Target,
  Users,
  Building,
  MapPin,
  ExternalLink,
  CheckCircle,
  XCircle,
  Info,
  Star,
  Calendar,
  Search,
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
    if (yield_ < 2)
      return { level: "ต่ำ", color: "text-yellow-600 dark:text-yellow-400" };
    if (yield_ <= 4)
      return { level: "ปานกลาง", color: "text-green-600 dark:text-green-400" };
    if (yield_ <= 6)
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
            <CardContent className="p-0">
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
              {/* Company Information */}
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

              {/* รายได้และการเติบโต (Revenue & Growth) */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    รายได้และการเติบโต
                  </CardTitle>
                  <CardDescription>
                    การวิเคราะห์รายได้และการเติบโตของบริษัท
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Total Revenue */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-sm text-muted-foreground">
                            รายได้รวม (TTM)
                          </h4>
                          <div className="text-2xl font-bold">
                            {companyData?.quoteSummary?.financialData
                              ?.totalRevenue
                              ? `$${(
                                  companyData.quoteSummary.financialData
                                    .totalRevenue / 1e9
                                ).toFixed(2)}B`
                              : "N/A"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            รายได้ในรอบ 12 เดือนที่ผ่านมา (จาก Yahoo Finance)
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* P/S Ratio */}
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                        P/S Ratio (อัตราส่วนราคาต่อยอดขาย)
                      </h4>
                      <div className="text-2xl font-bold">
                        {companyData?.quote?.priceToSalesTrailing12Months
                          ? companyData.quote.priceToSalesTrailing12Months.toFixed(
                              2
                            )
                          : "N/A"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ราคาหุ้นเทียบกับยอดขายต่อหุ้น -
                        เฉพาะสำหรับบริษัทที่มีกำไรโดยไม่มีขาดทุน
                      </div>
                    </div>

                    {/* Growth Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <h5 className="font-medium text-sm mb-1">
                          การเติบโตรายได้ (YoY)
                        </h5>
                        <div
                          className={`text-lg font-bold ${
                            companyData?.quoteSummary?.financialData
                              ?.revenueGrowth
                              ? evaluateRevenueGrowth(
                                  companyData.quoteSummary.financialData
                                    .revenueGrowth
                                ).color
                              : "text-gray-500"
                          }`}
                        >
                          {companyData?.quoteSummary?.financialData
                            ?.revenueGrowth
                            ? `${(
                                companyData.quoteSummary.financialData
                                  .revenueGrowth * 100
                              ).toFixed(2)}%`
                            : "N/A"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          อัตราการเติบโตรายได้ต่อปี
                        </div>
                      </div>

                      <div className="p-3 bg-muted/50 rounded-lg">
                        <h5 className="font-medium text-sm mb-1">
                          การเติบโตกำไร (Earnings Growth)
                        </h5>
                        <div
                          className={`text-lg font-bold ${
                            companyData?.quoteSummary?.financialData
                              ?.earningsGrowth
                              ? companyData.quoteSummary.financialData
                                  .earningsGrowth > 0
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                              : "text-gray-500"
                          }`}
                        >
                          {companyData?.quoteSummary?.financialData
                            ?.earningsGrowth
                            ? `${(
                                companyData.quoteSummary.financialData
                                  .earningsGrowth * 100
                              ).toFixed(2)}%`
                            : "N/A"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          อัตราการเติบโตกำไรต่อปี
                        </div>
                      </div>
                    </div>

                    {/* Quarterly Growth */}
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <h5 className="font-medium text-sm mb-1">
                        การเติบโตรายได้ (Quarterly)
                      </h5>
                      <div
                        className={`text-lg font-bold ${
                          companyData?.quoteSummary?.financialData
                            ?.revenueQuarterlyGrowth
                            ? companyData.quoteSummary.financialData
                                .revenueQuarterlyGrowth > 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                            : "text-gray-500"
                        }`}
                      >
                        {companyData?.quoteSummary?.financialData
                          ?.revenueQuarterlyGrowth
                          ? `${(
                              companyData.quoteSummary.financialData
                                .revenueQuarterlyGrowth * 100
                            ).toFixed(2)}%`
                          : "N/A"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        อัตราการเติบโตรายได้ในรอบไตรมาสล่าสุด
                      </div>
                    </div>

                    {/* Dividend Section */}
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        ข้อมูลปันผล
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-800">
                          <h5 className="font-medium text-sm mb-1">
                            อัตราผลตอบแทนปันผล
                          </h5>
                          <div
                            className={`text-lg font-bold ${
                              companyData?.quoteSummary?.summaryDetail
                                ?.dividendYield
                                ? evaluateDividendYield(
                                    companyData.quoteSummary.summaryDetail
                                      .dividendYield
                                  ).color
                                : "text-gray-500"
                            }`}
                          >
                            {companyData?.quoteSummary?.summaryDetail
                              ?.dividendYield
                              ? `${companyData.quoteSummary.summaryDetail.dividendYield.toFixed(
                                  2
                                )}%`
                              : "N/A"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Dividend Yield (TTM)
                          </div>
                        </div>

                        <div className="p-3 bg-muted/50 rounded-lg">
                          <h5 className="font-medium text-sm mb-1">
                            อัตราส่วนการจ่ายปันผล
                          </h5>
                          <div className="text-lg font-bold">
                            {companyData?.quoteSummary?.summaryDetail
                              ?.payoutRatio
                              ? `${(
                                  companyData.quoteSummary.summaryDetail
                                    .payoutRatio * 100
                                ).toFixed(2)}%`
                              : "N/A"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Payout Ratio
                          </div>
                        </div>

                        <div className="p-3 bg-muted/50 rounded-lg">
                          <h5 className="font-medium text-sm mb-1">
                            ความถี่การจ่ายปันผล
                          </h5>
                          <div className="text-lg font-bold">
                            {companyData?.quoteSummary?.calendarEvents
                              ?.dividendDate
                              ? "ไตรมาส"
                              : "N/A"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ความถี่ในการจ่าย
                          </div>
                        </div>

                        <div className="p-3 bg-muted/50 rounded-lg">
                          <h5 className="font-medium text-sm mb-1">
                            วันที่จ่ายปันผลล่าสุด
                          </h5>
                          <div className="text-lg font-bold">
                            {companyData?.quoteSummary?.calendarEvents
                              ?.dividendDate
                              ? new Date(
                                  companyData.quoteSummary.calendarEvents
                                    .dividendDate * 1000
                                ).toLocaleDateString("th-TH")
                              : "N/A"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Last Payment Date
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>ข้อมูลทางการเงิน</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Valuation Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-sm">
                          P/E Ratio (อัตราส่วนราคาต่อกำไร)
                        </span>
                        {stockData.regularMarketPrice &&
                          companyData?.quote?.trailingEps && (
                            <Badge
                              variant="outline"
                              className={(() => {
                                const peRatio =
                                  stockData.regularMarketPrice /
                                  companyData.quote.trailingEps;
                                return evaluatePERatio(peRatio).color;
                              })()}
                            >
                              {(() => {
                                const peRatio =
                                  stockData.regularMarketPrice /
                                  companyData.quote.trailingEps;
                                return evaluatePERatio(peRatio).level;
                              })()}
                            </Badge>
                          )}
                      </div>
                      <div className="text-2xl font-bold mb-1">
                        {stockData.regularMarketPrice &&
                        companyData?.quote?.trailingEps
                          ? `${(
                              stockData.regularMarketPrice /
                              companyData.quote.trailingEps
                            ).toFixed(2)}x`
                          : "N/A"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ราคาหุ้นเทียบกับกำไรต่อหุ้น -
                        ใช้ประเมินความคุ้มค่าของหุ้น
                      </div>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-sm">
                          P/S Ratio (อัตราส่วนราคาต่อยอดขาย)
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
                      <div className="text-2xl font-bold mb-1">
                        {stockData.marketCap &&
                        companyData?.quoteSummary?.financialData?.totalRevenue
                          ? `${(
                              stockData.marketCap /
                              companyData.quoteSummary.financialData
                                .totalRevenue
                            ).toFixed(2)}x`
                          : "N/A"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ราคาหุ้นเทียบกับยอดขายต่อหุ้น -
                        เหมาะสำหรับประเมินบริษัทที่ยังไม่มีกำไรแต่มีรายได้เติบโต
                      </div>
                    </div>
                  </div>

                  {/* Dividend Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-sm">
                          อัตราผลตอบแทนปันผล
                        </span>
                        {companyData?.quote?.dividendYield && (
                          <Badge
                            variant="outline"
                            className={
                              evaluateDividendYield(
                                companyData.quote.dividendYield
                              ).color
                            }
                          >
                            {
                              evaluateDividendYield(
                                companyData.quote.dividendYield
                              ).level
                            }
                          </Badge>
                        )}
                      </div>
                      <div className="text-2xl font-bold mb-1">
                        {companyData?.quote?.dividendYield
                          ? `${companyData.quote.dividendYield.toFixed(2)}%`
                          : "N/A"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Dividend Yield (TTM)
                      </div>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-sm">
                          อัตราส่วนการจ่ายปันผล
                        </span>
                        {companyData?.quoteSummary?.defaultKeyStatistics
                          ?.payoutRatio && (
                          <Badge
                            variant="outline"
                            className={
                              companyData.quoteSummary.defaultKeyStatistics
                                .payoutRatio > 0.8
                                ? "text-red-600"
                                : companyData.quoteSummary.defaultKeyStatistics
                                    .payoutRatio > 0.6
                                ? "text-yellow-600"
                                : "text-green-600"
                            }
                          >
                            {`${(
                              companyData.quoteSummary.defaultKeyStatistics
                                .payoutRatio * 100
                            ).toFixed(1)}%`}
                          </Badge>
                        )}
                      </div>
                      <div className="text-2xl font-bold mb-1">
                        {companyData?.quoteSummary?.defaultKeyStatistics
                          ?.payoutRatio
                          ? `${(
                              companyData.quoteSummary.defaultKeyStatistics
                                .payoutRatio * 100
                            ).toFixed(2)}%`
                          : "N/A"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Payout Ratio
                      </div>
                    </div>
                  </div>

                  {/* Profitability Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-sm">
                          Profit Margin
                        </span>
                      </div>
                      <div className="text-xl font-bold mb-1">
                        {companyData?.quoteSummary?.financialData?.profitMargins
                          ? `${(
                              companyData.quoteSummary.financialData
                                .profitMargins * 100
                            ).toFixed(2)}%`
                          : "N/A"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        อัตรากำไรสุทธิ
                      </div>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-sm">
                          Operating Margin
                        </span>
                      </div>
                      <div className="text-xl font-bold mb-1">
                        {companyData?.quoteSummary?.financialData
                          ?.operatingMargins
                          ? `${(
                              companyData.quoteSummary.financialData
                                .operatingMargins * 100
                            ).toFixed(2)}%`
                          : "N/A"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        อัตรากำไรจากการดำเนินงาน
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
                    การวิเคราะห์เป้าหมายราคาและความคิดเห็นนักวิเคราะห์
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Price Target Summary */}
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold">
                          เป้าหมายราคา (เฉลี่ย)
                        </span>
                        {companyData?.quoteSummary?.priceTarget?.avg && (
                          <Badge variant="outline" className="text-blue-600">
                            {`$${companyData.quoteSummary.priceTarget.avg.toFixed(
                              2
                            )}`}
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            เป้าหมายสูงสุด:
                          </span>
                          <div className="font-semibold">
                            {companyData?.quoteSummary?.priceTarget?.high
                              ? `$${companyData.quoteSummary.priceTarget.high.toFixed(
                                  2
                                )}`
                              : "N/A"}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            เป้าหมายต่ำสุด:
                          </span>
                          <div className="font-semibold">
                            {companyData?.quoteSummary?.priceTarget?.low
                              ? `$${companyData.quoteSummary.priceTarget.low.toFixed(
                                  2
                                )}`
                              : "N/A"}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            จำนวนความคิดเห็น:
                          </span>
                          <div className="font-semibold">
                            {companyData?.quoteSummary?.priceTarget?.count
                              ? companyData.quoteSummary.priceTarget.count
                              : "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Analyst Recommendations */}
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold">
                          คำแนะนำจากนักวิเคราะห์
                        </span>
                        {companyData?.quoteSummary?.financialData
                          ?.recommendationKey && (
                          <Badge
                            variant="outline"
                            className={
                              companyData.quoteSummary.financialData
                                .recommendationKey === "buy"
                                ? "text-green-600"
                                : companyData.quoteSummary.financialData
                                    .recommendationKey === "sell"
                                ? "text-red-600"
                                : "text-yellow-600"
                            }
                          >
                            {
                              companyData.quoteSummary.financialData
                                .recommendationKey
                            }
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {companyData?.quoteSummary?.financialData
                          ?.recommendationDescription || "ไม่มีข้อมูลคำแนะนำ"}
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
              {(() => {
                // Calculate investment score based on MetricsLegend criteria
                const calculateScore = () => {
                  let totalScore = 0;
                  let scores = {} as any;
                  const strengths = [];
                  const concerns = [];

                  // Revenue Growth (20% weight)
                  const revenueGrowth =
                    companyData?.quoteSummary?.financialData?.revenueGrowth;
                  if (revenueGrowth !== undefined) {
                    if (revenueGrowth > 0.2) {
                      scores.revenueGrowth = 100;
                      strengths.push("การเติบโตรายได้สูงมาก (>20%)");
                    } else if (revenueGrowth > 0.1) {
                      scores.revenueGrowth = 80;
                      strengths.push("การเติบโตรายได้ดี (10-20%)");
                    } else if (revenueGrowth > 0.05) {
                      scores.revenueGrowth = 60;
                    } else {
                      scores.revenueGrowth = 20;
                      concerns.push("การเติบโตรายได้ต่ำ (<5%)");
                    }
                    totalScore += scores.revenueGrowth * 0.2;
                  }

                  // Profit Growth (20% weight)
                  const earningsGrowth =
                    companyData?.quoteSummary?.financialData?.earningsGrowth;
                  if (earningsGrowth !== undefined) {
                    if (earningsGrowth > 0.15) {
                      scores.profitGrowth = 100;
                      strengths.push("การเติบโตกำไรสูงมาก (>15%)");
                    } else if (earningsGrowth > 0.05) {
                      scores.profitGrowth = 80;
                      strengths.push("การเติบโตกำไรดี (5-15%)");
                    } else if (earningsGrowth > 0) {
                      scores.profitGrowth = 60;
                    } else {
                      scores.profitGrowth = 20;
                      concerns.push("กำไรลดลง");
                    }
                    totalScore += scores.profitGrowth * 0.2;
                  }

                  // PE Ratio (20% weight)
                  const peRatio =
                    companyData?.quote?.trailingPE ||
                    companyData?.quoteSummary?.defaultKeyStatistics?.trailingPE;
                  if (peRatio !== undefined) {
                    if (peRatio < 15) {
                      scores.peRatio = 90;
                      strengths.push("ราคาถูกเมื่อเทียบกับกำไร (PE < 15)");
                    } else if (peRatio <= 25) {
                      scores.peRatio = 80;
                      strengths.push("ราคาเหมาะสม (PE 15-25)");
                    } else if (peRatio <= 40) {
                      scores.peRatio = 50;
                    } else {
                      scores.peRatio = 20;
                      concerns.push("ราคาแพงมากเทียบกับกำไร (PE > 40)");
                    }
                    totalScore += scores.peRatio * 0.2;
                  }

                  // PS Ratio (15% weight)
                  const psRatio =
                    companyData?.quote?.priceToSalesTrailing12Months ||
                    (stockData.marketCap &&
                    companyData?.quoteSummary?.financialData?.totalRevenue
                      ? stockData.marketCap /
                        companyData.quoteSummary.financialData.totalRevenue
                      : undefined);
                  if (psRatio !== undefined) {
                    if (psRatio < 2) {
                      scores.psRatio = 90;
                      strengths.push("ราคาถูกเมื่อเทียบกับยอดขาย (PS < 2)");
                    } else if (psRatio <= 5) {
                      scores.psRatio = 80;
                    } else if (psRatio <= 10) {
                      scores.psRatio = 50;
                    } else {
                      scores.psRatio = 20;
                      concerns.push("ราคาแพงมากเทียบกับยอดขาย (PS > 10)");
                    }
                    totalScore += scores.psRatio * 0.15;
                  }

                  // EPS (15% weight)
                  const eps = companyData?.quote?.trailingEps;
                  if (eps !== undefined) {
                    if (eps > 5) {
                      scores.eps = 100;
                      strengths.push("กำไรต่อหุ้นสูง (>$5)");
                    } else if (eps > 2) {
                      scores.eps = 80;
                      strengths.push("กำไรต่อหุ้นดี ($2-5)");
                    } else if (eps > 0) {
                      scores.eps = 60;
                    } else {
                      scores.eps = 0;
                      concerns.push("บริษัทขาดทุน");
                    }
                    totalScore += scores.eps * 0.15;
                  }

                  // Dividend Yield (10% weight)
                  const dividendYield =
                    companyData?.quoteSummary?.summaryDetail?.dividendYield ||
                    companyData?.quote?.dividendYield;
                  if (dividendYield !== undefined) {
                    if (dividendYield >= 4 && dividendYield <= 6) {
                      scores.dividend = 85;
                      strengths.push("อัตราปันผลดี (4-6%)");
                    } else if (dividendYield >= 2 && dividendYield < 4) {
                      scores.dividend = 75;
                      strengths.push("อัตราปันผลปานกลาง (2-4%)");
                    } else if (dividendYield < 2) {
                      scores.dividend = 70;
                    } else {
                      scores.dividend = 40;
                      concerns.push(
                        "อัตราปันผลสูงมาก (>6%) - ควรตรวจสอบความยั่งยืน"
                      );
                    }
                    totalScore += scores.dividend * 0.1;
                  }

                  return { totalScore, scores, strengths, concerns };
                };

                const { totalScore, scores, strengths, concerns } =
                  calculateScore();

                // Determine recommendation
                let recommendation = "ไม่แนะนำ";
                let recommendationColor = "text-red-600 dark:text-red-400";
                let recommendationIcon = "❌";

                if (totalScore >= 80) {
                  recommendation = "แนะนำซื้อขอ";
                  recommendationColor =
                    "text-emerald-600 dark:text-emerald-400";
                  recommendationIcon = "🚀";
                } else if (totalScore >= 60) {
                  recommendation = "พิจารณาซื้อ";
                  recommendationColor = "text-blue-600 dark:text-blue-400";
                  recommendationIcon = "📈";
                } else if (totalScore >= 40) {
                  recommendation = "รอดูก่อน";
                  recommendationColor = "text-yellow-600 dark:text-yellow-400";
                  recommendationIcon = "⚡";
                }

                return (
                  <>
                    {/* Investment Score */}
                    <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-lg border border-indigo-200 dark:border-indigo-800">
                      <div className="text-center mb-4">
                        <div className="text-4xl font-bold mb-2">
                          <span className={recommendationColor}>
                            {totalScore.toFixed(0)}%
                          </span>
                        </div>
                        <div
                          className={`text-lg font-semibold ${recommendationColor} flex items-center justify-center gap-2`}
                        >
                          <span className="text-2xl">{recommendationIcon}</span>
                          {recommendation}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          คะแนนการลงทุนโดยรวม
                        </div>
                      </div>

                      {/* Score Breakdown */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                        {scores.revenueGrowth !== undefined && (
                          <div className="p-2 bg-white/50 dark:bg-slate-800/50 rounded">
                            <div className="font-medium">การเติบโตรายได้</div>
                            <div className="text-blue-600 font-semibold">
                              {scores.revenueGrowth}/100 (20%)
                            </div>
                          </div>
                        )}
                        {scores.profitGrowth !== undefined && (
                          <div className="p-2 bg-white/50 dark:bg-slate-800/50 rounded">
                            <div className="font-medium">การเติบโตกำไร</div>
                            <div className="text-blue-600 font-semibold">
                              {scores.profitGrowth}/100 (20%)
                            </div>
                          </div>
                        )}
                        {scores.peRatio !== undefined && (
                          <div className="p-2 bg-white/50 dark:bg-slate-800/50 rounded">
                            <div className="font-medium">ความคุ้มค่า (PE)</div>
                            <div className="text-blue-600 font-semibold">
                              {scores.peRatio}/100 (20%)
                            </div>
                          </div>
                        )}
                        {scores.psRatio !== undefined && (
                          <div className="p-2 bg-white/50 dark:bg-slate-800/50 rounded">
                            <div className="font-medium">ความคุ้มค่า (PS)</div>
                            <div className="text-blue-600 font-semibold">
                              {scores.psRatio}/100 (15%)
                            </div>
                          </div>
                        )}
                        {scores.eps !== undefined && (
                          <div className="p-2 bg-white/50 dark:bg-slate-800/50 rounded">
                            <div className="font-medium">กำไรต่อหุ้น</div>
                            <div className="text-blue-600 font-semibold">
                              {scores.eps}/100 (15%)
                            </div>
                          </div>
                        )}
                        {scores.dividend !== undefined && (
                          <div className="p-2 bg-white/50 dark:bg-slate-800/50 rounded">
                            <div className="font-medium">อัตราปันผล</div>
                            <div className="text-blue-600 font-semibold">
                              {scores.dividend}/100 (10%)
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Strengths and Concerns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Strengths */}
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-800">
                        <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          จุดแข็ง
                        </h4>
                        {strengths.length > 0 ? (
                          <ul className="space-y-2 text-sm text-green-700 dark:text-green-300">
                            {strengths.map((strength, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <span className="text-green-500 mt-0.5">✓</span>
                                {strength}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-sm text-green-600 dark:text-green-400 italic">
                            ไม่พบจุดแข็งที่โดดเด่น
                          </div>
                        )}
                      </div>

                      {/* Concerns */}
                      <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 rounded-lg border border-red-200 dark:border-red-800">
                        <h4 className="font-semibold text-red-800 dark:text-red-200 mb-3 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          จุดที่ควรระวัง
                        </h4>
                        {concerns.length > 0 ? (
                          <ul className="space-y-2 text-sm text-red-700 dark:text-red-300">
                            {concerns.map((concern, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <span className="text-red-500 mt-0.5">⚠</span>
                                {concern}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-sm text-red-600 dark:text-red-400 italic">
                            ไม่พบจุดที่ควรกังวลอย่างมาก
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                );
              })()}

              {/* Summary Information */}
              <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border">
                <h4 className="font-semibold mb-3">ข้อมูลสรุปอื่น ๆ</h4>
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
                        ? `${(
                            companyData.quoteSummary.financialData
                              .revenueGrowth * 100
                          ).toFixed(2)}%`
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
                        ? `${(
                            companyData?.quote?.trailingPE ||
                            companyData?.quoteSummary?.defaultKeyStatistics
                              ?.trailingPE
                          ).toFixed(2)}x`
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
