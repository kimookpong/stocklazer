import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

// Fallback data สำหรับกรณีที่ API มีปัญหา
function getFallbackResults(query: string) {
  const fallbackStocks = [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      sector: "Technology",
      exchange: "NASDAQ",
      marketCap: 3000000000000,
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corporation",
      sector: "Technology",
      exchange: "NASDAQ",
      marketCap: 2800000000000,
    },
    {
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      sector: "Technology",
      exchange: "NASDAQ",
      marketCap: 1700000000000,
    },
    {
      symbol: "MSTY",
      name: "YieldMax MSTR Option Income Strategy ETF",
      sector: "ETF",
      exchange: "NYSE",
      marketCap: 500000000,
    },
    {
      symbol: "SCB",
      name: "Siam Commercial Bank Public Company Limited",
      sector: "Financial Services",
      exchange: "SET",
      marketCap: null,
    },
  ];

  const lowerQuery = query.toLowerCase();
  return fallbackStocks.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(lowerQuery) ||
      stock.name.toLowerCase().includes(lowerQuery)
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.length < 1) {
    return NextResponse.json({ results: [] });
  }

  try {
    console.log("Searching for:", query);

    // เพิ่ม timeout และ retry mechanism
    let searchResults;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        // ใช้ Yahoo Finance search function พร้อม timeout
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Request timeout")), 10000)
        );

        const searchPromise = yahooFinance.search(query, {
          newsCount: 0,
          enableFuzzyQuery: true,
        });

        searchResults = await Promise.race([searchPromise, timeoutPromise]);
        break; // สำเร็จแล้ว ออกจาก retry loop
      } catch (retryError) {
        retryCount++;
        console.log(`Retry ${retryCount}/${maxRetries} failed:`, retryError);

        if (retryCount >= maxRetries) {
          throw retryError;
        }

        // รอ 1 วินาทีก่อน retry
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log("Raw search results:", JSON.stringify(searchResults, null, 2));

    // ตรวจสอบว่ามี quotes หรือไม่
    if (
      !searchResults ||
      !(searchResults as any)?.quotes ||
      !Array.isArray((searchResults as any).quotes)
    ) {
      console.log("No quotes found in search results");

      // ใส่ fallback data สำหรับกรณีที่ไม่พบข้อมูล
      const fallbackResults = getFallbackResults(query);
      if (fallbackResults.length > 0) {
        console.log("Using fallback data:", fallbackResults);
        return NextResponse.json({ results: fallbackResults });
      }

      return NextResponse.json({ results: [] });
    }

    const quotes = (searchResults as any).quotes;
    console.log("Number of quotes found:", quotes.length);

    // แสดงข้อมูล exchange ทั้งหมดที่พบ
    const exchanges = quotes
      .map((quote: any) => quote.exchange)
      .filter(Boolean);
    console.log("Available exchanges:", [...new Set(exchanges)]);

    // Filter หุ้นที่มี symbol และเป็น equity (ไม่จำกัด exchange ในตอนแรกเพื่อ debug)
    const filteredQuotes = quotes.filter((quote: any) => {
      // รองรับ exchange หลากหลายมากขึ้น
      const validExchanges = [
        "NYQ", // NYSE (US)
        "NMS", // NASDAQ (US)
        "SET", // SET (Thailand)
        "BKK", // Thailand
        "THA", // Thailand
        "ASE", // AMEX
        "PCX", // NYSE Arca
        "BTS", // BATS
        "NGM", // NASDAQ Global Market
        "NIM", // NASDAQ Global Select
        "YHD", // Yahoo Finance
        "", // Some results might have empty exchange
        null, // Some results might have null exchange
      ];

      const hasSymbol = quote.symbol && quote.symbol.length > 0;
      const isValidExchange =
        !quote.exchange || validExchanges.includes(quote.exchange);

      console.log(
        `Quote ${quote.symbol}: exchange=${quote.exchange}, hasSymbol=${hasSymbol}, isValidExchange=${isValidExchange}`
      );

      return hasSymbol && isValidExchange;
    });

    console.log("Filtered quotes count:", filteredQuotes.length);

    // Filter เฉพาะหุ้นที่เป็น equity และ US market
    const stocks = filteredQuotes
      .filter((quote: any) => quote.symbol)
      .map((quote: any) => ({
        symbol: quote.symbol,
        name: quote.longname || quote.shortname || quote.symbol,
        sector: quote.sector || "Unknown",
        exchange: quote.exchange,
        marketCap: quote.marketCap,
      })); // จำกัดที่ 10 รายการ

    console.log("Final stocks result:", stocks);
    return NextResponse.json({ results: stocks });
  } catch (error) {
    console.error("Search error details:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );
    console.error(
      "Error message:",
      error instanceof Error ? error.message : String(error)
    );

    // ใช้ fallback data สำหรับกรณีที่ Yahoo Finance API มีปัญหา
    console.log("Yahoo Finance API failed, using fallback data");
    const fallbackResults = getFallbackResults(query);

    if (fallbackResults.length > 0) {
      console.log("Returning fallback results:", fallbackResults);
      return NextResponse.json({
        results: fallbackResults,
        source: "fallback",
      });
    }

    // ถ้าไม่มี fallback data ให้ return error
    return NextResponse.json(
      {
        error: "Failed to search stocks",
        details: error instanceof Error ? error.message : String(error),
        query: query,
      },
      { status: 500 }
    );
  }
}
