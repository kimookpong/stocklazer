import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.length < 1) {
    return NextResponse.json({ results: [] });
  }

  try {
    // ใช้ Yahoo Finance search function
    const searchResults = await yahooFinance.search(query, {
      quotesCount: 15, // จำกัดผลลัพธ์ที่ 15 รายการ
      newsCount: 0, // ไม่ต้องการข่าว
    });

    // Filter เฉพาะหุ้นที่เป็น US หรือ THAI market
    searchResults.quotes = searchResults.quotes.filter(
      (quote: any) =>
        quote.exchange === "NYQ" || // NYSE (US)
        quote.exchange === "NMS" || // NASDAQ (US)
        quote.exchange === "THA" // SET (Thailand)
    );

    // Filter เฉพาะหุ้นที่เป็น equity และ US market
    const stocks = searchResults.quotes
      .filter((quote: any) => quote.symbol)
      .map((quote: any) => ({
        symbol: quote.symbol,
        name: quote.longname || quote.shortname || quote.symbol,
        sector: quote.sector || "Unknown",
        exchange: quote.exchange,
        marketCap: quote.marketCap,
      }))
      .slice(0, 10); // จำกัดที่ 10 รายการ

    return NextResponse.json({ results: stocks });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search stocks" },
      { status: 500 }
    );
  }
}
