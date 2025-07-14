"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Search,
  TrendingUp,
  BarChart3,
  DollarSign,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import StockDashboard from "@/components/stock-dashboard";
import MarketOverview from "@/components/market-overview";
import { useSearchParams, useRouter } from "next/navigation";
import { formatMarketCap } from "@/lib/yahoo-finance";

const sectorColors: Record<string, string> = {
  Technology: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "Financial Services": "bg-green-500/10 text-green-600 dark:text-green-400",
  Healthcare: "bg-red-500/10 text-red-600 dark:text-red-400",
  "Consumer Discretionary":
    "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  "Consumer Staples": "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  "Communication Services": "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  Energy: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
};

export default function HomePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStock, setSelectedStock] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const stockParam = searchParams.get("stock");

  useEffect(() => {
    if (stockParam && !selectedStock) {
      setSelectedStock(stockParam.toUpperCase());
      setSearchTerm(stockParam.toUpperCase());
    }
  }, [stockParam, selectedStock]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const handleSearch = async (value: string) => {
    setSearchTerm(value);

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (value.length > 1) {
      setIsSearching(true);

      // Set new timeout for debouncing
      const timeout = setTimeout(async () => {
        try {
          const response = await fetch(
            `/api/search-stocks?q=${encodeURIComponent(value)}`
          );
          const data = await response.json();

          if (data.results) {
            setSuggestions(data.results);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setIsSearching(false);
        }
      }, 300); // 300ms delay

      setSearchTimeout(timeout);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
      setIsSearching(false);
    }
  };

  const handleSelectStock = (symbol: string) => {
    setSelectedStock(symbol);
    setSearchTerm(symbol);
    setShowSuggestions(false);

    // อัปเดต URL
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("stock", symbol);
    router.push(newUrl.pathname + newUrl.search, { scroll: false });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm) {
      const symbol = searchTerm.toUpperCase();
      setSelectedStock(symbol);
      setShowSuggestions(false);

      // อัปเดต URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set("stock", symbol);
      router.push(newUrl.pathname + newUrl.search, { scroll: false });
    }
  };

  const handleBackToHome = () => {
    setSelectedStock("");
    setSearchTerm("");
    setShowSuggestions(false);

    // ลบ stock parameter จาก URL
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete("stock");
    router.push(newUrl.pathname, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={handleBackToHome}
          >
            <Image
              src="/logo.png"
              alt="Stocklazer Logo"
              width={32}
              height={32}
              className="h-12 w-12"
            />

            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Stocklazer
              </h1>
              <p className="text-sm text-muted-foreground">
                📈{" "}
                <a
                  href="https://finance.yahoo.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-600"
                >
                  Yahoo Finance
                </a>{" "}
                | 👨‍💻{" "}
                <a
                  href="https://kimookpong.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-600"
                >
                  Hakim Mudor
                </a>
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="container mx-auto p-4">
        {/* Hero Section */}
        {!selectedStock && (
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-full border border-blue-200 dark:border-blue-800 mb-6">
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Real-time US-TH Stock Analysis
              </span>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent mb-4">
              Stocklazer
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              ค้นหาและวิเคราะห์ข้อมูลหุ้นอเมริกาแบบครบครัน
              พร้อมกราฟและข้อมูลทางการเงินที่ละเอียด
            </p>
          </div>
        )}

        {/* Search Section */}
        <Card className="max-w-3xl mx-auto mb-12 shadow-xl border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                <Search className="h-5 w-5 text-white" />
              </div>
              ค้นหาหุ้น
            </CardTitle>
            <CardDescription className="text-base">
              กรอกสัญลักษณ์หุ้น (เช่น AAPL, MSFT)
              หรือชื่อบริษัทเพื่อเริ่มการวิเคราะห์
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="relative">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Input
                    type="text"
                    placeholder="เช่น AAPL หรือ Apple Inc."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => searchTerm && setShowSuggestions(true)}
                    className="h-12 text-lg border-2 focus:border-blue-500 dark:focus:border-blue-400"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                  {suggestions.length === 0 &&
                    !isSearching &&
                    searchTerm.length > 1 && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                        ไม่พบข้อมูลหุ้นที่ตรงกับ "{searchTerm}"
                      </div>
                    )}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-700 rounded-lg shadow-2xl z-[9999] max-h-80 overflow-y-auto mt-1">
                      {suggestions.map((stock, index) => (
                        <button
                          key={index}
                          type="button"
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-slate-800 border-b border-gray-100 dark:border-slate-700 last:border-b-0 transition-colors"
                          onClick={() => handleSelectStock(stock.symbol)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-bold text-lg">
                                {stock.symbol}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {stock.name}
                              </div>
                              {stock.exchange && (
                                <div className="text-xs text-muted-foreground">
                                  {stock.exchange}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              {stock.sector && (
                                <div
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    sectorColors[stock.sector] ||
                                    "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                                  }`}
                                >
                                  {stock.sector}
                                </div>
                              )}
                              {stock.marketCap && (
                                <div className="text-xs text-muted-foreground">
                                  Market Cap: {formatMarketCap(stock.marketCap)}
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Stock Dashboard or Market Overview */}
        {selectedStock ? (
          <StockDashboard symbol={selectedStock} />
        ) : (
          <>
            <MarketOverview onStockSelect={handleSelectStock} />
          </>
        )}
      </div>
    </div>
  );
}
