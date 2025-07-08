"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search, TrendingUp, BarChart3, DollarSign, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import StockDashboard from "@/components/stock-dashboard"
import MarketOverview from "@/components/market-overview"
import { useSearchParams, useRouter } from "next/navigation"

// Popular US stocks for autocomplete suggestions
const popularStocks = [
  { symbol: "AAPL", name: "Apple Inc.", sector: "Technology" },
  { symbol: "MSFT", name: "Microsoft Corporation", sector: "Technology" },
  { symbol: "GOOGL", name: "Alphabet Inc.", sector: "Technology" },
  { symbol: "AMZN", name: "Amazon.com Inc.", sector: "Consumer Discretionary" },
  { symbol: "TSLA", name: "Tesla Inc.", sector: "Consumer Discretionary" },
  { symbol: "META", name: "Meta Platforms Inc.", sector: "Technology" },
  { symbol: "NVDA", name: "NVIDIA Corporation", sector: "Technology" },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", sector: "Financial Services" },
  { symbol: "JNJ", name: "Johnson & Johnson", sector: "Healthcare" },
  { symbol: "V", name: "Visa Inc.", sector: "Financial Services" },
  { symbol: "PG", name: "Procter & Gamble Co.", sector: "Consumer Staples" },
  { symbol: "UNH", name: "UnitedHealth Group Inc.", sector: "Healthcare" },
  { symbol: "HD", name: "Home Depot Inc.", sector: "Consumer Discretionary" },
  { symbol: "MA", name: "Mastercard Inc.", sector: "Financial Services" },
  { symbol: "BAC", name: "Bank of America Corp.", sector: "Financial Services" },
  { symbol: "DIS", name: "Walt Disney Co.", sector: "Communication Services" },
  { symbol: "ADBE", name: "Adobe Inc.", sector: "Technology" },
  { symbol: "CRM", name: "Salesforce Inc.", sector: "Technology" },
  { symbol: "NFLX", name: "Netflix Inc.", sector: "Communication Services" },
  { symbol: "XOM", name: "Exxon Mobil Corp.", sector: "Energy" },
]

const sectorColors: Record<string, string> = {
  Technology: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "Financial Services": "bg-green-500/10 text-green-600 dark:text-green-400",
  Healthcare: "bg-red-500/10 text-red-600 dark:text-red-400",
  "Consumer Discretionary": "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  "Consumer Staples": "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  "Communication Services": "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  Energy: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
}

export default function HomePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStock, setSelectedStock] = useState("")
  const [suggestions, setSuggestions] = useState<typeof popularStocks>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const stockParam = searchParams.get("stock")

  useEffect(() => {
    if (stockParam && !selectedStock) {
      setSelectedStock(stockParam.toUpperCase())
      setSearchTerm(stockParam.toUpperCase())
    }
  }, [stockParam, selectedStock])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    if (value.length > 0) {
      const filtered = popularStocks.filter(
        (stock) =>
          stock.symbol.toLowerCase().includes(value.toLowerCase()) ||
          stock.name.toLowerCase().includes(value.toLowerCase()),
      )
      setSuggestions(filtered)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  const handleSelectStock = (symbol: string) => {
    setSelectedStock(symbol)
    setSearchTerm(symbol)
    setShowSuggestions(false)

    // อัปเดต URL
    const newUrl = new URL(window.location.href)
    newUrl.searchParams.set("stock", symbol)
    router.push(newUrl.pathname + newUrl.search, { scroll: false })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm) {
      const symbol = searchTerm.toUpperCase()
      setSelectedStock(symbol)
      setShowSuggestions(false)

      // อัปเดต URL
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.set("stock", symbol)
      router.push(newUrl.pathname + newUrl.search, { scroll: false })
    }
  }

  const handleBackToHome = () => {
    setSelectedStock("")
    setSearchTerm("")
    setShowSuggestions(false)

    // ลบ stock parameter จาก URL
    const newUrl = new URL(window.location.href)
    newUrl.searchParams.delete("stock")
    router.push(newUrl.pathname, { scroll: false })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleBackToHome}>
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Stock Analyzer
              </h1>
              <p className="text-sm text-muted-foreground">Professional Stock Analysis</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        {!selectedStock && (
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-full border border-blue-200 dark:border-blue-800 mb-6">
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Real-time US Stock Analysis</span>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent mb-4">
              US Stock Analyzer
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              ค้นหาและวิเคราะห์ข้อมูลหุ้นอเมริกาแบบครบครัน พร้อมกราฟและข้อมูลทางการเงินที่ละเอียด
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
              กรอกสัญลักษณ์หุ้น (เช่น AAPL, MSFT) หรือชื่อบริษัทเพื่อเริ่มการวิเคราะห์
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
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-700 rounded-lg shadow-2xl z-10 max-h-80 overflow-y-auto mt-1">
                      {suggestions.map((stock) => (
                        <button
                          key={stock.symbol}
                          type="button"
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-slate-800 border-b border-gray-100 dark:border-slate-700 last:border-b-0 transition-colors"
                          onClick={() => handleSelectStock(stock.symbol)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-bold text-lg">{stock.symbol}</div>
                              <div className="text-sm text-muted-foreground">{stock.name}</div>
                            </div>
                            <div
                              className={`px-2 py-1 rounded-full text-xs font-medium ${sectorColors[stock.sector] || "bg-gray-100 text-gray-600"}`}
                            >
                              {stock.sector}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="h-12 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Search className="h-4 w-4 mr-2" />
                  ค้นหา
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Stock Dashboard or Market Overview */}
        {selectedStock ? (
          <StockDashboard symbol={selectedStock} />
        ) : (
          <>
            {/* Market Overview */}
            <MarketOverview onStockSelect={handleSelectStock} />

            {/* Popular Stocks Section */}
            <div className="mt-16">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-semibold mb-6 text-slate-800 dark:text-slate-200">หุ้นยอดนิยม</h3>
                <p className="text-muted-foreground">คลิกเพื่อดูการวิเคราะห์โดยละเอียด</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 max-w-6xl mx-auto">
                {popularStocks.slice(0, 15).map((stock) => (
                  <Card
                    key={stock.symbol}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm"
                    onClick={() => handleSelectStock(stock.symbol)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="font-bold text-lg mb-1">{stock.symbol}</div>
                      <div className="text-xs text-muted-foreground mb-2 line-clamp-2">{stock.name}</div>
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium ${sectorColors[stock.sector] || "bg-gray-100 text-gray-600"}`}
                      >
                        {stock.sector}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Features Section */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Card className="text-center border-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl w-fit mx-auto mb-4">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">กราฟราคาหุ้น</h3>
                  <p className="text-muted-foreground">กราฟราคาหุ้นย้อนหลัง 5 ปี พร้อมข้อมูลการเปลี่ยนแปลงแบบเรียลไทม์</p>
                </CardContent>
              </Card>

              <Card className="text-center border-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl w-fit mx-auto mb-4">
                    <DollarSign className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">ข้อมูลทางการเงิน</h3>
                  <p className="text-muted-foreground">EPS, PE Ratio, PS Ratio และอัตราการเติบโตของรายได้และกำไร</p>
                </CardContent>
              </Card>

              <Card className="text-center border-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl w-fit mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">การวิเคราะห์</h3>
                  <p className="text-muted-foreground">อัตราปันผลและการวิเคราะห์แนวโน้มการเติบโตของบริษัท</p>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
