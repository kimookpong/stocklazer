import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Stocklazer - US Stock Analyzer",
    short_name: "Stocklazer",
    description:
      "US Stock Analyzer ค้นหาและวิเคราะห์ข้อมูลหุ้นอเมริกาแบบครบครัน พร้อมกราฟและข้อมูลทางการเงินที่ละเอียด",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#3b82f6",
    icons: [
      {
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    categories: ["finance", "business", "productivity"],
    orientation: "portrait-primary",
    scope: "/",
    lang: "th-TH",
  };
}
