"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { getMarketOverviewAction } from "@/lib/stock-actions";
import type { YahooMarketSummary, APIError } from "@/lib/yahoo-finance";

interface MarketOverviewProps {
  onStockSelect: (symbol: string) => void;
}

export default function MarketOverview({ onStockSelect }: MarketOverviewProps) {
  const [marketData, setMarketData] = useState<YahooMarketSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<APIError | null>(null);
  const [retryCountdown, setRetryCountdown] = useState(0);

  const fetchMarketData = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getMarketOverviewAction();
      if (result.success && result.data) {
        setMarketData(result.data);
      } else if (result.error) {
        setError(result.error);
        // Use mock data as fallback
        setMarketData(generateMockMarketData());
      }
    } catch (err) {
      setError({
        type: "UNKNOWN",
        message: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาลองใหม่อีกครั้ง",
      });
      // Use mock data as fallback
      setMarketData(generateMockMarketData());
    } finally {
      setLoading(false);
    }
  };

  // Generate mock data as fallback
  const generateMockMarketData = (): YahooMarketSummary => {
    const popularStocks = [
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
    ];

    const generateTopGainers = () => {
      return Array.from({ length: 10 }, (_, i) => ({
        symbol: popularStocks[i] || `STOCK${i + 1}`,
        shortName: `Company ${i + 1}`,
        regularMarketPrice: Number.parseFloat(
          (Math.random() * 500 + 50).toFixed(2)
        ),
        regularMarketChange: Number.parseFloat(
          (Math.random() * 15 + 1).toFixed(2)
        ),
        regularMarketChangePercent: Number.parseFloat(
          (Math.random() * 8 + 1).toFixed(2)
        ),
        regularMarketVolume: Math.floor(Math.random() * 10000000 + 1000000),
      })).sort(
        (a, b) => b.regularMarketChangePercent - a.regularMarketChangePercent
      );
    };

    const generateTopLosers = () => {
      return Array.from({ length: 10 }, (_, i) => ({
        symbol: popularStocks[9 - i] || `STOCK${10 - i}`,
        shortName: `Company ${10 - i}`,
        regularMarketPrice: Number.parseFloat(
          (Math.random() * 500 + 50).toFixed(2)
        ),
        regularMarketChange: Number.parseFloat(
          (-(Math.random() * 15 + 1)).toFixed(2)
        ),
        regularMarketChangePercent: Number.parseFloat(
          (-Math.random() * 8 - 1).toFixed(2)
        ),
        regularMarketVolume: Math.floor(Math.random() * 10000000 + 1000000),
      })).sort(
        (a, b) => a.regularMarketChangePercent - b.regularMarketChangePercent
      );
    };

    const generateMostActive = () => {
      return Array.from({ length: 10 }, (_, i) => ({
        symbol: popularStocks[i] || `STOCK${i + 1}`,
        shortName: `Company ${i + 1}`,
        regularMarketPrice: Number.parseFloat(
          (Math.random() * 500 + 50).toFixed(2)
        ),
        regularMarketChange: Number.parseFloat(
          (Math.random() * 20 - 10).toFixed(2)
        ),
        regularMarketChangePercent: Number.parseFloat(
          (Math.random() * 10 - 5).toFixed(2)
        ),
        regularMarketVolume: Math.floor(Math.random() * 50000000 + 10000000),
      })).sort((a, b) => b.regularMarketVolume - a.regularMarketVolume);
    };

    return {
      gainers: generateTopGainers(),
      losers: generateTopLosers(),
      actives: generateMostActive(),
    };
  };

  useEffect(() => {
    fetchMarketData();
  }, []);

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

  const renderStockList = (
    stocks: Array<{
      symbol: string;
      shortName: string;
      regularMarketPrice: number;
      regularMarketChange: number;
      regularMarketChangePercent: number;
      regularMarketVolume: number;
    }>,
    title: string,
    icon: React.ReactNode,
    emptyMessage: string
  ) => {
    if (!stocks || stocks.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-8">
          <div className="text-4xl mb-2">📊</div>
          <p>{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {stocks.slice(0, 5).map((stock, index) => {
          const changeAmount = stock.regularMarketChange;
          const isPositive = changeAmount >= 0;

          return (
            <div
              key={`${stock.symbol}-${title.toLowerCase()}-${index}`}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => onStockSelect(stock.symbol)}
            >
              <div className="flex items-center gap-3">
                <div className="font-bold text-lg">{stock.symbol}</div>
                <div className="text-sm text-muted-foreground">
                  Vol: {stock.regularMarketVolume.toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">
                  ${stock.regularMarketPrice.toFixed(2)}
                </div>
                <div
                  className={`text-sm flex items-center gap-1 ${
                    isPositive
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {stock.regularMarketChangePercent.toFixed(2)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">ภาพรวมตลาดหุ้น</h2>
          <p className="text-muted-foreground">
            กำลังโหลดข้อมูลตลาดหุ้นล่าสุด...
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-0 bg-white/60 dark:bg-slate-900/60">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div
                    key={j}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="text-right space-y-1">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">ภาพรวมตลาดหุ้น</h2>
        <p className="text-muted-foreground">
          {error
            ? "ข้อมูลจำลองสำหรับการทดสอบ"
            : "ข้อมูลตลาดหุ้นล่าสุดจาก Yahoo Finance"}
        </p>
      </div>

      {error && (
        <Alert className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error.message}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchMarketData}
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

      {marketData ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Top Gainers */}
          <Card className="border-0 bg-white/60 dark:bg-slate-900/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <TrendingUp className="h-5 w-5" />
                หุ้นที่ขึ้นมากที่สุด
              </CardTitle>
              <CardDescription>
                หุ้นที่มีการเปลี่ยนแปลงในทางบวกสูงสุด
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderStockList(
                marketData.gainers,
                "gainers",
                <TrendingUp className="h-5 w-5" />,
                "ไม่มีข้อมูลหุ้นที่ขึ้น"
              )}
            </CardContent>
          </Card>

          {/* Top Losers */}
          <Card className="border-0 bg-white/60 dark:bg-slate-900/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <TrendingDown className="h-5 w-5" />
                หุ้นที่ลงมากที่สุด
              </CardTitle>
              <CardDescription>
                หุ้นที่มีการเปลี่ยนแปลงในทางลบสูงสุด
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderStockList(
                marketData.losers,
                "losers",
                <TrendingDown className="h-5 w-5" />,
                "ไม่มีข้อมูลหุ้นที่ลง"
              )}
            </CardContent>
          </Card>

          {/* Most Active */}
          <Card className="border-0 bg-white/60 dark:bg-slate-900/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Activity className="h-5 w-5" />
                หุ้นที่ซื้อขายมากที่สุด
              </CardTitle>
              <CardDescription>หุ้นที่มีปริมาณการซื้อขายสูงสุด</CardDescription>
            </CardHeader>
            <CardContent>
              {renderStockList(
                marketData.actives,
                "actives",
                <Activity className="h-5 w-5" />,
                "ไม่มีข้อมูลหุ้นที่มีการซื้อขายมากที่สุด"
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold mb-2">ไม่มีข้อมูลตลาดหุ้น</h3>
          <p className="mb-4">ไม่สามารถโหลดข้อมูลตลาดหุ้นได้ในขณะนี้</p>
          <Button onClick={fetchMarketData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            ลองใหม่
          </Button>
        </div>
      )}
    </div>
  );
}
