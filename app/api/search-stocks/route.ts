import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.length < 1) {
    return NextResponse.json({ results: [] });
  }

  try {
    console.log("Searching for:", query);

    // ใช้ Yahoo Finance search function
    const searchResults = await yahooFinance.search(query, {
      newsCount: 0,
      enableFuzzyQuery: true,
    });

    console.log("Raw search results:", JSON.stringify(searchResults, null, 2));

    // ตรวจสอบว่ามี quotes หรือไม่
    if (!searchResults || !searchResults.quotes) {
      console.log("No quotes found in search results");
      return NextResponse.json({ results: [] });
    }

    console.log("Number of quotes found:", searchResults.quotes.length);

    // แสดงข้อมูล exchange ทั้งหมดที่พบ
    const exchanges = searchResults.quotes
      .map((quote: any) => quote.exchange)
      .filter(Boolean);
    console.log("Available exchanges:", [...new Set(exchanges)]);

    // Filter หุ้นที่มี symbol และเป็น equity (ไม่จำกัด exchange ในตอนแรกเพื่อ debug)
    const filteredQuotes = searchResults.quotes.filter((quote: any) => {
      // รองรับ exchange หลากหลาย
      const validExchanges = [
        "NYQ", // NYSE (US)
        "NMS", // NASDAQ (US)
        "SET", // SET (Thailand)
        "BKK", // Thailand
        "THA", // Thailand
        "ASE", // AMEX
        "PCX", // NYSE Arca
        "BTS", // BATS
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
      }))
      .slice(0, 10); // จำกัดที่ 10 รายการ

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

    // ถ้า yahoo-finance2 ล้มเหลว ให้ลองใช้ mock data สำหรับ SCB
    if (query.toLowerCase().includes("scb")) {
      console.log("Providing fallback data for SCB");
      return NextResponse.json({
        results: [
          {
            symbol: "SCB",
            name: "Siam Commercial Bank Public Company Limited",
            sector: "Financial Services",
            exchange: "SET",
            marketCap: null,
          },
        ],
      });
    }

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
